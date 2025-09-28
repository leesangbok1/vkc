// Firebase 실시간 데이터베이스 API
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  startAt,
  endAt
} from 'firebase/database';
import { database, isFirebaseConnected } from '../config/firebase-config.js';

// 실시간 리스너 관리
class RealtimeListenerManager {
  constructor() {
    this.listeners = new Map();
    this.activeQueries = new Set();
  }

  // 리스너 등록
  addListener(key, unsubscribe) {
    if (this.listeners.has(key)) {
      this.removeListener(key);
    }
    this.listeners.set(key, unsubscribe);
  }

  // 리스너 제거
  removeListener(key) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
    this.listeners.delete(key);
  }

  // 모든 리스너 제거
  removeAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    this.activeQueries.clear();
  }

  // 활성 리스너 수
  getActiveListenerCount() {
    return this.listeners.size;
  }
}

export const listenerManager = new RealtimeListenerManager();

// 연결 상태 확인
export function checkFirebaseConnection() {
  if (!isFirebaseConnected()) {
    console.warn('⚠️ Firebase가 연결되지 않았습니다. 모킹 모드를 사용합니다.');
    return false;
  }
  return true;
}

// === 실시간 질문 관련 기능 ===

// 실시간 질문 목록 감시
export function listenToQuestions(callback, options = {}) {
  if (!checkFirebaseConnection()) return null;

  const {
    category = null,
    sortBy = 'createdAt',
    limit = 20,
    startAfter = null
  } = options;

  try {
    let questionsRef = ref(database, 'questions');

    // 쿼리 구성
    if (sortBy === 'createdAt') {
      questionsRef = query(questionsRef, orderByChild('createdAt'));
    } else if (sortBy === 'viewCount') {
      questionsRef = query(questionsRef, orderByChild('viewCount'));
    } else if (sortBy === 'likes') {
      questionsRef = query(questionsRef, orderByChild('likes'));
    }

    if (limit > 0) {
      questionsRef = query(questionsRef, limitToLast(limit));
    }

    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val();
      const questions = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })) : [];

      // 카테고리 필터링 (클라이언트 사이드)
      const filteredQuestions = category
        ? questions.filter(q => q.category === category)
        : questions;

      // 최신순으로 정렬 (Firebase는 오래된 것부터 반환)
      filteredQuestions.sort((a, b) => b.createdAt - a.createdAt);

      callback(filteredQuestions);
    }, (error) => {
      console.error('질문 목록 실시간 업데이트 오류:', error);
      callback([]);
    });

    const listenerKey = `questions_${category || 'all'}_${sortBy}`;
    listenerManager.addListener(listenerKey, () => off(questionsRef, unsubscribe));

    return () => listenerManager.removeListener(listenerKey);
  } catch (error) {
    console.error('실시간 질문 감시 설정 오류:', error);
    return null;
  }
}

// 특정 질문 실시간 감시
export function listenToQuestion(questionId, callback) {
  if (!checkFirebaseConnection()) return null;

  try {
    const questionRef = ref(database, `questions/${questionId}`);

    const unsubscribe = onValue(questionRef, (snapshot) => {
      const data = snapshot.val();
      callback(data ? { id: questionId, ...data } : null);
    }, (error) => {
      console.error(`질문 ${questionId} 실시간 업데이트 오류:`, error);
      callback(null);
    });

    const listenerKey = `question_${questionId}`;
    listenerManager.addListener(listenerKey, () => off(questionRef, unsubscribe));

    return () => listenerManager.removeListener(listenerKey);
  } catch (error) {
    console.error('실시간 질문 감시 설정 오류:', error);
    return null;
  }
}

// === 실시간 답변 관련 기능 ===

// 특정 질문의 답변들 실시간 감시
export function listenToAnswers(questionId, callback) {
  if (!checkFirebaseConnection()) return null;

  try {
    const answersRef = ref(database, `answers/${questionId}`);

    const unsubscribe = onValue(answersRef, (snapshot) => {
      const data = snapshot.val();
      const answers = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })) : [];

      // 생성 시간순으로 정렬
      answers.sort((a, b) => a.createdAt - b.createdAt);

      callback(answers);
    }, (error) => {
      console.error(`질문 ${questionId}의 답변 실시간 업데이트 오류:`, error);
      callback([]);
    });

    const listenerKey = `answers_${questionId}`;
    listenerManager.addListener(listenerKey, () => off(answersRef, unsubscribe));

    return () => listenerManager.removeListener(listenerKey);
  } catch (error) {
    console.error('실시간 답변 감시 설정 오류:', error);
    return null;
  }
}

// === 실시간 사용자 활동 감시 ===

