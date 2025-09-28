// 실시간 채팅 시스템
import {
  ref,
  push,
  set,
  get,
  update,
  onValue,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt
} from 'firebase/database';
import { database, isFirebaseConnected } from '../../config/firebase-config.js';
import { listenerManager } from '../../api/realtime-firebase.js';
import { notificationService, NOTIFICATION_TYPES } from '../../services/notification-service.js';

// 메시지 타입 정의
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  TYPING: 'typing'
};

// 채팅방 타입 정의
export const CHAT_ROOM_TYPES = {
  ONE_ON_ONE: 'one_on_one',
  GROUP: 'group',
  EXPERT_CONSULTATION: 'expert_consultation',
  COMMUNITY: 'community'
};

// 사용자 상태
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

class ChatSystem {
  constructor() {
    this.currentUser = null;
    this.activeRooms = new Map();
    this.typingTimeouts = new Map();
    this.connectionStatus = 'disconnected';
    this.messageQueue = [];
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;

    this.init();
  }

  async init() {
    if (!isFirebaseConnected()) {
      console.warn('Firebase가 연결되지 않음. 채팅 시스템을 모킹 모드로 실행합니다.');
      return;
    }

    // 연결 상태 모니터링
    this.setupConnectionMonitoring();

    console.log('💬 채팅 시스템 초기화됨');
  }

  // === 연결 관리 ===

