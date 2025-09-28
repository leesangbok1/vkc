# Viet K-Connect UI/UX 개선 계획

## 디자인 요구사항 및 사양

### 1. Question Card Component (Priority: Critical)

#### Hybrid Design: Reddit 카드 레이아웃 + StackOverflow 투표 시스템

```typescript
QuestionCard {
  layout: "elevated-card-shadow", // 8px elevation, rounded corners
  dimensions: "full-width × auto-height",

  header: {
    trustBadge: "top-right-corner", // "🇰🇷 5년차" + verification checkmark
    urgencyLevel: "color-coded-border", // Red(urgent) → Green(normal)
    category: "icon + text", // 🛂 비자/법률
    timeStamp: "relative-time" // "2시간 전"
  },

  content: {
    title: "max-2-lines + ellipsis",
    preview: "max-3-lines + read-more",
    tags: "chip-style-badges", // #E7비자 #서울
    engagement: "vote-count + answer-count + view-count"
  },

  footer: {
    authorInfo: "avatar + name + residence-years",
    actionButtons: "answer-cta + bookmark + share",
    matchingStatus: "AI매칭완료 | 전문가 5명 선정" // when applicable
  }
}
```

### 2. Trust System Visualization (Priority: Critical)

```typescript
TrustSystemUI {
  userBadge: {
    residenceYears: "🇰🇷 5년차", // prominent display
    visaType: "E-7 삼성전자", // company + visa type
    verificationLevel: "✅ 인증됨", // green checkmark
    trustScore: "⭐ 847점" // numerical score
  },

  expertCard: {
    layout: "swipeable-tinder-style",
    photo: "circular-avatar-120px",
    info: ["name", "residence-years", "specialty-tags", "response-rate"],
    matchScore: "percentage-display", // "매칭도 94%"
    actions: ["선택하기", "프로필보기", "패스"]
  }
}
```

### 3. A/B Test Interface Optimization

```typescript
ABTestVersions {
  versionA: "question-first" {
    hero: {
      component: "large-question-input-box",
      placeholder: "F-2-R 비자 신청, 어디서부터 시작해야 할까요?",
      style: "hashnode-inspired-centered",
      cta: "질문 등록하기" // primary-button-prominent
    },
    layout: "timeline-feed", // stackoverflow-style
    sidebar: "recent-questions + trending-topics"
  },

  versionB: "search-first" {
    hero: {
      component: "search-bar-with-categories",
      placeholder: "궁금한 것을 검색하세요 (예: F-2-R 비자)",
      style: "reddit-inspired-centered",
      cta: "답변 찾기" // secondary-button-search
    },
    layout: "card-grid-feed", // reddit-style
    sidebar: "category-navigation + expert-list"
  }
}
```

### 4. Navigation & Information Architecture

```typescript
NavigationSystem {
  header: {
    logo: "viet-k-connect-wordmark",
    search: "global-search-bar", // always visible
    userMenu: "avatar + dropdown + notifications",
    languageToggle: "KO | EN | VI"
  },

  sidebar: {
    categories: [
      "🛂 비자/법률", "🏠 주거", "💼 취업",
      "🎓 교육", "🏥 의료", "🍜 생활"
    ],
    quickActions: ["질문하기", "전문가되기", "내프로필"],
    topExperts: "mini-leaderboard",
    stats: "실시간 통계" // questions-today, response-rate
  }
}
```

### 5. AI Matching Process UI

```typescript
AIMatchingFlow {
  step1: {
    title: "질문 분석 중...",
    animation: "typing-indicator + progress-bar",
    content: "AI가 카테고리와 긴급도를 분석하고 있습니다"
  },

  step2: {
    title: "전문가 매칭 중...",
    animation: "search-radar + loading-spinner",
    content: "거주년차와 전문성을 기반으로 매칭 중입니다"
  },

  step3: {
    title: "매칭 완료! 5명의 전문가를 찾았습니다",
    animation: "success-checkmark + confetti",
    content: "swipeable-expert-cards + 24hr-timer"
  }
}
```

### 6. Mobile-First Responsive Design

