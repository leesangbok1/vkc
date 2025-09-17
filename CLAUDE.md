# POI Project - Claude Code Configuration

## 프로젝트 개요
"Viet K-Connect"는 베트남 한국 커뮤니티를 위한 A/B 테스트 기반 Q&A 플랫폼입니다. 사용자들이 비자, 법률, 생활 정보 등에 대해 질문하고 답변을 받을 수 있는 웹 애플리케이션입니다.

## 기술 스택 및 라이브러리

### 핵심 기술
- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite v7.0.6
- **Module System**: ES6 Modules
- **Runtime**: Browser-based, Client-side only

### 외부 라이브러리
- **React**: v19.1.1 (의존성으로 포함되어 있으나 미사용)
- **React-DOM**: v19.1.1 (의존성으로 포함되어 있으나 미사용)
- **Firebase**: v12.0.0 (인증 및 데이터베이스용, 현재 Mock 모드)
- **Font Awesome**: v6.4.0 (CDN - 아이콘)
- **Google Fonts**: Noto Sans KR (CDN - 폰트)

### 개발 도구
- **@vitejs/plugin-react**: v4.7.0 (Vite React 플러그인)
- **Package Manager**: npm / pnpm

## 프로젝트 구조
```
poi-main/
├── src/
│   ├── api/
│   │   └── firebase.js          # Firebase API 및 Mock 데이터
│   ├── components/
│   │   ├── Header.js            # 헤더 컴포넌트
│   │   ├── PostCard.js          # 게시글 카드
│   │   ├── AnswerCard.js        # 답변 카드
│   │   ├── LoginModal.js        # 로그인 모달
│   │   ├── CertificationModal.js # 인증서 업로드 모달
│   │   ├── AdminDashboardModal.js # 관리자 대시보드
│   │   └── Spinner.js           # 로딩 스피너
│   ├── pages/
│   │   ├── HomePage.js          # 홈페이지
│   │   ├── PostDetailPage.js    # 게시글 상세 페이지
│   │   └── AllPostsPage.js      # 전체 게시글 목록
│   ├── i18n/
│   │   ├── i18n.js              # 국제화 시스템
│   │   ├── ko.json              # 한국어 번역
│   │   ├── en.json              # 영어 번역
│   │   └── vi.json              # 베트남어 번역
│   ├── main.js                  # 앱 진입점 및 라우터
│   └── style.css                # 메인 스타일시트
├── index.html                   # HTML 템플릿
├── package.json                 # 의존성 관리
└── vite.config.js               # Vite 설정 (미포함)
```

## 핵심 기능
1. **A/B 테스트**: 질문 작성 UI vs 검색 UI 간의 사용자 경험 테스트
2. **다국어 지원**: 한국어, 영어, 베트남어 지원
3. **소셜 로그인**: Google, Facebook 로그인
4. **게시글 시스템**: 질문 작성, 답변, 좋아요, 답변 채택
5. **카테고리별 분류**: Visa/Legal, Life, Education, Employment, Housing, Healthcare
6. **전문가 인증**: 자격증 기반 전문가 인증 시스템
7. **관리자 기능**: 게시글 삭제 등 관리자 전용 기능

## 개발 명령어
```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 패키지 관리
- **패키지 매니저**: npm (pnpm도 설치됨)
- **주요 의존성**:
  - react: ^19.1.1
  - react-dom: ^19.1.1
  - firebase: ^12.0.0
- **개발 의존성**:
  - vite: ^7.0.6
  - @vitejs/plugin-react: ^4.7.0

## 애플리케이션 아키텍처

### 상태 관리 패턴
- **중앙 상태 저장소**: 단일 `state` 객체로 전역 상태 관리
- **상태 구조**:
  ```javascript
  state = {
    currentPage: 'home',           // 현재 페이지
    currentPostId: null,           // 현재 보고 있는 게시글 ID
    abTestGroup: 'A' | 'B',        // A/B 테스트 그룹
    language: 'ko' | 'en' | 'vi',  // 현재 언어
    posts: [],                     // 홈페이지 게시글 목록
    allPosts: [],                  // 전체 게시글 목록
    currentUser: null,             // 현재 로그인 사용자
    users: {},                     // 사용자 정보 캐시
    isLoading: boolean,            // 로딩 상태
    // 페이지네이션 상태
    lastVisiblePost: null,
    firstVisiblePost: null,
    currentPageNumber: 1,
    // 필터 및 정렬
    activeFilter: { type: null, value: null },
    activeSort: 'createdAt' | 'viewCount',
    // UI 상태
    isUserDropdownOpen: boolean,
    isLangDropdownOpen: boolean,
    isLoginModalOpen: boolean,
    isCertificationModalOpen: boolean,
    isAdminModalOpen: boolean
  }
  ```

### 라우팅 시스템
- **라우터 구현**: 해시 기반 (#) 클라이언트 사이드 라우팅
- **페이지 전환**: `navigate(page, payload)` 함수를 통한 페이지 이동
- **지원 라우트**:
  - `#home` - 메인 페이지
  - `#postDetail/{postId}` - 게시글 상세
  - `#allPosts` - 전체 게시글 목록

### 컴포넌트 아키텍처
- **렌더링 패턴**: 함수형 컴포넌트로 HTML 문자열 반환
- **컴포넌트 구성**:
  - **Pages**: 전체 페이지 레이아웃 (HomePage, PostDetailPage, AllPostsPage)
  - **Components**: 재사용 가능한 UI 조각 (Header, PostCard, AnswerCard, Modal 등)
