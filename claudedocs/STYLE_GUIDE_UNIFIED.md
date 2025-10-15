# VietKConnect 통합 스타일 가이드

## 📋 목적
메인페이지의 일관된 디자인 시스템을 모든 페이지와 모달에 적용하여 사용자 경험의 일관성을 확보합니다.

## 🎨 디자인 시스템

### 1. 색상 시스템

#### 브랜드 색상 (Primary)
```css
--vk-primary: #5682ef;           /* 메인 파란색 */
--vk-primary-hover: #2553e5;     /* 호버 상태 */
--vk-secondary: #10b981;         /* 보조 녹색 */
--vk-danger: #f04452;            /* 경고/에러 빨강 */
--vk-warning: #f59e0b;           /* 경고 노랑 */
```

#### 회색 계열 (Gray Scale)
```css
--gray-50: #f9fafb;   /* 배경 */
--gray-100: #f3f4f6;  /* 카드 배경 */
--gray-200: #e5e7eb;  /* 테두리 */
--gray-300: #d1d5db;  /* 비활성 버튼 */
--gray-400: #9ca3af;  /* Placeholder */
--gray-500: #6b7280;  /* 보조 텍스트 */
--gray-600: #4b5563;  /* 본문 텍스트 */
--gray-700: #374151;  /* 제목 텍스트 */
--gray-800: #1f2937;  /* 강조 텍스트 */
--gray-900: #111827;  /* 헤딩 */
```

#### 탭 색상 (Category Tabs)
```css
/* 선택된 탭 */
background: #5bc0de;
color: white;

/* 선택 안된 탭 */
background: #d1d5db;
color: #4b5563;
```

#### 4-Tier 권한 시스템 색상
```css
--tier-guest: #6b7280;    /* Guest - 회색 */
--tier-user: #3b82f6;     /* User - 파랑 */
--tier-verified: #10b981; /* Verified - 녹색 */
--tier-admin: #f59e0b;    /* Admin - 주황 */
```

### 2. 타이포그래피

#### 폰트 패밀리
```css
font-family: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### 폰트 크기
```css
--text-xs: 0.75rem;    /* 12px - 작은 라벨 */
--text-sm: 0.875rem;   /* 14px - 부가 정보 */
--text-base: 1rem;     /* 16px - 본문 */
--text-lg: 1.125rem;   /* 18px - 소제목 */
--text-xl: 1.25rem;    /* 20px - 제목 */
--text-2xl: 1.5rem;    /* 24px - 큰 제목 */
--text-3xl: 1.875rem;  /* 30px - 메인 헤딩 */
```

#### 폰트 두께
```css
font-weight: 300;  /* Light */
font-weight: 400;  /* Regular - 본문 */
font-weight: 500;  /* Medium - 강조 */
font-weight: 600;  /* Semibold - 버튼, 제목 */
font-weight: 700;  /* Bold - 헤딩 */
```

#### 줄 간격
```css
line-height: 1.25;  /* Tight - 제목 */
line-height: 1.5;   /* Normal - 본문 */
line-height: 1.75;  /* Relaxed - 긴 텍스트 */
```

### 3. 레이아웃 시스템

#### 메인 레이아웃 구조
```css
--layout-max-width: 1200px;  /* 전체 레이아웃 최대 너비 */
--content-width: 700px;      /* 메인 컨텐츠 영역 */
--sidebar-width: 320px;      /* 사이드바 고정 너비 */
--layout-gap: 20px;          /* 컨텐츠-사이드바 간격 */
--container-padding: 1rem;   /* Container 패딩 */
--header-height: 64px;       /* Header 높이 */
```

#### 3단 레이아웃 구조
```
┌────────────────────────────────────────┐
│           Header (1040px)              │
├────────────────────────────────────────┤
│  Content (700px)  │  Sidebar (320px)   │
│                   │                    │
│                   │  - Banner          │
│                   │  - News (3 items)  │
└────────────────────────────────────────┘
```

#### 헤더 정렬
```css
margin: 0 auto 0 calc(50% - 520px - 20px);  /* 왼쪽 약간 이동 */
```

#### 사이드바 고정
```css
position: fixed !important;
top: 72px !important;  /* 헤더 높이 56px + 여백 16px */
right: calc((100vw - 1040px) / 2 + 1rem);
max-height: calc(100vh - 88px);
overflow-y: auto;
```

### 4. 간격 시스템 (Spacing)

#### 4px 기반 간격
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

#### Aha-inspired 3-Tier 간격
```css
--space-tight: 8px;   /* 카드 내부, 컴팩트 요소 */
--space-normal: 12px; /* 기본 섹션 패딩 */
--space-loose: 16px;  /* 주요 섹션 구분 */
```

### 5. Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - 작은 요소 */
--radius-md: 0.5rem;    /* 8px - 버튼 */
--radius-lg: 0.75rem;   /* 12px - 카드 */
--radius-xl: 1rem;      /* 16px - 큰 카드 */
--radius-2xl: 1.5rem;   /* 24px - 특별 요소 */
--radius-full: 9999px;  /* 완전 둥근 버튼/탭 */
```

