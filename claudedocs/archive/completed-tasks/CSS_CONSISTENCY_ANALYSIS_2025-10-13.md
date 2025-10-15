# CSS 일관성 분석 보고서
**분석 날짜**: 2025-10-13
**분석 범위**: 전체 프로젝트 22개 .tsx 페이지
**기준 페이지**: `/app/page.tsx` (메인 페이지 - ✅ 수정 완료)

---

## 📋 요약 (Executive Summary)

### 총 위반 사항
- **Inline Style 위반**: 273건 (12개 파일)
- **Tailwind Class 위반**: 390건 (12개 파일)
- **총 위반 건수**: 663건

### 우선순위 분류
- **CRITICAL (>50 위반)**: 4개 페이지 - 320건 (48.3%)
- **HIGH (20-49 위반)**: 6개 페이지- 245건 (37.0%)
- **MEDIUM (10-19 위반)**: 5개 페이지 - 76건 (11.5%)
- **LOW (<10 위반)**: 7개 페이지 - 22건 (3.3%)

---

## 🚨 CRITICAL 우선순위 (4개 페이지 - 320건)

### 1. `/app/questions/[id]/page.tsx` - 질문 상세 페이지
- **Inline Styles**: 81건 ⚠️
- **파일 크기**: 514 lines
- **위반 구간**: Lines 194-508
- **영향도**: 핵심 페이지 - 사용자가 가장 많이 방문
- **수정 필요 컴포넌트**:
  - Question header, author info, vote buttons
  - Answer cards, comment threads
  - Action buttons, modals

### 2. `/app/admin/page.tsx` - 관리자 페이지
- **Tailwind Classes**: 114건 🚨
- **위반 유형**: Shadcn/UI 컴포넌트 사용
- **비고**: 관리자 전용 페이지이므로 우선순위 조정 가능

### 3. `/app/settings/notifications/page.tsx` - 알림 설정 페이지
- **Tailwind Classes**: 73건 🚨
- **위반 유형**: Shadcn/UI 컴포넌트 사용
- **비고**: 설정 페이지 - 사용 빈도 낮음

### 4. `/app/questions/new/page.tsx` - 질문 작성 페이지
- **Inline Styles**: 52건 ⚠️
- **파일 크기**: 341 lines
- **위반 구간**: Lines 172-339
- **영향도**: 핵심 페이지 - 사용자 입력 필수
- **수정 필요 컴포넌트**:
  - Form fields, textarea, select dropdowns
  - Character counters, validation messages
  - Submit buttons, help text

---

## ⚠️ HIGH 우선순위 (6개 페이지 - 245건)

### 5. `/app/profile/page.tsx` - 프로필 페이지
- **Tailwind Classes**: 62건
- **위반 유형**: Shadcn/UI 컴포넌트
- **비고**: 프로필 조회 빈도 중간

### 6. `/app/categories/page.tsx` - 카테고리 목록
- **Tailwind Classes**: 47건
- **영향도**: 탐색 페이지 - 자주 사용

### 7. `/app/categories/[slug]/page.tsx` - 카테고리 상세
- **Tailwind Classes**: 43건
- **영향도**: 탐색 페이지

### 8. `/app/settings/interests/page.tsx` - 관심분야 설정
- **Tailwind Classes**: 33건
- **영향도**: 온보딩/설정 페이지

### 9. `/app/topics/page.tsx` - 토픽 페이지
- **Inline Styles**: 33건
- **Tailwind Classes**: 1건
- **파일 크기**: 383 lines
- **위반 구간**: Lines 183-380

### 10. `/app/my-questions/page.tsx` - 내 질문 페이지
- **Inline Styles**: 24건
- **파일 크기**: 255 lines
- **위반 구간**: Lines 80-246
- **영향도**: 사용자 페이지

---

## 📊 MEDIUM 우선순위 (5개 페이지 - 76건)

### 11. `/app/notifications/page.tsx` - 알림 페이지
- **Inline Styles**: 19건
- **파일 크기**: 290 lines
- **위반 구간**: Lines 112-282

### 12. `/app/auth/login/page.tsx` - 로그인 페이지
- **Inline Styles**: 19건
- **파일 크기**: 88 lines
- **위반 구간**: Lines 46-85
- **영향도**: 핵심 진입점 - 수정 우선 고려

### 13. `/app/search/page.tsx` - 검색 페이지
- **Inline Styles**: 15건
- **파일 크기**: 106 lines
- **위반 구간**: Lines 38-102