- **이벤트 처리**: 이벤트 위임(Event Delegation) 패턴 사용
  - `document.body`에 이벤트 리스너 등록
  - 이벤트 버블링을 통한 효율적 이벤트 관리

### 데이터 흐름
1. **사용자 액션** → 이벤트 리스너 트리거
2. **상태 업데이트** → state 객체 수정
3. **API 호출** → Firebase/Mock 데이터 페칭
4. **리렌더링** → `render()` 함수 호출
5. **DOM 업데이트** → innerHTML을 통한 DOM 교체

### 국제화 (i18n) 아키텍처
- **번역 파일**: JSON 형식 (ko.json, en.json, vi.json)
- **번역 함수**: `getTranslator()` 반환 함수 사용
- **언어 전환**: localStorage 기반 언어 설정 저장

## 스타일링 시스템
- **CSS 변수**: 테마 색상 및 공통 스타일 정의
- **네이밍 컨벤션**: BEM 스타일 변형 사용
- **반응형 디자인**: 미디어 쿼리 기반
- **주요 CSS 변수**:
  ```css
  --primary-blue: #4285F4;      /* Google Blue */
  --text-dark: #202124;         /* Google Text Black */
  --text-light: #5f6368;        /* Google Text Gray */
  --bg-main: #ffffff;           /* White Background */
  --border-color: #dfe1e5;      /* Google Search Border */
  --shadow-md: 0 1px 6px 0 rgba(32,33,36,0.28);
  ```

## 특이사항
- React를 의존성으로 포함하고 있으나 실제로는 Vanilla JS 사용
- Firebase 설정은 있지만 현재는 Mock 데이터로 개발
- A/B 테스트 그룹은 localStorage에 저장되어 사용자별 일관성 유지

## API 및 데이터 관리

### Mock 데이터 구조
```javascript
// 사용자 데이터
mockUsers = {
  'userId': {
    id: string,
    name: string,
    profilePic: string,
    email: string,
    isAdmin?: boolean,      // 관리자 권한
    isExpert?: boolean,     // 전문가 인증
    certification?: string  // 인증 정보
  }
}

// 게시글 데이터
mockPosts = [{
  id: string,
  title: string,
  content: string,
  authorId: string,
  category: 'Visa/Legal' | 'Life' | 'Education' | 'Employment' | 'Housing' | 'Healthcare',
  tags: string[],
  createdAt: Date,
  viewCount: number,
  answerCount: number,
  likes: number
}]

// 답변 데이터
mockAnswers = {
  'postId': [{
    id: string,
    authorId: string,
    content: string,
    createdAt: Date,
    likes: number,
    isAccepted: boolean
  }]
}
```

### 주요 API 함수
- `signInWithGoogle()` - Google 로그인
- `signInWithFacebook()` - Facebook 로그인
- `signOutUser()` - 로그아웃
- `fetchHomepagePosts(usersCache)` - 홈페이지 게시글 조회
- `fetchPostDetails(postId, usersCache)` - 게시글 상세 조회
- `fetchPaginatedPosts(filter, sort, lastVisible, firstVisible, usersCache)` - 페이지네이션
- `createQuestion(title, content, user)` - 질문 작성
- `createAnswer(postId, content, user)` - 답변 작성
- `updateLikes(type, id, postId)` - 좋아요 업데이트
- `acceptAnswer(postId, answerId)` - 답변 채택
- `deletePost(postId)` - 게시글 삭제

## 이벤트 시스템

### 주요 이벤트 핸들러
- **폼 제출**: 질문/답변 작성, 검색, 인증서 업로드
- **클릭 이벤트**:
  - 모달 열기/닫기 (로그인, 인증, 관리자)
  - 드롭다운 토글 (사용자 메뉴, 언어 선택)
  - 페이지 네비게이션
  - 좋아요, 공유, 답변 채택
  - A/B 테스트 뷰 전환
- **인증 상태 변경**: `onAuthChange` 콜백

### localStorage 사용
- `abTestGroup` - A/B 테스트 그룹 저장
- `language` - 선택한 언어 설정 저장

## 코딩 컨벤션
- **모듈 시스템**: ES6 import/export 사용
- **함수 명명**: camelCase (예: `renderPostCard`, `fetchPostDetails`)
- **컴포넌트 함수**: `render` 접두어 사용 (예: `renderHeader`)
- **이벤트 핸들러**: `handle` 접두어 사용 (예: `handleFetchPaginatedPosts`)
- **상수**: UPPER_SNAKE_CASE (CSS 변수명 등)
- **HTML 생성**: 템플릿 리터럴 사용
- **비동기 처리**: async/await 패턴 사용

## 보안 고려사항
- XSS 방지를 위한 사용자 입력 검증 필요
- innerHTML 사용 시 주의 필요
- 민감한 정보는 클라이언트에 저장하지 않음

## 성능 최적화
- 이벤트 위임을 통한 이벤트 리스너 최소화
- 사용자 정보 캐싱 (users 객체)
- 컴포넌트별 모듈 분리로 코드 스플리팅

## 테스트 및 린트
현재 테스트 프레임워크나 린터는 설정되어 있지 않습니다.

## 추천 개발 도구
- VS Code
- Vite Dev Server
- Browser Developer Tools
- Git for version control
- pnpm (패키지 매니저)