  setupConnectionMonitoring() {
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val();
      this.connectionStatus = connected ? 'connected' : 'disconnected';

      if (connected) {
        console.log('💬 채팅 서버 연결됨');
        this.retryAttempts = 0;
        this.processMessageQueue();
      } else {
        console.warn('💬 채팅 서버 연결 끊어짐');
      }
    });
  }

  async processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`처리할 메시지 ${this.messageQueue.length}개`);

    for (const queuedMessage of this.messageQueue) {
      try {
        await this.sendMessage(
          queuedMessage.roomId,
          queuedMessage.content,
          queuedMessage.type
        );
      } catch (error) {
        console.error('큐된 메시지 전송 실패:', error);
      }
    }

    this.messageQueue = [];
  }

  // === 사용자 관리 ===

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      this.setUserPresence(user.id, USER_STATUS.ONLINE);
    }
  }

  async setUserPresence(userId, status, metadata = {}) {
    if (!isFirebaseConnected()) return;

    try {
      const userPresenceRef = ref(database, `chat_presence/${userId}`);
      await set(userPresenceRef, {
        status,
        lastSeen: serverTimestamp(),
        metadata,
        ...metadata
      });
    } catch (error) {
      console.error('사용자 상태 설정 오류:', error);
    }
  }

  // === 채팅방 관리 ===

  async createChatRoom(participants, roomType = CHAT_ROOM_TYPES.ONE_ON_ONE, metadata = {}) {
    if (!isFirebaseConnected()) return null;

    try {
      const roomsRef = ref(database, 'chat_rooms');
      const newRoomRef = push(roomsRef);

      const roomData = {
        id: newRoomRef.key,
        type: roomType,
        participants: participants.reduce((acc, userId) => {
          acc[userId] = {
            joinedAt: serverTimestamp(),
            role: userId === this.currentUser?.id ? 'admin' : 'member'
          };
          return acc;
        }, {}),
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        messageCount: 0,
        ...metadata
      };

      await set(newRoomRef, roomData);

      console.log(`채팅방 생성됨: ${newRoomRef.key}`);
      return { id: newRoomRef.key, ...roomData };
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      return null;
    }
  }

  async joinChatRoom(roomId, userId) {
    if (!isFirebaseConnected()) return false;

    try {
      const participantRef = ref(database, `chat_rooms/${roomId}/participants/${userId}`);
      await set(participantRef, {
        joinedAt: serverTimestamp(),
        role: 'member'
      });

      // 시스템 메시지 추가
      await this.sendSystemMessage(roomId, `${userId}님이 채팅방에 입장했습니다.`);

      return true;
    } catch (error) {
      console.error('채팅방 입장 오류:', error);
      return false;
    }
  }

  async leaveChatRoom(roomId, userId) {
    if (!isFirebaseConnected()) return false;

    try {
      const participantRef = ref(database, `chat_rooms/${roomId}/participants/${userId}`);
      await set(participantRef, null);

      // 시스템 메시지 추가
      await this.sendSystemMessage(roomId, `${userId}님이 채팅방을 나갔습니다.`);

      // 활성 룸에서 제거
      this.activeRooms.delete(roomId);

      return true;
    } catch (error) {
      console.error('채팅방 나가기 오류:', error);
      return false;
    }
  }

  // === 메시지 관리 ===

  async sendMessage(roomId, content, type = MESSAGE_TYPES.TEXT, metadata = {}) {
    if (!this.currentUser) {
      console.error('로그인이 필요합니다.');
      return null;
    }

    // 연결이 끊어진 경우 큐에 추가
    if (this.connectionStatus === 'disconnected') {
      this.messageQueue.push({ roomId, content, type, metadata });
      console.log('메시지가 큐에 추가됨');
      return null;
    }

    if (!isFirebaseConnected()) {
      console.warn('Firebase 연결 없음');
      return null;
    }

    try {
      const messagesRef = ref(database, `chat_messages/${roomId}`);
      const newMessageRef = push(messagesRef);

      const messageData = {
        id: newMessageRef.key,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        content,
        type,
        timestamp: serverTimestamp(),
        edited: false,
        reactions: {},
        ...metadata
      };

      await set(newMessageRef, messageData);

      // 채팅방 마지막 활동 시간 업데이트
      await this.updateRoomActivity(roomId);

      // 참가자들에게 알림 전송
      await this.notifyParticipants(roomId, messageData);

      console.log(`메시지 전송됨: ${roomId}`);
      return { id: newMessageRef.key, ...messageData };
    } catch (error) {
      console.error('메시지 전송 오류:', error);

      // 재시도 로직
      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        console.log(`메시지 전송 재시도 중... (${this.retryAttempts}/${this.maxRetryAttempts})`);

        setTimeout(() => {
          this.sendMessage(roomId, content, type, metadata);
        }, 1000 * this.retryAttempts);
      }

      return null;
    }
  }

  async sendSystemMessage(roomId, message) {
    return this.sendMessage(roomId, message, MESSAGE_TYPES.SYSTEM, {
      senderId: 'system',
      senderName: 'System'
    });
  }

  async editMessage(roomId, messageId, newContent) {
    if (!isFirebaseConnected()) return false;

    try {
      const messageRef = ref(database, `chat_messages/${roomId}/${messageId}`);
      await update(messageRef, {
        content: newContent,
        edited: true,
        editedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('메시지 수정 오류:', error);
      return false;
    }
  }

  async deleteMessage(roomId, messageId) {
    if (!isFirebaseConnected()) return false;

    try {
      const messageRef = ref(database, `chat_messages/${roomId}/${messageId}`);
      await set(messageRef, null);
      return true;
    } catch (error) {
      console.error('메시지 삭제 오류:', error);
      return false;
    }
  }

  // === 실시간 메시지 수신 ===

  subscribeToRoom(roomId, callback) {
    if (!isFirebaseConnected()) {
      console.warn('Firebase 연결 없음');
      return null;
    }

    try {
      const messagesRef = ref(database, `chat_messages/${roomId}`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

      const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const data = snapshot.val();
        const messages = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) : [];

        // 시간순으로 정렬
        messages.sort((a, b) => a.timestamp - b.timestamp);

        callback(messages);
      }, (error) => {
        console.error(`채팅방 ${roomId} 구독 오류:`, error);
        callback([]);
      });

      const listenerKey = `chat_room_${roomId}`;
      listenerManager.addListener(listenerKey, unsubscribe);
      this.activeRooms.set(roomId, { unsubscribe, callback });

      return () => listenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('채팅방 구독 설정 오류:', error);
      return null;
    }
  }

  unsubscribeFromRoom(roomId) {
    const listenerKey = `chat_room_${roomId}`;
    listenerManager.removeListener(listenerKey);
    this.activeRooms.delete(roomId);
  }

  // === 타이핑 표시 ===

  async startTyping(roomId) {
    if (!this.currentUser || !isFirebaseConnected()) return;

    try {
      const typingRef = ref(database, `chat_typing/${roomId}/${this.currentUser.id}`);
      await set(typingRef, {
        name: this.currentUser.name,
        timestamp: serverTimestamp()
      });

      // 자동으로 타이핑 상태 제거 (5초 후)
      if (this.typingTimeouts.has(roomId)) {
        clearTimeout(this.typingTimeouts.get(roomId));
      }

      const timeoutId = setTimeout(() => {
        this.stopTyping(roomId);
      }, 5000);

      this.typingTimeouts.set(roomId, timeoutId);
    } catch (error) {
      console.error('타이핑 상태 설정 오류:', error);
    }
  }

  async stopTyping(roomId) {
    if (!this.currentUser || !isFirebaseConnected()) return;

    try {
      const typingRef = ref(database, `chat_typing/${roomId}/${this.currentUser.id}`);
      await set(typingRef, null);

      if (this.typingTimeouts.has(roomId)) {
        clearTimeout(this.typingTimeouts.get(roomId));
        this.typingTimeouts.delete(roomId);
      }
    } catch (error) {
      console.error('타이핑 상태 해제 오류:', error);
    }
  }

  subscribeToTyping(roomId, callback) {
    if (!isFirebaseConnected()) return null;

    try {
      const typingRef = ref(database, `chat_typing/${roomId}`);

      const unsubscribe = onValue(typingRef, (snapshot) => {
        const data = snapshot.val();
        const typingUsers = data ? Object.keys(data)
          .filter(userId => userId !== this.currentUser?.id)
          .map(userId => data[userId]) : [];

        callback(typingUsers);
      });

      const listenerKey = `typing_${roomId}`;
      listenerManager.addListener(listenerKey, unsubscribe);

      return () => listenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('타이핑 상태 구독 오류:', error);
      return null;
    }
  }

  // === 참가자 관리 ===

  subscribeToParticipants(roomId, callback) {
    if (!isFirebaseConnected()) return null;

    try {
      const participantsRef = ref(database, `chat_rooms/${roomId}/participants`);

      const unsubscribe = onValue(participantsRef, (snapshot) => {
        const data = snapshot.val();
        const participants = data ? Object.keys(data).map(userId => ({
          id: userId,
          ...data[userId]
        })) : [];

        callback(participants);
      });

      const listenerKey = `participants_${roomId}`;
      listenerManager.addListener(listenerKey, unsubscribe);

      return () => listenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('참가자 목록 구독 오류:', error);
      return null;
    }
  }

  // === 알림 관리 ===

  async notifyParticipants(roomId, message) {
    if (!isFirebaseConnected()) return;

    try {
      // 채팅방 참가자 목록 가져오기
      const participantsRef = ref(database, `chat_rooms/${roomId}/participants`);
      const snapshot = await get(participantsRef);
      const participants = snapshot.val();

      if (!participants) return;

      // 메시지 발신자를 제외한 모든 참가자에게 알림
      const recipientIds = Object.keys(participants)
        .filter(userId => userId !== message.senderId);

      for (const recipientId of recipientIds) {
        await notificationService.createNotification(recipientId, {
          type: NOTIFICATION_TYPES.NEW_MESSAGE,
          title: `${message.senderName}님의 메시지`,
          message: message.content.substring(0, 100),
          data: {
            roomId,
            messageId: message.id,
            senderId: message.senderId,
            senderName: message.senderName
          },
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('참가자 알림 오류:', error);
    }
  }

  // === 유틸리티 메서드 ===

  async updateRoomActivity(roomId) {
    if (!isFirebaseConnected()) return;

    try {
      const roomRef = ref(database, `chat_rooms/${roomId}/lastActivity`);
      await set(roomRef, serverTimestamp());

      const messageCountRef = ref(database, `chat_rooms/${roomId}/messageCount`);
      const snapshot = await get(messageCountRef);
      const currentCount = snapshot.val() || 0;
      await set(messageCountRef, currentCount + 1);
    } catch (error) {
      console.error('채팅방 활동 업데이트 오류:', error);
    }
  }

  async getChatHistory(roomId, limit = 50, beforeTimestamp = null) {
    if (!isFirebaseConnected()) return [];

    try {
      const messagesRef = ref(database, `chat_messages/${roomId}`);
      let messagesQuery;

      if (beforeTimestamp) {
        messagesQuery = query(
          messagesRef,
          orderByChild('timestamp'),
          endAt(beforeTimestamp),
          limitToLast(limit)
        );
      } else {
        messagesQuery = query(
          messagesRef,
          orderByChild('timestamp'),
          limitToLast(limit)
        );
      }

      const snapshot = await get(messagesQuery);
      const data = snapshot.val();

      if (!data) return [];

      const messages = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));

      messages.sort((a, b) => a.timestamp - b.timestamp);
      return messages;
    } catch (error) {
      console.error('채팅 히스토리 로드 오류:', error);
      return [];
    }
  }

  async searchMessages(roomId, query, limit = 20) {
    const messages = await this.getChatHistory(roomId, 200);

    return messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase()) ||
      message.senderName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
  }

  // === 청리 메서드 ===

  cleanup() {
    // 모든 활성 룸에서 구독 해제
    this.activeRooms.forEach((room, roomId) => {
      this.unsubscribeFromRoom(roomId);
    });

    // 타이핑 타임아웃 정리
    this.typingTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.typingTimeouts.clear();

    // 사용자 상태를 오프라인으로 설정
    if (this.currentUser) {
      this.setUserPresence(this.currentUser.id, USER_STATUS.OFFLINE);
    }

    console.log('💬 채팅 시스템 정리됨');
  }

  // === 디버깅 메서드 ===

  getDebugInfo() {
    return {
      currentUser: this.currentUser?.name || 'None',
      activeRooms: this.activeRooms.size,
      connectionStatus: this.connectionStatus,
      queuedMessages: this.messageQueue.length,
      typingTimeouts: this.typingTimeouts.size
    };
  }
}

// 싱글톤 인스턴스 생성
export const chatSystem = new ChatSystem();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  chatSystem.cleanup();
});

// 전역에서 접근 가능하도록 설정 (디버깅용)
if (typeof window !== 'undefined') {
  window.chatSystem = chatSystem;
}