### 14. `/app/error.tsx` - 에러 페이지
- **Inline Styles**: 13건
- **비고**: 에러 상황 전용

### 15. `/app/not-found.tsx` - 404 페이지
- **Inline Styles**: 10건
- **비고**: 404 상황 전용

---

## ✅ LOW 우선순위 (7개 페이지 - 22건)

### 16. `/app/test/notifications/page.tsx`
- **Tailwind Classes**: 9건
- **비고**: 테스트 페이지 - 우선순위 낮음

### 17. `/app/posts/new/page.tsx`
- **Inline Styles**: 4건
- **비고**: 대부분 올바른 CSS 사용 중

### 18. `/app/onboarding/page.tsx`
- **Inline Styles**: 2건
- **Tailwind Classes**: 4건

### 19. `/app/experts/apply/page.tsx`
- **Inline Styles**: 1건
- **비고**: 거의 완벽

### 20. `/app/settings/page.tsx`
- **Tailwind Classes**: 2건
- **비고**: 좋은 예시

### 21. `/app/page.tsx` (메인 페이지)
- **Tailwind Classes**: 1건
- **비고**: ✅ Sidebar inline styles 제거 완료

### 22. `/app/monitoring/page.tsx`
- **Tailwind Classes**: 1건

---

## 🎯 수정 전략

### Phase 1: CRITICAL 페이지 (4개)
**목표**: 핵심 사용자 경험 개선
**예상 작업 시간**: 2-3시간

1. ✅ `/app/page.tsx` - 메인 페이지 (완료)
2. `/app/questions/[id]/page.tsx` - 질문 상세 (81건)
3. `/app/questions/new/page.tsx` - 질문 작성 (52건)
4. `/app/auth/login/page.tsx` - 로그인 (19건) - MEDIUM에서 승격

### Phase 2: HIGH 페이지 (6개)
**목표**: 탐색 및 개인화 경험 개선
**예상 작업 시간**: 3-4시간

5. `/app/topics/page.tsx` - 토픽 (33건)
6. `/app/my-questions/page.tsx` - 내 질문 (24건)
7. `/app/categories/page.tsx` - 카테고리 (47건)
8. `/app/categories/[slug]/page.tsx` - 카테고리 상세 (43건)
9. `/app/settings/interests/page.tsx` - 관심분야 (33건)

### Phase 3: MEDIUM 페이지 (4개)
**목표**: 보조 기능 페이지 개선
**예상 작업 시간**: 1-2시간

10. `/app/notifications/page.tsx` - 알림 (19건)
11. `/app/search/page.tsx` - 검색 (15건)
12. `/app/error.tsx` - 에러 페이지 (13건)
13. `/app/not-found.tsx` - 404 (10건)

### Phase 4: Tailwind/Shadcn 페이지 검토
**목표**: 디자인 시스템 일관성 평가

- `/app/admin/page.tsx` - 관리자 (114건)
- `/app/profile/page.tsx` - 프로필 (62건)
- `/app/settings/notifications/page.tsx` - 알림 설정 (73건)

**결정 필요**: Shadcn/UI 컴포넌트 사용 계속 vs globals.css로 마이그레이션

---

## 📐 기준 CSS 패턴 (메인 페이지 기준)

### ✅ 올바른 레이아웃 구조
```tsx
<main className="main-layout">
  <div className="mobile-hero">...</div>
  <div className="mobile-category-grid">...</div>
  <div className="container">
    <div className="main-content">...</div>
    <div className="sidebar">...</div>
  </div>
</main>
```

### ✅ 올바른 컴포넌트 클래스
- `.question-card`, `.question-header`, `.question-stats`
- `.category-tabs`, `.category-tab`
- `.event-banner`, `.feed-container`
- `.btn-primary`, `.btn-secondary`, `.action-btn`
- `.sidebar-card`, `.sidebar-title`
- `.ad-banner-gradient`, `.news-item-layout`, `.ranking-list`

### ❌ 절대 금지
- `style={{ ... }}` (inline styles)
- Tailwind classes (except for Shadcn/UI components if approved)
- 모든 스타일은 `/app/globals.css`에 정의

---

## 🔍 다음 단계

1. ✅ Phase 1 시작 - `/app/questions/[id]/page.tsx` 수정
2. CSS 클래스 생성 및 inline styles 제거
3. 반응형 테스트 (Desktop/Tablet/Mobile)
4. 각 페이지 수정 후 TODO 업데이트
5. 최종 전체 페이지 일관성 검증

---

**작성자**: Claude Code
**최종 업데이트**: 2025-10-13