```css
/* Mobile breakpoints and thumb-zone optimization */
@media (max-width: 768px) {
  .thumb-zone-actions {
    position: fixed;
    bottom: 80px; /* thumb-friendly zone */
    width: 100%;
    padding: 16px;
  }

  .question-card {
    margin: 8px;
    padding: 16px;
    font-size: 16px; /* minimum for mobile */
  }

  .trust-badge {
    font-size: 12px;
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
```

### 7. Real-time Features & Micro-interactions

```typescript
RealTimeFeatures {
  notifications: {
    newAnswer: "slide-in-animation + sound",
    expertMatch: "push-notification + badge-update",
    questionViewed: "real-time-view-counter"
  },

  microInteractions: {
    likeButton: "heart-animation + bounce",
    bookmarkButton: "save-to-collection + slide",
    shareButton: "social-share-modal + copy-link"
  },

  loadingStates: {
    skeleton: "facebook-style-placeholders",
    emptyStates: "illustration + helpful-cta",
    errorStates: "friendly-message + retry-button"
  }
}
```

## 구현 계획

### Phase 1: 프로젝트 설정 및 기반 구축
1. **Tailwind CSS 설치 및 설정**
   - tailwindcss, autoprefixer, postcss 설치
   - tailwind.config.js 생성 및 커스텀 설정
   - 디자인 시스템 색상, 폰트, 스페이싱 설정

2. **디자인 시스템 구축**
   - 색상 팔레트: 신뢰도 레벨, 카테고리별 색상
   - 타이포그래피 시스템
   - 스페이싱 및 레이아웃 그리드

### Phase 2: 핵심 컴포넌트 재설계

#### 2.1 QuestionCard 컴포넌트 개선
```
src/components/questions/EnhancedQuestionCard.jsx
```
- Reddit 카드 레이아웃 + StackOverflow 투표 시스템
- Trust Badge (🇰🇷 거주년차 + 인증마크)
- 긴급도 색상 코딩 (border-color)
- 카테고리 아이콘 시스템
- 실시간 engagement 지표

#### 2.2 Trust System UI 구현
```
src/components/trust/TrustBadge.jsx
src/components/trust/ExpertCard.jsx
```
- 거주년차 시각화
- 비자 타입 및 회사 정보
- 전문가 매칭도 표시
- Tinder 스타일 스와이프 카드

#### 2.3 AI Matching Flow
```
src/components/ai/AIMatchingFlow.jsx
src/components/ai/MatchingAnimation.jsx
```
- 3단계 프로세스 UI
- 애니메이션 및 프로그레스 표시
- 전문가 카드 스와이프 인터페이스

### Phase 3: A/B 테스트 구현

#### 3.1 Version A: Question-First
```
src/pages/HomePageVersionA.jsx
```
- 대형 질문 입력 박스 중앙 배치
- StackOverflow 스타일 타임라인 피드
- 사이드바에 최근 질문/트렌딩 토픽

#### 3.2 Version B: Search-First
```
src/pages/HomePageVersionB.jsx
```
- 검색바 + 카테고리 중앙 배치
- Reddit 스타일 카드 그리드 레이아웃
- 사이드바에 카테고리/전문가 리스트

#### 3.3 A/B 테스트 라우터
```
src/utils/abTestManager.js
```

### Phase 4: 네비게이션 및 정보 구조

#### 4.1 Header 재설계
```
src/components/layout/EnhancedHeader.jsx
```
- 글로벌 검색바 항상 표시
- 언어 토글 (KO|EN|VI)
- 알림 시스템 통합

#### 4.2 Sidebar 구현
```
src/components/layout/Sidebar.jsx
```
- 카테고리 아이콘 네비게이션
- 빠른 액션 버튼
- 실시간 통계 위젯
- 전문가 리더보드

### Phase 5: 모바일 최적화

#### 5.1 반응형 디자인
- Mobile-first 접근
- Thumb zone 최적화 (하단 80px)
- 터치 타겟 최소 44px
- 최소 폰트 크기 16px

