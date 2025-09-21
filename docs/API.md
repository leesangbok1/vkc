# Viet K-Connect API Documentation

## 개요
Viet K-Connect는 베트남 관련 질문과 답변을 위한 커뮤니티 플랫폼으로, Firebase를 백엔드로 사용합니다.

## 주요 기능

### 🔥 Firebase 서비스
- **Authentication**: 소셜 로그인 (Google, Facebook, Kakao)
- **Firestore**: 질문/답변 데이터 저장
- **Realtime Database**: 실시간 채팅
- **Storage**: 파일 업로드

### 🤖 AI 서비스 (OpenAI)
- **질문 분류**: GPT-3.5로 카테고리 자동 분류
- **답변 개선**: AI 기반 답변 품질 향상
- **번역**: 한국어-베트남어 자동 번역
- **유사 질문**: 관련 질문 추천

## 데이터 모델

### Question (질문)
```javascript
{
  id: string,
  title: string,
  content: string,
  category: string, // 'visa', 'work', 'life', 'culture', 'language', 'travel'
  tags: string[],
  authorId: string,
  authorName: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  views: number,
  likes: number,
  status: 'open' | 'answered' | 'closed',
  isAnswered: boolean,
  bestAnswerId?: string
}
```

### Answer (답변)
```javascript
{
  id: string,
  questionId: string,
  content: string,
  authorId: string,
  authorName: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  likes: number,
  isBest: boolean,
  isAIGenerated: boolean
}
```

### Chat Message (채팅)
```javascript
{
  id: string,
  chatType: 'general' | 'expert' | 'private',
  content: string,
  authorId: string,
  authorName: string,
  timestamp: timestamp,
  isRead: boolean,
  targetUserId?: string // private chat용
}
```

## API 엔드포인트

### 인증 (Authentication)
```javascript
// 소셜 로그인
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

const signInWithFacebook = () => {
  const provider = new FacebookAuthProvider()
  return signInWithPopup(auth, provider)
}
```

### 질문 관리 (Questions)
```javascript
// 질문 목록 조회
const getQuestions = async (filters = {}) => {
  let query = collection(db, 'questions')

  if (filters.category) {
    query = query.where('category', '==', filters.category)
  }

  if (filters.sortBy === 'latest') {
    query = query.orderBy('createdAt', 'desc')
  }

  return getDocs(query)
}

// 질문 생성
const createQuestion = async (questionData) => {
  const docRef = await addDoc(collection(db, 'questions'), {
    ...questionData,
    createdAt: serverTimestamp(),
    views: 0,
    likes: 0,
    isAnswered: false
  })
  return docRef.id
}

// 질문 상세 조회
const getQuestion = async (questionId) => {
  const docRef = doc(db, 'questions', questionId)
  return getDoc(docRef)
}
```

### 답변 관리 (Answers)
```javascript
// 답변 생성
const createAnswer = async (questionId, answerData) => {
  return addDoc(collection(db, 'answers'), {
    ...answerData,
    questionId,
    createdAt: serverTimestamp(),
    likes: 0,
    isBest: false
  })
}

// 질문별 답변 조회
const getAnswers = async (questionId) => {
  const q = query(
    collection(db, 'answers'),
    where('questionId', '==', questionId),
    orderBy('createdAt', 'desc')
  )
  return getDocs(q)
}
```

### 실시간 채팅 (Chat)
```javascript
// 메시지 전송
const sendMessage = async (chatType, message) => {
  const messagesRef = ref(database, `chats/${chatType}`)
  return push(messagesRef, {
    ...message,
    timestamp: serverTimestamp()
  })
}

// 메시지 수신 (실시간)
const subscribeToMessages = (chatType, callback) => {
  const messagesRef = ref(database, `chats/${chatType}`)
  return onValue(messagesRef, callback)
}
```

### AI 서비스 (AI Services)
```javascript
// 질문 분류
const categorizeQuestion = async (title, content) => {
  return aiService.categorizeQuestion(title, content)
}

// 답변 개선 제안
const suggestImprovements = async (title, content) => {
  return aiService.suggestImprovements(title, content)
}

// 번역
const translateText = async (text, targetLanguage) => {
  return aiService.detectAndTranslate(text, targetLanguage)
}
```

## 보안 규칙

### Firestore 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 질문: 읽기는 모두, 쓰기는 인증된 사용자
    match /questions/{questionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 답변: 읽기는 모두, 쓰기는 인증된 사용자
    match /answers/{answerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 사용자: 본인만 수정 가능
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Realtime Database 규칙
```json
{
  "rules": {
    "chats": {
      "general": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "expert": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "private": {
        "$chatId": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

## 에러 처리

### 공통 에러 코드
- `auth/user-not-found`: 사용자를 찾을 수 없음
- `permission-denied`: 권한 없음
- `not-found`: 문서를 찾을 수 없음
- `already-exists`: 이미 존재함
- `resource-exhausted`: 할당량 초과

### 에러 처리 예시
```javascript
try {
  const result = await createQuestion(questionData)
  return { success: true, data: result }
} catch (error) {
  console.error('Error creating question:', error)
  return {
    success: false,
    error: error.code,
    message: error.message
  }
}
```

## 성능 최적화

### 캐싱 전략
- 질문 목록: 5분 캐시
- 사용자 정보: 30분 캐시
- 채팅 메시지: 실시간, 캐시 없음

### 페이지네이션
```javascript
const getQuestionsWithPagination = async (lastDoc = null, limit = 10) => {
  let query = collection(db, 'questions')
    .orderBy('createdAt', 'desc')
    .limit(limit)

  if (lastDoc) {
    query = query.startAfter(lastDoc)
  }

  return getDocs(query)
}
```

## 사용 제한

### Firebase 할당량
- Firestore: 20,000 reads/day (무료)
- Realtime Database: 1GB 데이터 전송/월
- Authentication: 무제한 (무료)

### OpenAI API 제한
- GPT-3.5 Turbo: $0.002/1K tokens
- 월 사용량 제한: $20
- Rate limit: 3 requests/minute

## 모니터링

### 성능 지표
- 페이지 로드 시간: < 2초
- API 응답 시간: < 500ms
- 채팅 지연시간: < 100ms

### 로깅
```javascript
// 성능 로깅
performanceMonitor.measurePageLoad().then(metrics => {
  console.log('Page load metrics:', metrics)
})

// 에러 로깅
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})
```