### 6. 그림자 (Shadows)

```css
/* 헤더 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

/* 카드 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* 호버 상태 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* 드롭다운 */
box-shadow: 0 8px 24px rgba(36, 41, 46, 0.12);

/* 버튼 강조 */
box-shadow: 0 4px 12px rgba(86, 130, 239, 0.25);
```

### 7. 트랜지션 (Transitions)

```css
--transition-fast: 150ms ease-in-out;   /* 버튼, 호버 */
--transition-base: 200ms ease-in-out;   /* 일반 */
--transition-slow: 300ms ease-in-out;   /* 드롭다운, 모달 */
```

## 🎯 컴포넌트 스타일

### 1. 버튼 (Buttons)

#### Primary Button
```css
.btn-primary {
  background: #5682ef;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2553e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 239, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: #4b5563;
  border: 1.5px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #5682ef;
  color: #5682ef;
}
```

### 2. 카드 (Cards)

#### 기본 카드
```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

#### 사이드바 카드
```css
.sidebar-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.sidebar-card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}
```

### 3. 입력 필드 (Input Fields)

#### 텍스트 입력
```css
.input {
  padding: 0.875rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #5682ef;
  box-shadow: 0 0 0 3px rgba(86, 130, 239, 0.1);
}

.input::placeholder {
  color: #9ca3af;
}
```

#### 검색 입력
```css
.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;  /* 왼쪽에 아이콘 공간 */
  border: 1.5px solid #e5e7eb;
  border-radius: 24px;  /* 둥근 검색창 */
  background: #f9fafb;
}

.search-input:hover {
  background: white;
  border-color: #5682ef;
}
```

### 4. 탭 (Tabs)

#### Category Tabs
```css
.category-tabs {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
  overflow-x: auto;
}

.category-tab {
  padding: 0.875rem 1.75rem;
  background: #d1d5db;  /* 선택 안됨 */
  color: #4b5563;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-tab.active {
  background: #5bc0de;  /* 선택됨 */
  color: white;
  box-shadow: 0 3px 10px rgba(91, 192, 222, 0.3);
}

.category-tab:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.category-tab.active:hover {
  background: #5bc0de;
}
```

### 5. 뱃지 (Badges)

#### Trust Badge
```css
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #10b981;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

#### Role Badge
```css
.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-guest { background: #6b7280; color: white; }
.role-user { background: #3b82f6; color: white; }
.role-verified { background: #10b981; color: white; }
.role-admin { background: #f59e0b; color: white; }
```

### 6. 헤더 (Header)

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: #fafbfc;
  border-bottom: 1px solid #e1e4e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 56px;
}