#### 5.2 모바일 전용 컴포넌트
```
src/components/mobile/MobileNav.jsx
src/components/mobile/MobileQuestionCard.jsx
```

### Phase 6: 마이크로 인터랙션 및 실시간 기능

#### 6.1 애니메이션
- Framer Motion 라이브러리 사용
- 좋아요 하트 애니메이션
- 북마크 슬라이드 효과
- 카드 호버 효과 (8px elevation)

#### 6.2 실시간 기능
```
src/components/realtime/RealtimeNotification.jsx
src/components/realtime/ViewCounter.jsx
```

### Phase 7: 성능 및 접근성

#### 7.1 Core Web Vitals 최적화
- First Contentful Paint < 2초
- Lazy loading 구현
- 이미지 최적화

#### 7.2 접근성
- WCAG 2.1 AA 준수
- 스크린 리더 호환
- 키보드 네비게이션

## 파일 구조
```
src/
├── components/
│   ├── questions/
│   │   ├── EnhancedQuestionCard.jsx
│   │   └── QuestionForm.jsx
│   ├── trust/
│   │   ├── TrustBadge.jsx
│   │   └── ExpertCard.jsx
│   ├── ai/
│   │   ├── AIMatchingFlow.jsx
│   │   └── MatchingAnimation.jsx
│   ├── layout/
│   │   ├── EnhancedHeader.jsx
│   │   └── Sidebar.jsx
│   └── mobile/
│       ├── MobileNav.jsx
│       └── MobileQuestionCard.jsx
├── pages/
│   ├── HomePageVersionA.jsx
│   └── HomePageVersionB.jsx
├── styles/
│   ├── globals.css
│   └── components/
└── utils/
    └── abTestManager.js
```

## 성공 지표 및 테스팅

### Mobile Usability
- Touch target size ≥44px
- Thumb zone optimization
- Smooth scrolling performance

### Performance
- First Contentful Paint <2s
- Core Web Vitals Green
- Lighthouse score >90

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support

### A/B Test KPIs
- Question completion rate
- Expert engagement rate
- User retention metrics
- Response time improvement

## 구현 순서 및 예상 시간

1. **Tailwind CSS 설정** (30분)
   - 패키지 설치 및 설정
   - 기본 테마 구성

2. **디자인 시스템 구축** (1시간)
   - 색상 팔레트 정의
   - 타이포그래피 설정
   - 컴포넌트 스타일 가이드

3. **EnhancedQuestionCard 구현** (2시간)
   - 레이아웃 구조
   - Trust Badge 통합
   - 인터랙션 추가

4. **Trust System UI 구현** (1.5시간)
   - Trust Badge 컴포넌트
   - Expert Card 컴포넌트
   - 스와이프 인터페이스

5. **AI Matching Flow 구현** (1.5시간)
   - 3단계 플로우 UI
   - 애니메이션 효과
   - 매칭 결과 표시

6. **A/B 테스트 홈페이지 구현** (2시간)
   - Version A (Question-First)
   - Version B (Search-First)
   - A/B 테스트 매니저

7. **헤더/사이드바 재설계** (1.5시간)
   - Enhanced Header
   - Sidebar 네비게이션
   - 반응형 처리

8. **모바일 최적화** (1시간)
   - 반응형 레이아웃
   - 터치 최적화
   - 모바일 전용 컴포넌트

9. **마이크로 인터랙션 추가** (1시간)
   - 애니메이션 효과
   - 실시간 업데이트
   - 로딩/에러 상태

10. **테스트 및 최적화** (30분)
    - 성능 테스트
    - 접근성 검증
    - 사용자 테스트

**총 예상 시간: 12시간**

## Next Steps

이 계획은 현재 React/Vite/Firebase 구조에서 직접 구현하거나,
향후 Next.js 마이그레이션 후 TypeScript로 재구현할 수 있도록
설계되었습니다.

Hybrid 접근법을 사용할 경우:
1. 먼저 Figma에서 디자인 시스템 구축
2. 컴포넌트 프로토타입 제작
3. Next.js 마이그레이션과 함께 구현