# Sidebar 조건부 표시 완료 보고서

**작성일**: 2025-10-15
**작업**: 질문/답변 페이지만 Sidebar 배너 표시, 기타 페이지는 빈 사이드바
**상태**: ✅ 완료

---

## 📋 작업 요약

### 요구사항
- ✅ **질문/답변 페이지**: Certified 배너 + 최근 기사/소식 표시
- ✅ **기타 페이지**: 빈 사이드바 (레이아웃 유지만)

### 구현 방식
- Sidebar 컴포넌트에 `showContent` prop 추가
- `showContent={true}`: 배너 + 뉴스 표시 (기본값)
- `showContent={false}`: 빈 사이드바 표시

---

## 🔧 Sidebar 컴포넌트 수정

### `/components/layout/Sidebar.tsx`

#### Before
```tsx
export default function Sidebar() {
  // 항상 배너와 뉴스를 표시
  return (
    <div className="sidebar sidebar-sticky">
      <div className="sidebar-card sidebar-banner-card">
        {/* Certified 배너 */}
      </div>
      <div className="sidebar-card sidebar-news-card">
        {/* 최근 기사 */}
      </div>
    </div>
  )
}
```

#### After
```tsx
export default function Sidebar({ showContent = true }: { showContent?: boolean }) {
  // 빈 사이드바 (질문/답변 페이지가 아닌 경우)
  if (!showContent) {
    return <div className="sidebar sidebar-sticky"></div>
  }

  // 배너 + 뉴스 표시 (질문/답변 페이지)
  return (
    <div className="sidebar sidebar-sticky">
      <div className="sidebar-card sidebar-banner-card">
        {/* Certified 배너 */}
      </div>
      <div className="sidebar-card sidebar-news-card">
        {/* 최근 기사 */}
      </div>
    </div>
  )
}
```

**Props 설명**:
```tsx
showContent?: boolean
- true (기본값): 배너 + 뉴스 표시
- false: 빈 사이드바 (레이아웃만 유지)
```

---

## 📊 페이지별 적용 현황

### ✅ 배너 표시 페이지 (질문/답변)

#### 1. 메인 페이지 (`/app/page.tsx`)
```tsx
<Sidebar />  // showContent={true} (기본값)
```
- **표시 내용**: Certified 배너 + 최근 기사 3개
- **이유**: 메인 피드에서 질문/답변 표시

#### 2. 질문 목록 (`/app/questions/page.tsx`)
```tsx
<Sidebar />  // showContent={true} (기본값)
```
- **표시 내용**: Certified 배너 + 최근 기사 3개
- **이유**: 질문 목록 페이지

#### 3. 질문 상세 (`/app/questions/[id]/page.tsx`)
```tsx
<Sidebar />  // showContent={true} (기본값)
```
- **표시 내용**: Certified 배너 + 최근 기사 3개
- **이유**: 질문/답변 상세 페이지

---

### ❌ 배너 숨김 페이지 (기타)

#### 4. 설정 페이지 (`/app/settings/page.tsx`)
```tsx
<Sidebar showContent={false} />
```
- **표시 내용**: 빈 사이드바 (레이아웃만)
- **이유**: 설정 페이지는 질문/답변과 무관

#### 5. 알림 페이지 (`/app/notifications/page.tsx`)
```tsx
<Sidebar showContent={false} />
```
- **표시 내용**: 빈 사이드바 (레이아웃만)
- **이유**: 알림 페이지는 질문/답변과 무관

#### 6. 토픽 페이지 (`/app/topics/page.tsx`)
```tsx
<Sidebar showContent={false} />
```
- **표시 내용**: 빈 사이드바 (레이아웃만)
- **이유**: 토픽 선택 페이지는 질문/답변과 무관

---

## 🎨 Sidebar 내용