.header-container {
  max-width: 1040px;
  margin: 0 auto 0 calc(50% - 520px - 20px);
  padding: 0 1rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}
```

## 📱 반응형 디자인

### 브레이크포인트
```css
/* Mobile */
@media (max-width: 768px) {
  /* 모바일 스타일 */
}

/* Tablet */
@media (max-width: 1024px) {
  .sidebar { display: none; }
  .main-content { max-width: 100%; }
}

/* Desktop */
@media (min-width: 1025px) {
  /* 데스크톱 스타일 */
}
```

## 🎯 적용 가이드라인

### 페이지 구조
모든 페이지는 다음 구조를 따릅니다:

```tsx
<div className="main-layout">
  <div className="main-content">
    {/* 메인 컨텐츠 */}
  </div>
  <Sidebar />
</div>
```

### 색상 사용 원칙
1. **텍스트**: `#374151` (gray-700) ~ `#111827` (gray-900)
2. **배경**: `white` ~ `#f9fafb` (gray-50)
3. **테두리**: `#e5e7eb` (gray-200)
4. **강조**: `#5682ef` (vk-primary)
5. **다크 색상 금지**: 검정색 대신 회색 계열 사용

### 간격 사용 원칙
1. **카드 내부**: `12px` (space-normal)
2. **요소 간격**: `16px` (space-loose)
3. **섹션 간격**: `24px` (space-6)

### 호버 효과
모든 인터랙티브 요소는:
1. `transform: translateY(-2px)` 또는 `translateY(-1px)`
2. `box-shadow` 증가
3. `transition: all 0.2s ease`

## 📋 체크리스트

### 새 페이지 생성 시
- [ ] 메인 레이아웃 구조 사용 (`main-layout`, `main-content`)
- [ ] 색상 변수 사용 (하드코딩 금지)
- [ ] 회색 계열로 다크 색상 대체
- [ ] 간격 시스템 준수 (4px 기반)
- [ ] 폰트 두께 적절히 사용 (400, 500, 600, 700)
- [ ] 반응형 디자인 적용
- [ ] 호버 효과 추가
- [ ] Border radius 통일 (12px 카드, 8px 버튼)

### 모달 생성 시
- [ ] 배경: `rgba(0, 0, 0, 0.5)`
- [ ] 카드: `background: white`, `border-radius: 12px`
- [ ] 패딩: `1.5rem` ~ `2rem`
- [ ] 그림자: `0 8px 24px rgba(36, 41, 46, 0.12)`
- [ ] 애니메이션: `transition: all 0.3s ease`

## 🔧 마이그레이션 우선순위

### Phase 1: 핵심 페이지 (즉시)
1. `/questions` - 질문 목록
2. `/questions/[id]` - 질문 상세
3. `/questions/new` - 질문 작성
4. `/profile` - 프로필
5. `/settings` - 설정

### Phase 2: 부가 페이지 (1주 내)
6. `/topics` - 토픽
7. `/following` - 팔로잉
8. `/notifications` - 알림
9. `/search` - 검색
10. `/posts/[id]` - 포스트 상세

### Phase 3: 관리자/인증 (2주 내)
11. `/admin` - 관리자
12. `/auth/login` - 로그인
13. `/onboarding` - 온보딩
14. `/experts/apply` - 인증 신청

### Phase 4: 모달 (3주 내)
15. `LoginPromptModal`
16. `TopicSelectionModal`
17. `EmailCollectionModal`
18. `NotificationSetupModal`

## 📚 참고 자료

### CSS Variables 위치
- 파일: `/app/globals.css`
- 라인: 1-270 (모든 CSS 변수 정의)

### 레이아웃 컴포넌트
- Header: `/components/layout/Header.tsx`
- Sidebar: `/components/layout/Sidebar.tsx`
- Main Layout: `/app/page.tsx` 참고

### 디자인 시스템
- Material Design 3.0 기반
- Aha-inspired 간격 시스템
- VietKConnect 브랜드 색상
