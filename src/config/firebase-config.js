// Firebase 설정 및 초기화
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase 설정 (환경 변수에서 로드) - 개발 시 모킹 모드 기본값
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || null,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || null,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || null
};

// Firebase 앱 초기화
let app;
let database;
let auth;
let storage;

// Firebase 설정이 완전히 구성되어 있는지 확인
const hasValidFirebaseConfig = Object.values(firebaseConfig).every(value => value !== null);

if (hasValidFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // 개발 환경에서 에뮬레이터 사용 (환경 변수로 제어)
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectDatabaseEmulator(database, 'localhost', 9000);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('🔧 Firebase 에뮬레이터 연결됨');
      } catch (error) {
        console.warn('⚠️ Firebase 에뮬레이터 연결 실패:', error.message);
        // 에뮬레이터 실패시 모킹 모드로 전환
        app = null;
        database = null;
        auth = null;
        storage = null;
      }
    } else {
      console.log('🔥 Firebase 프로덕션 모드 초기화 성공');
    }
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    // 폴백: 모킹 모드로 전환
    app = null;
    database = null;
    auth = null;
    storage = null;
  }
} else {
  console.log('🔄 Firebase 설정이 없어 모킹 모드로 실행됩니다');
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