// 온라인 사용자 감시
export function listenToOnlineUsers(callback) {
  if (!checkFirebaseConnection()) return null;

  try {
    const onlineUsersRef = ref(database, 'presence');

    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val();
      const onlineUsers = data ? Object.keys(data).filter(userId => {
        const user = data[userId];
        // 5분 이내에 활동한 사용자만 온라인으로 간주
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        return user.lastSeen > fiveMinutesAgo;
      }).map(userId => ({
        id: userId,
        ...data[userId]
      })) : [];

      callback(onlineUsers);
    }, (error) => {
      console.error('온라인 사용자 실시간 업데이트 오류:', error);
      callback([]);
    });

    const listenerKey = 'online_users';
    listenerManager.addListener(listenerKey, () => off(onlineUsersRef, unsubscribe));

    return () => listenerManager.removeListener(listenerKey);
  } catch (error) {
    console.error('온라인 사용자 감시 설정 오류:', error);
    return null;
  }
}

// === 실시간 통계 감시 ===

// 실시간 사이트 통계
export function listenToSiteStats(callback) {
  if (!checkFirebaseConnection()) return null;

  try {
    const statsRef = ref(database, 'stats');

    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {
        totalQuestions: 0,
        totalAnswers: 0,
        totalUsers: 0,
        activeUsers: 0
      });
    }, (error) => {
      console.error('사이트 통계 실시간 업데이트 오류:', error);
      callback({});
    });

    const listenerKey = 'site_stats';
    listenerManager.addListener(listenerKey, () => off(statsRef, unsubscribe));

    return () => listenerManager.removeListener(listenerKey);
  } catch (error) {
    console.error('실시간 통계 감시 설정 오류:', error);
    return null;
  }
}

// === 사용자 상태 관리 ===

// 사용자 온라인 상태 설정
export async function setUserOnline(userId, userInfo = {}) {
  if (!checkFirebaseConnection()) return false;

  try {
    const userPresenceRef = ref(database, `presence/${userId}`);
    await set(userPresenceRef, {
      online: true,
      lastSeen: serverTimestamp(),
      ...userInfo
    });

    // 사용자가 오프라인 되었을 때 자동으로 상태 업데이트
    const offlineRef = ref(database, `presence/${userId}/online`);
    await set(offlineRef, false);

    return true;
  } catch (error) {
    console.error('사용자 온라인 상태 설정 오류:', error);
    return false;
  }
}

// 사용자 오프라인 상태 설정
export async function setUserOffline(userId) {
  if (!checkFirebaseConnection()) return false;

  try {
    const userPresenceRef = ref(database, `presence/${userId}`);
    await update(userPresenceRef, {
      online: false,
      lastSeen: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('사용자 오프라인 상태 설정 오류:', error);
    return false;
  }
}

// === 데이터 읽기/쓰기 ===

// 질문 생성
export async function createQuestion(questionData) {
  if (!checkFirebaseConnection()) return null;

  try {
    const questionsRef = ref(database, 'questions');
    const newQuestionRef = push(questionsRef);

    const question = {
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      answerCount: 0,
      likes: 0
    };

    await set(newQuestionRef, question);

    // 통계 업데이트
    await updateSiteStats('totalQuestions', 1);

    return {
      id: newQuestionRef.key,
      ...question
    };
  } catch (error) {
    console.error('질문 생성 오류:', error);
    return null;
  }
}

// 답변 생성
export async function createAnswer(questionId, answerData) {
  if (!checkFirebaseConnection()) return null;

  try {
    const answersRef = ref(database, `answers/${questionId}`);
    const newAnswerRef = push(answersRef);

    const answer = {
      ...answerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      isAccepted: false
    };

    await set(newAnswerRef, answer);

    // 질문의 답변 수 증가
    const questionRef = ref(database, `questions/${questionId}/answerCount`);
    const questionSnapshot = await get(questionRef);
    const currentCount = questionSnapshot.val() || 0;
    await set(questionRef, currentCount + 1);

    // 통계 업데이트
    await updateSiteStats('totalAnswers', 1);

    return {
      id: newAnswerRef.key,
      ...answer
    };
  } catch (error) {
    console.error('답변 생성 오류:', error);
    return null;
  }
}

// 통계 업데이트
async function updateSiteStats(statName, increment = 1) {
  if (!checkFirebaseConnection()) return;

  try {
    const statRef = ref(database, `stats/${statName}`);
    const snapshot = await get(statRef);
    const currentValue = snapshot.val() || 0;
    await set(statRef, currentValue + increment);
  } catch (error) {
    console.error(`${statName} 통계 업데이트 오류:`, error);
  }
}

// === 페이지 정리 시 리스너 정리 ===

// 페이지 언로드 시 모든 리스너 정리
window.addEventListener('beforeunload', () => {
  listenerManager.removeAllListeners();
});

// 개발 모드에서 디버깅 정보 제공
if (import.meta.env.DEV) {
  window.debugRealtimeListeners = {
    count: () => listenerManager.getActiveListenerCount(),
    list: () => Array.from(listenerManager.listeners.keys()),
    clear: () => listenerManager.removeAllListeners()
  };
}