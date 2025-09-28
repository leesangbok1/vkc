// Firebase 설정 및 초기화
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase 프로젝트 설정
const firebaseConfig = {
  // 개발 환경용 설정 - 실제 프로덕션에서는 환경 변수 사용
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "viet-k-connect-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://viet-k-connect-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "viet-k-connect-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "viet-k-connect-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firebase 서비스 초기화
export const auth = getAuth(app)
export const database = getDatabase(app)
export const storage = getStorage(app)

// Analytics (프로덕션 환경에서만)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD
  ? getAnalytics(app)
  : null

// 개발 환경에서 에뮬레이터 연결
if (import.meta.env.DEV) {
  const isEmulatorConnected = {
    auth: false,
    database: false,
    storage: false
  }

  // Auth 에뮬레이터
  if (!isEmulatorConnected.auth) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      isEmulatorConnected.auth = true
      console.log('🔧 Firebase Auth Emulator connected')
    } catch (error) {
      console.log('⚠️ Firebase Auth Emulator not available, using production')
    }
  }

  // Database 에뮬레이터
  if (!isEmulatorConnected.database) {
    try {
      connectDatabaseEmulator(database, 'localhost', 9000)
      isEmulatorConnected.database = true
      console.log('🔧 Firebase Database Emulator connected')
    } catch (error) {
      console.log('⚠️ Firebase Database Emulator not available, using production')
    }
  }

  // Storage 에뮬레이터
  if (!isEmulatorConnected.storage) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199)
      isEmulatorConnected.storage = true
      console.log('🔧 Firebase Storage Emulator connected')
    } catch (error) {
      console.log('⚠️ Firebase Storage Emulator not available, using production')
    }
  }
}

// Firebase 연결 상태 확인 (간단한 버전)
export const isFirebaseConnected = () => {
  return !!database && !!auth
}

// Firebase 연결 상태 확인 (상세 버전)
export const checkFirebaseConnection = async () => {
  try {
    // Database 연결 테스트
    const { ref, get } = await import('firebase/database')
    const testRef = ref(database, '.info/connected')
    const snapshot = await get(testRef)

    console.log('🔥 Firebase connection status:', {
      connected: snapshot.val(),
      database: database.app.name,
      timestamp: new Date().toISOString()
    })

    return snapshot.val()
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return false
  }
}

// 환경별 설정
export const firebaseEnv = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  hasEmulators: import.meta.env.DEV
}

// 데이터베이스 참조 헬퍼
export const dbRefs = {
  // 사용자 관련
  users: () => import('firebase/database').then(({ ref }) => ref(database, 'users')),
  user: (uid) => import('firebase/database').then(({ ref }) => ref(database, `users/${uid}`)),

  // 게시물 관련
  posts: () => import('firebase/database').then(({ ref }) => ref(database, 'posts')),
  post: (id) => import('firebase/database').then(({ ref }) => ref(database, `posts/${id}`)),

  // 답변 관련
  answers: (postId) => import('firebase/database').then(({ ref }) => ref(database, `posts/${postId}/answers`)),
  answer: (postId, answerId) => import('firebase/database').then(({ ref }) => ref(database, `posts/${postId}/answers/${answerId}`)),

  // 카테고리별 게시물
  categoryPosts: (category) => import('firebase/database').then(({ ref }) => ref(database, `categories/${category}/posts`)),

  // 알림 관련
  notifications: (uid) => import('firebase/database').then(({ ref }) => ref(database, `notifications/${uid}`)),

  // 채팅 관련
  chats: () => import('firebase/database').then(({ ref }) => ref(database, 'chats')),
  chat: (chatId) => import('firebase/database').then(({ ref }) => ref(database, `chats/${chatId}`)),

  // 시스템 정보
  stats: () => import('firebase/database').then(({ ref }) => ref(database, 'stats')),
  onlineUsers: () => import('firebase/database').then(({ ref }) => ref(database, '.info/connected'))
}

// Storage 참조 헬퍼
export const storageRefs = {
  // 사용자 프로필 이미지
  userAvatar: (uid) => import('firebase/storage').then(({ ref }) => ref(storage, `avatars/${uid}`)),

  // 게시물 이미지
  postImage: (postId, filename) => import('firebase/storage').then(({ ref }) => ref(storage, `posts/${postId}/${filename}`)),

  // 채팅 파일
  chatFile: (chatId, filename) => import('firebase/storage').then(({ ref }) => ref(storage, `chats/${chatId}/${filename}`)),

  // 임시 파일
  temp: (filename) => import('firebase/storage').then(({ ref }) => ref(storage, `temp/${filename}`))
}

// 실시간 연결 모니터링
export const monitorConnection = (callback) => {
  if (typeof callback !== 'function') {
    console.warn('monitorConnection: callback must be a function')
    return () => {}
  }

  import('firebase/database').then(({ ref, onValue, off }) => {
    const connectedRef = ref(database, '.info/connected')

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val()
      console.log('🔥 Firebase connection changed:', connected)
      callback(connected)
    })

    // 정리 함수 반환
    return () => {
      off(connectedRef, unsubscribe)
    }
  }).catch(error => {
    console.error('Failed to monitor connection:', error)
    callback(false)
  })
}

// 오프라인 지원을 위한 persistence 설정
if (typeof window !== 'undefined') {
  import('firebase/database').then(({ getDatabase, goOffline, goOnline }) => {
    // 페이지 숨김/표시 시 연결 관리
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('🔥 Page hidden - going offline')
        // goOffline(database) // 주석 처리: 너무 aggressive할 수 있음
      } else {
        console.log('🔥 Page visible - going online')
        // goOnline(database)
      }
    })

    // 네트워크 상태 변화 감지
    window.addEventListener('online', () => {
      console.log('🌐 Network online - reconnecting Firebase')
      goOnline(database)
    })

    window.addEventListener('offline', () => {
      console.log('🌐 Network offline - Firebase will cache')
      // Firebase가 자동으로 오프라인 캐싱을 처리
    })
  })
}

// 개발 환경에서 Firebase 상태 로그
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    environment: import.meta.env.MODE,
    auth: !!auth,
    database: !!database,
    storage: !!storage,
    analytics: !!analytics
  })

  // 연결 상태 확인
  setTimeout(checkFirebaseConnection, 1000)
}

export default app