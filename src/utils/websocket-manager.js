// WebSocket 연결 관리자
class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.eventListeners = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = 30000; // 30초
    this.heartbeatTimeouts = new Map();
    this.isEnabled = true;

    // 페이지 가시성 API 지원 확인
    this.visibilityChangeEvent = this.getVisibilityChangeEvent();

    this.init();
  }

  init() {
    // 페이지 가시성 변경 이벤트 처리
    if (this.visibilityChangeEvent) {
      document.addEventListener(this.visibilityChangeEvent, () => {
        this.handleVisibilityChange();
      });
    }

    // 네트워크 상태 변경 이벤트 처리
    window.addEventListener('online', () => {
      console.log('🌐 네트워크 연결됨');
      this.handleNetworkReconnect();
    });

    window.addEventListener('offline', () => {
      console.log('🌐 네트워크 연결 끊어짐');
      this.handleNetworkDisconnect();
    });

    console.log('🔌 WebSocket 관리자 초기화됨');
  }

  // === 연결 관리 ===

  connect(endpoint, options = {}) {
    const {
      id = endpoint,
      protocols = [],
      autoReconnect = true,
      heartbeat = true,
      onOpen = null,
      onMessage = null,
      onClose = null,
      onError = null
    } = options;

    if (this.connections.has(id)) {
      console.warn(`WebSocket 연결 ${id}가 이미 존재합니다.`);
      return this.connections.get(id);
    }

    try {
      const ws = new WebSocket(endpoint, protocols);
      const connectionInfo = {
        ws,
        endpoint,
        id,
        autoReconnect,
        heartbeat,
        status: 'connecting',
        lastPing: null,
        lastPong: null
      };

      // 이벤트 리스너 설정
      ws.onopen = (event) => {
        console.log(`✅ WebSocket 연결됨: ${id}`);
        connectionInfo.status = 'connected';
        this.reconnectAttempts.set(id, 0);

        if (heartbeat) {
          this.startHeartbeat(id);
        }

        if (onOpen) onOpen(event);
        this.emit('connect', { id, event });
      };

      ws.onmessage = (event) => {
        const data = this.parseMessage(event.data);

        // 하트비트 응답 처리
        if (data.type === 'pong') {
          connectionInfo.lastPong = Date.now();
          return;
        }

        if (onMessage) onMessage(data, event);
        this.emit('message', { id, data, event });
      };

      ws.onclose = (event) => {
        console.log(`❌ WebSocket 연결 끊어짐: ${id}`, event.code, event.reason);
        connectionInfo.status = 'disconnected';

        if (heartbeat) {
          this.stopHeartbeat(id);
        }

        if (onClose) onClose(event);
        this.emit('disconnect', { id, event });

        // 자동 재연결
        if (autoReconnect && this.isEnabled && !event.wasClean) {
          this.scheduleReconnect(id, endpoint, options);
        } else {
          this.connections.delete(id);
        }
      };

      ws.onerror = (event) => {
        console.error(`❌ WebSocket 오류: ${id}`, event);
        connectionInfo.status = 'error';

        if (onError) onError(event);
        this.emit('error', { id, event });
      };

      this.connections.set(id, connectionInfo);
      return connectionInfo;

    } catch (error) {
      console.error(`WebSocket 연결 실패: ${id}`, error);
      return null;
    }
  }

  disconnect(id, code = 1000, reason = 'Manual disconnect') {
    const connection = this.connections.get(id);
    if (!connection) {
      console.warn(`WebSocket 연결 ${id}를 찾을 수 없습니다.`);
      return false;
    }

    try {
      if (connection.heartbeat) {
        this.stopHeartbeat(id);
      }

      connection.ws.close(code, reason);
      this.connections.delete(id);
      this.reconnectAttempts.delete(id);

      console.log(`🔌 WebSocket 연결 해제됨: ${id}`);
      return true;
    } catch (error) {
      console.error(`WebSocket 연결 해제 실패: ${id}`, error);
      return false;
    }
  }

  disconnectAll() {
    const connectionIds = Array.from(this.connections.keys());
    connectionIds.forEach(id => this.disconnect(id));
    console.log('🔌 모든 WebSocket 연결 해제됨');
  }

  // === 메시지 전송 ===

  send(id, data) {
    const connection = this.connections.get(id);
    if (!connection) {
      console.warn(`WebSocket 연결 ${id}를 찾을 수 없습니다.`);
      return false;
    }

    if (connection.status !== 'connected') {
      console.warn(`WebSocket ${id}가 연결되지 않았습니다. 상태: ${connection.status}`);
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      connection.ws.send(message);
      return true;
    } catch (error) {
      console.error(`메시지 전송 실패: ${id}`, error);
      return false;
    }
  }

  broadcast(data, excludeIds = []) {
    let successCount = 0;
    const totalConnections = this.connections.size;

    this.connections.forEach((connection, id) => {
      if (!excludeIds.includes(id) && this.send(id, data)) {
        successCount++;
      }
    });

    console.log(`📡 브로드캐스트 완료: ${successCount}/${totalConnections}`);
    return successCount;
  }

  // === 재연결 관리 ===

  scheduleReconnect(id, endpoint, options) {
    const attempts = this.reconnectAttempts.get(id) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`최대 재연결 시도 초과: ${id}`);
      this.connections.delete(id);
      this.emit('reconnectFailed', { id, attempts });
      return;
    }

    const delay = this.calculateReconnectDelay(attempts);
    console.log(`🔄 ${delay}ms 후 재연결 시도: ${id} (${attempts + 1}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.isEnabled) {
        this.reconnectAttempts.set(id, attempts + 1);
        this.connections.delete(id); // 기존 연결 정보 제거
        this.connect(endpoint, options);
      }
    }, delay);
  }

  calculateReconnectDelay(attempts) {
    // 지수 백오프: 1초, 2초, 4초, 8초, 16초
    return Math.min(this.reconnectDelay * Math.pow(2, attempts), 30000);
  }

  // === 하트비트 관리 ===

  startHeartbeat(id) {
    if (this.heartbeatTimeouts.has(id)) {
      this.stopHeartbeat(id);
    }

    const intervalId = setInterval(() => {
      this.sendHeartbeat(id);
    }, this.heartbeatInterval);

    this.heartbeatTimeouts.set(id, intervalId);
  }

  stopHeartbeat(id) {
    const intervalId = this.heartbeatTimeouts.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.heartbeatTimeouts.delete(id);
    }
  }

  sendHeartbeat(id) {
    const connection = this.connections.get(id);
    if (!connection || connection.status !== 'connected') {
      return;
    }

    const now = Date.now();
    connection.lastPing = now;

    this.send(id, {
      type: 'ping',
      timestamp: now
    });

    // Pong 응답 타임아웃 설정 (10초)
    setTimeout(() => {
      if (connection.lastPong < connection.lastPing) {
        console.warn(`하트비트 응답 없음: ${id}`);
        this.disconnect(id, 1000, 'Heartbeat timeout');
      }
    }, 10000);
  }

  // === 이벤트 시스템 ===

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`이벤트 리스너 오류 (${event}):`, error);
        }
      });
    }
  }

  // === 유틸리티 메서드 ===

  parseMessage(message) {
    try {
      return JSON.parse(message);
    } catch (error) {
      return { type: 'text', data: message };
    }
  }

  getConnectionStatus(id) {
    const connection = this.connections.get(id);
    return connection ? connection.status : 'not_connected';
  }

  getActiveConnections() {
    const active = [];
    this.connections.forEach((connection, id) => {
      if (connection.status === 'connected') {
        active.push({
          id,
          endpoint: connection.endpoint,
          lastPing: connection.lastPing,
          lastPong: connection.lastPong
        });
      }
    });
    return active;
  }

  getDebugInfo() {
    return {
      totalConnections: this.connections.size,
      activeConnections: this.getActiveConnections().length,
      heartbeatTimeouts: this.heartbeatTimeouts.size,
      isEnabled: this.isEnabled,
      reconnectAttempts: Object.fromEntries(this.reconnectAttempts)
    };
  }

  // === 페이지 가시성 관리 ===

  getVisibilityChangeEvent() {
    if (typeof document.hidden !== 'undefined') {
      return 'visibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      return 'webkitvisibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
      return 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      return 'msvisibilitychange';
    }
    return null;
  }

  isPageVisible() {
    if (typeof document.hidden !== 'undefined') {
      return !document.hidden;
    } else if (typeof document.webkitHidden !== 'undefined') {
      return !document.webkitHidden;
    } else if (typeof document.mozHidden !== 'undefined') {
      return !document.mozHidden;
    } else if (typeof document.msHidden !== 'undefined') {
      return !document.msHidden;
    }
    return true;
  }

  handleVisibilityChange() {
    if (this.isPageVisible()) {
      console.log('📱 페이지가 활성화됨');
      this.handlePageActive();
    } else {
      console.log('📱 페이지가 비활성화됨');
      this.handlePageInactive();
    }
  }

  handlePageActive() {
    // 페이지가 활성화될 때 연결 상태 확인 및 재연결
    this.connections.forEach((connection, id) => {
      if (connection.status === 'disconnected' && connection.autoReconnect) {
        this.connect(connection.endpoint, {
          id,
          autoReconnect: connection.autoReconnect,
          heartbeat: connection.heartbeat
        });
      }
    });
  }

  handlePageInactive() {
    // 페이지가 비활성화될 때 하트비트 간격 조정 (배터리 절약)
    // 실제 구현에서는 하트비트 간격을 늘리거나 일시 중단할 수 있음
  }

  // === 네트워크 상태 관리 ===

  handleNetworkReconnect() {
    // 네트워크가 복구되면 모든 연결 재시도
    this.connections.forEach((connection, id) => {
      if (connection.status !== 'connected' && connection.autoReconnect) {
        this.connect(connection.endpoint, {
          id,
          autoReconnect: connection.autoReconnect,
          heartbeat: connection.heartbeat
        });
      }
    });
  }

  handleNetworkDisconnect() {
    // 네트워크가 끊어지면 모든 연결 상태를 disconnected로 변경
    this.connections.forEach((connection) => {
      if (connection.status === 'connected') {
        connection.status = 'disconnected';
      }
    });
  }

  // === 정리 메서드 ===

  enable() {
    this.isEnabled = true;
    console.log('🔌 WebSocket 관리자 활성화됨');
  }

  disable() {
    this.isEnabled = false;
    this.disconnectAll();
    console.log('🔌 WebSocket 관리자 비활성화됨');
  }

  cleanup() {
    this.disable();

    // 모든 하트비트 타이머 정리
    this.heartbeatTimeouts.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.heartbeatTimeouts.clear();

    // 이벤트 리스너 정리
    this.eventListeners.clear();

    console.log('🔌 WebSocket 관리자 정리됨');
  }
}

// 싱글톤 인스턴스 생성
export const wsManager = new WebSocketManager();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  wsManager.cleanup();
});

// 전역에서 접근 가능하도록 설정 (디버깅용)
if (typeof window !== 'undefined') {
  window.wsManager = wsManager;
}

export default WebSocketManager;