### Certified 배너 (질문/답변 페이지만)
```
┌─────────────────────────────┐
│ ✅ 경험 인증으로 신뢰도 높이기  │
├─────────────────────────────┤
│ "실제 경험을 검증된 지식으로   │
│  전환하세요"                  │
│                              │
│ • 외국인등록증, 재직/재학증명서│
│ • 24시간 내 관리자 심사 완료  │
│ • 프로필에 인증 뱃지 표시      │
│                              │
│ [Certified 인증 신청하기]     │
└─────────────────────────────┘
```

### 최근 기사/소식 (질문/답변 페이지만)
```
┌─────────────────────────────┐
│ 한국 최근 기사/소식 14:20 KST │
├─────────────────────────────┤
│ 2025년 E-9 비자 쿼터 확대 발표│
│ 2시간 전 | 자세히             │
├─────────────────────────────┤
│ 한국어능력시험(TOPIK) 접수 안내│
│ 5시간 전 | 자세히             │
├─────────────────────────────┤
│ 베트남인 근로자 최저임금 인상  │
│ 1일 전 | 자세히               │
├─────────────────────────────┤
│ [전체 기사 보기 →]           │
└─────────────────────────────┘
```

### 빈 사이드바 (기타 페이지)
```
┌─────────────────────────────┐
│                              │
│        (빈 공간)              │
│                              │
└─────────────────────────────┘
```

---

## ✅ 체크리스트

### Sidebar 컴포넌트
- [x] `showContent` prop 추가
- [x] `showContent={false}` 시 빈 사이드바 반환
- [x] `showContent={true}` 기본값 설정
- [x] 레이아웃 클래스 유지 (`sidebar sidebar-sticky`)

### 질문/답변 페이지 (배너 표시)
- [x] 메인 페이지 - `<Sidebar />` (기본값)
- [x] 질문 목록 - `<Sidebar />` (기본값)
- [x] 질문 상세 - `<Sidebar />` (기본값)

### 기타 페이지 (배너 숨김)
- [x] 설정 페이지 - `<Sidebar showContent={false} />`
- [x] 알림 페이지 - `<Sidebar showContent={false} />`
- [x] 토픽 페이지 - `<Sidebar showContent={false} />`

---

## 🎯 결과

### Before
- **문제점**: 모든 페이지에서 Certified 배너와 뉴스 표시
- **영향**: 설정/알림/토픽 페이지에서 불필요한 배너 노출

### After
- **질문/답변 페이지**: Certified 배너 + 뉴스 표시 ✅
- **기타 페이지**: 빈 사이드바 (레이아웃만) ✅
- **일관성**: 레이아웃 구조 유지 (main-layout + main-content + sidebar)

---

## 🔮 향후 확장

### 다른 페이지 추가 시
```tsx
// 질문/답변 관련 페이지
<Sidebar />  // 또는 <Sidebar showContent={true} />

// 기타 페이지 (설정, 프로필, 검색 등)
<Sidebar showContent={false} />
```

### Sidebar 변형 추가 가능
```tsx
// 예시: 광고만 표시
<Sidebar showContent={true} showNews={false} />

// 예시: 뉴스만 표시
<Sidebar showContent={true} showBanner={false} />
```

---

## 📊 페이지별 정리

| 페이지 | 경로 | Sidebar 내용 | showContent |
|--------|------|--------------|-------------|
| 메인 | `/` | 배너 + 뉴스 | `true` (기본) |
| 질문 목록 | `/questions` | 배너 + 뉴스 | `true` (기본) |
| 질문 상세 | `/questions/[id]` | 배너 + 뉴스 | `true` (기본) |
| 설정 | `/settings` | 빈 사이드바 | `false` |
| 알림 | `/notifications` | 빈 사이드바 | `false` |
| 토픽 | `/topics` | 빈 사이드바 | `false` |

---

**작성자**: Claude Code
**완료 시간**: 2025-10-15
**다음**: 추가 페이지 구현 시 적절한 showContent 값 설정
