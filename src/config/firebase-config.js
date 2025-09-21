// Firebase 설정 및 초기화
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase 설정 (환경 변수에서 로드)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "viet-kconnect.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://viet-kconnect-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "viet-kconnect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "viet-kconnect.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

// Firebase 앱 초기화
let app;
let database;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  storage = getStorage(app);

  // 개발 환경에서 에뮬레이터 사용
  if (import.meta.env.DEV && !window.location.hostname.includes('firebaseapp.com')) {
    try {
      // Database 에뮬레이터
      if (!database._delegate._repoInternal) {
        connectDatabaseEmulator(database, 'localhost', 9000);
      }

      // Auth 에뮬레이터
      if (!auth._delegate.config.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }

      // Storage 에뮬레이터
      if (!storage._delegate._url.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }

      console.log('🔧 Firebase 에뮬레이터 연결됨');
    } catch (error) {
      console.warn('⚠️ Firebase 에뮬레이터 연결 실패 (이미 연결되었거나 에뮬레이터가 실행되지 않음):', error.message);
    }
  }

  console.log('🔥 Firebase 초기화 성공');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);

  // 폴백: 모킹 모드로 전환
  console.warn('🔄 모킹 모드로 전환합니다');
  app = null;
  database = null;
  auth = null;
  storage = null;
}

// Firebase 연결 상태 확인
export function isFirebaseConnected() {
  return app !== null && database !== null;
}

// Firebase 연결 상태 테스트
export async function testFirebaseConnection() {
  if (!isFirebaseConnected()) {
    return {
      success: false,
      error: 'Firebase 초기화되지 않음',
      mode: 'mock'
    };
  }

  try {
    // 간단한 읽기 테스트
    const { ref, get } = await import('firebase/database');
    const testRef = ref(database, '.info/connected');
    const snapshot = await get(testRef);

    return {
      success: true,
      connected: snapshot.val(),
      mode: 'firebase',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      mode: 'mock'
    };
  }
}

export { app, database, auth, storage };