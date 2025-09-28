// 실시간 알림 서비스
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
  limitToLast
} from 'firebase/database';
import { database, isFirebaseConnected } from '../config/firebase.js';
import { listenerManager } from "@services/realtime-firebase.js";

// 알림 타입 정의
export const NOTIFICATION_TYPES = {
  NEW_ANSWER: 'new_answer',
  ANSWER_ACCEPTED: 'answer_accepted',
  QUESTION_LIKED: 'question_liked',
  ANSWER_LIKED: 'answer_liked',
  MENTION: 'mention',
  FOLLOW: 'follow',
  EXPERT_RESPONSE: 'expert_response',
  SYSTEM: 'system'
};

// 알림 우선순위
export const NOTIFICATION_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.subscribers = new Map();
    this.unreadCount = 0;
    this.soundEnabled = true;
    this.vibrationEnabled = true;

    // 알림음 로드
    this.notificationSound = new Audio('/sounds/notification.mp3');
    this.notificationSound.volume = 0.5;

    this.init();
  }

  async init() {
    // 브라우저 알림 권한 확인
    if (this.isSupported && this.permission === 'default') {
      await this.requestPermission();
    }

    // 설정 로드
    await this.loadSettings();

    console.log('🔔 알림 서비스 초기화됨');
  }

  // === 권한 관리 ===

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('알림 권한 요청 오류:', error);
      return false;
    }
  }

  isPermissionGranted() {
    return this.permission === 'granted';
  }

  // === 설정 관리 ===

  async loadSettings() {
    try {
      const saved = localStorage.getItem('notification-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.soundEnabled = settings.soundEnabled ?? true;
        this.vibrationEnabled = settings.vibrationEnabled ?? true;
      }
    } catch (error) {
      console.error('알림 설정 로드 오류:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        soundEnabled: this.soundEnabled,
        vibrationEnabled: this.vibrationEnabled
      };
      localStorage.setItem('notification-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
    }
  }

  updateSettings(settings) {
    this.soundEnabled = settings.soundEnabled ?? this.soundEnabled;
    this.vibrationEnabled = settings.vibrationEnabled ?? this.vibrationEnabled;
    this.saveSettings();
  }

  // === 실시간 알림 구독 ===

  subscribeToUserNotifications(userId, callback) {
    if (!isFirebaseConnected()) {
      console.warn('Firebase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const userNotificationsRef = ref(database, `notifications/${userId}`);
      const notificationsQuery = query(
        userNotificationsRef,
        orderByChild('createdAt'),
        limitToLast(50)
      );

      const unsubscribe = onValue(notificationsQuery, (snapshot) => {
        const data = snapshot.val();
        const notifications = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) : [];

        // 최신순으로 정렬
        notifications.sort((a, b) => b.createdAt - a.createdAt);

        // 읽지 않은 알림 수 계산
        this.unreadCount = notifications.filter(n => !n.read).length;

        callback(notifications);

        // 새 알림 처리
        this.handleNewNotifications(notifications);
      }, (error) => {
        console.error('사용자 알림 구독 오류:', error);
        callback([]);
      });

      const listenerKey = `notifications_${userId}`;
      listenerManager.addListener(listenerKey, unsubscribe);

      return () => listenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('알림 구독 설정 오류:', error);
      return null;
    }
  }

  // === 알림 생성 ===

  async createNotification(recipientId, notificationData) {
    if (!isFirebaseConnected()) {
      console.warn('Firebase가 연결되지 않았습니다.');
      return null;
    }

    try {
      const userNotificationsRef = ref(database, `notifications/${recipientId}`);
      const newNotificationRef = push(userNotificationsRef);

      const notification = {
        ...notificationData,
        id: newNotificationRef.key,
        createdAt: serverTimestamp(),
        read: false,
        priority: notificationData.priority || NOTIFICATION_PRIORITY.MEDIUM
      };

      await set(newNotificationRef, notification);

      // 실시간 브라우저 알림 표시
      if (this.shouldShowBrowserNotification(notification)) {
        this.showBrowserNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('알림 생성 오류:', error);
      return null;
    }
  }

  // 특정 타입의 알림 생성 헬퍼 메서드들
  async notifyNewAnswer(questionAuthorId, answererInfo, questionTitle) {
    return this.createNotification(questionAuthorId, {
      type: NOTIFICATION_TYPES.NEW_ANSWER,
      title: '새 답변이 등록되었습니다',
      message: `${answererInfo.name}님이 "${questionTitle}"에 답변했습니다.`,
      data: {
        questionId: questionAuthorId,
        answererId: answererInfo.id,
        answererName: answererInfo.name
      },
      priority: NOTIFICATION_PRIORITY.HIGH
    });
  }

  async notifyAnswerAccepted(answerAuthorId, questionTitle) {
    return this.createNotification(answerAuthorId, {
      type: NOTIFICATION_TYPES.ANSWER_ACCEPTED,
      title: '답변이 채택되었습니다',
      message: `"${questionTitle}"에서 회원님의 답변이 채택되었습니다.`,
      data: {
        questionTitle
      },
      priority: NOTIFICATION_PRIORITY.HIGH
    });
  }

  async notifyQuestionLiked(questionAuthorId, likerInfo, questionTitle) {
    return this.createNotification(questionAuthorId, {
      type: NOTIFICATION_TYPES.QUESTION_LIKED,
      title: '질문에 좋아요를 받았습니다',
      message: `${likerInfo.name}님이 "${questionTitle}"을 좋아합니다.`,
      data: {
        likerId: likerInfo.id,
        likerName: likerInfo.name,
        questionTitle
      },
      priority: NOTIFICATION_PRIORITY.LOW
    });
  }

  async notifyExpertResponse(userId, expertInfo, questionTitle) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.EXPERT_RESPONSE,
      title: '전문가 답변이 등록되었습니다',
      message: `${expertInfo.certification} ${expertInfo.name}님이 "${questionTitle}"에 전문가 답변을 제공했습니다.`,
      data: {
        expertId: expertInfo.id,
        expertName: expertInfo.name,
        certification: expertInfo.certification,
        questionTitle
      },
      priority: NOTIFICATION_PRIORITY.HIGH,
      icon: 'expert'
    });
  }

  // === 브라우저 알림 ===

  shouldShowBrowserNotification(notification) {
    // 페이지가 백그라운드에 있을 때만 브라우저 알림 표시
    return document.visibilityState === 'hidden' &&
           this.isPermissionGranted() &&
           notification.priority !== NOTIFICATION_PRIORITY.LOW;
  }

  showBrowserNotification(notification) {
    if (!this.isPermissionGranted()) return;

    try {
      const options = {
        body: notification.message,
        icon: notification.icon || '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === NOTIFICATION_PRIORITY.HIGH,
        silent: !this.soundEnabled,
        data: notification.data
      };

      const browserNotification = new Notification(notification.title, options);

      // 클릭 이벤트 처리
      browserNotification.onclick = () => {
        window.focus();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // 자동 닫기 (우선순위에 따라)
      if (notification.priority !== NOTIFICATION_PRIORITY.HIGH) {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

      // 사운드 재생
      if (this.soundEnabled) {
        this.playNotificationSound();
      }

      // 진동
      if (this.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

    } catch (error) {
      console.error('브라우저 알림 표시 오류:', error);
    }
  }

  playNotificationSound() {
    try {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(error => {
        console.warn('알림음 재생 실패:', error);
      });
    } catch (error) {
      console.warn('알림음 재생 오류:', error);
    }
  }

  // === 알림 상호작용 ===

  handleNotificationClick(notification) {
    // 알림 타입에 따른 액션 처리
    switch (notification.type) {
      case NOTIFICATION_TYPES.NEW_ANSWER:
      case NOTIFICATION_TYPES.EXPERT_RESPONSE:
        if (notification.data?.questionId) {
          // 질문 상세 페이지로 이동
          window.location.href = `/post.html?id=${notification.data.questionId}`;
        }
        break;

      case NOTIFICATION_TYPES.ANSWER_ACCEPTED:
        // 마이페이지 또는 해당 질문으로 이동
        window.location.href = '/profile.html';
        break;

      default:
        // 기본적으로 알림 센터로 이동
        window.location.href = '/notifications.html';
    }

    // 알림을 읽음으로 표시
    this.markAsRead(notification.id);
  }

  async markAsRead(notificationId, userId) {
    if (!isFirebaseConnected()) return false;

    try {
      const notificationRef = ref(database, `notifications/${userId}/${notificationId}/read`);
      await set(notificationRef, true);
      return true;
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
      return false;
    }
  }

  async markAllAsRead(userId) {
    if (!isFirebaseConnected()) return false;

    try {
      const userNotificationsRef = ref(database, `notifications/${userId}`);
      const snapshot = await get(userNotificationsRef);
      const notifications = snapshot.val();

      if (!notifications) return true;

      const updates = {};
      Object.keys(notifications).forEach(notificationId => {
        updates[`${notificationId}/read`] = true;
      });

      await update(userNotificationsRef, updates);
      this.unreadCount = 0;
      return true;
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
      return false;
    }
  }

  // === 새 알림 감지 및 처리 ===

  handleNewNotifications(notifications) {
    // 마지막으로 확인한 시간 이후의 새 알림 찾기
    const lastChecked = localStorage.getItem('last-notification-check');
    const lastCheckedTime = lastChecked ? parseInt(lastChecked) : 0;

    const newNotifications = notifications.filter(notification =>
      notification.createdAt > lastCheckedTime && !notification.read
    );

    if (newNotifications.length > 0) {
      // 인앱 알림 표시
      this.showInAppNotifications(newNotifications);

      // 마지막 확인 시간 업데이트
      localStorage.setItem('last-notification-check', Date.now().toString());
    }
  }

  showInAppNotifications(notifications) {
    // 인앱 알림 UI 업데이트
    notifications.forEach(notification => {
      this.displayInAppNotification(notification);
    });

    // 알림 카운트 업데이트
    this.updateNotificationBadge();
  }

  displayInAppNotification(notification) {
    // 인앱 토스트 알림 생성
    const toast = document.createElement('div');
    toast.className = `notification-toast priority-${notification.priority}`;
    toast.innerHTML = `
      <div class="notification-icon">
        ${this.getNotificationIcon(notification.type)}
      </div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // 알림 컨테이너에 추가
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    // 클릭 이벤트
    toast.addEventListener('click', () => {
      this.handleNotificationClick(notification);
      toast.remove();
    });

    // 자동 제거
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, notification.priority === NOTIFICATION_PRIORITY.HIGH ? 10000 : 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      [NOTIFICATION_TYPES.NEW_ANSWER]: '💬',
      [NOTIFICATION_TYPES.ANSWER_ACCEPTED]: '✅',
      [NOTIFICATION_TYPES.QUESTION_LIKED]: '👍',
      [NOTIFICATION_TYPES.ANSWER_LIKED]: '❤️',
      [NOTIFICATION_TYPES.MENTION]: '📢',
      [NOTIFICATION_TYPES.FOLLOW]: '👥',
      [NOTIFICATION_TYPES.EXPERT_RESPONSE]: '🎓',
      [NOTIFICATION_TYPES.SYSTEM]: '🔔'
    };
    return icons[type] || '📋';
  }

  updateNotificationBadge() {
    // 페이지의 알림 배지 업데이트
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
    });

    // 페이지 제목에 알림 수 표시
    if (this.unreadCount > 0) {
      document.title = `(${this.unreadCount}) Viet K-Connect`;
    } else {
      document.title = 'Viet K-Connect';
    }
  }

  // === 유틸리티 메서드 ===

  getUnreadCount() {
    return this.unreadCount;
  }

  isEnabled() {
    return this.isPermissionGranted();
  }

  getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled,
      permission: this.permission
    };
  }
}

// 싱글톤 인스턴스 생성
export const notificationService = new NotificationService();

// 전역에서 접근 가능하도록 설정 (디버깅용)
if (typeof window !== 'undefined') {
  window.notificationService = notificationService;
}