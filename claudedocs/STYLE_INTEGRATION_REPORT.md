# VietKConnect 스타일 통합 작업 보고서

**작성일**: 2025-10-14
**목적**: 메인페이지의 일관된 디자인 시스템을 모든 페이지와 모달에 적용

---

## 📊 현황 분석

### 1. 스타일 가이드 작성 완료
✅ **파일**: `/claudedocs/STYLE_GUIDE_UNIFIED.md`

다음 항목을 포함한 종합 스타일 가이드 문서화:
- 색상 시스템 (브랜드, 회색, 탭, 4-Tier 권한)
- 타이포그래피 (폰트, 크기, 두께, 줄간격)
- 레이아웃 시스템 (3단 구조: Content 700px + Sidebar 320px)
- 간격 시스템 (4px 기반, 3-Tier Aha-inspired)
- Border Radius, 그림자, 트랜지션
- 컴포넌트 스타일 (버튼, 카드, 입력, 탭, 뱃지, 헤더)
- 반응형 디자인 가이드라인

### 2. 발견된 페이지 (총 24개)

#### ✅ 이미 스타일 적용된 페이지 (2개)
1. `/` - **메인 페이지** ✅
   - 레이아웃: `main-layout` + `main-content` + `Sidebar`
   - 탭: Category tabs (Popular/Topic/Following)
   - 색상: 일관된 회색 계열 사용
   - 스타일: 완전 적용됨

2. `/questions` - **질문 목록 페이지** ✅
   - 레이아웃: `main-layout` 구조 사용
   - 컴포넌트: Tab navigation, Filter bar, Question cards
   - CSS: globals.css에 모든 스타일 정의됨
   - 스타일: 완전 적용됨

3. `/questions/[id]` - **질문 상세 페이지** ✅
   - 레이아웃: `question-detail-layout` 구조
   - 컴포넌트: Breadcrumb, Answer form, Answer cards
   - CSS: globals.css에 스타일 정의됨
   - 스타일: 완전 적용됨

#### 🔄 스타일 점검 필요 페이지 (21개)

**Phase 1: 핵심 페이지 (즉시 점검)**
4. `/questions/new` - 질문 작성 페이지
5. `/profile` - 프로필 페이지
6. `/settings` - 설정 페이지

**Phase 2: 부가 페이지 (1주 내)**
7. `/topics` - 토픽 페이지
8. `/following` - 팔로잉 페이지
9. `/notifications` - 알림 페이지
10. `/search` - 검색 페이지
11. `/posts/[id]` - 포스트 상세

**Phase 3: 관리자/인증 (2주 내)**
12. `/admin` - 관리자 페이지
13. `/auth/login` - 로그인 페이지
14. `/onboarding` - 온보딩 페이지
15. `/experts/apply` - 인증 신청 페이지

**Phase 4: 기타 (3주 내)**
16. `/categories` - 카테고리 페이지
17. `/categories/[slug]` - 카테고리 상세
18. `/monitoring` - 모니터링
19. `/my-questions` - 내 질문
20. `/posts/new` - 포스트 작성
21. `/users/[id]` - 사용자 프로필
22. `/settings/interests` - 관심사 설정
23. `/settings/notifications` - 알림 설정
24. `/test/notifications` - 알림 테스트

### 3. 발견된 모달 컴포넌트 (4개)

#### 🔄 스타일 적용 필요
1. `LoginPromptModal` - 로그인 유도 모달
2. `TopicSelectionModal` - 토픽 선택 모달
3. `EmailCollectionModal` - 이메일 수집 모달
4. `NotificationSetupModal` - 알림 설정 모달

---

## 🎨 핵심 디자인 시스템

### 색상 원칙
```css
/* ✅ 올바른 사용 */
--vk-primary: #5682ef;          /* 브랜드 파란색 */
--gray-700: #374151;            /* 본문 텍스트 */
--gray-200: #e5e7eb;            /* 테두리 */

/* ❌ 금지된 사용 */
color: #000000;                 /* 순수 검정 금지 */
color: #1a1a1a;                 /* 다크 계열 금지 */
background: #333;               /* 어두운 회색 금지 */
```

### 레이아웃 구조
```tsx
// ✅ 표준 페이지 구조
<main className="main-layout">
  <div className="main-content">
    {/* 메인 컨텐츠 (700px) */}
  </div>
  <Sidebar />
</main>

// ✅ 카드 구조
<div className="card">
  <div className="card-header">
    {/* 헤더 */}
  </div>
  <div className="card-content">
    {/* 본문 */}
  </div>
  <div className="card-footer">
    {/* 푸터 */}
  </div>
</div>
```

### 간격 시스템
```css
/* 4px 기반 */
gap: 12px;                      /* space-normal (카드 내부) */
margin-bottom: 16px;            /* space-loose (요소 간) */
padding: 24px;                  /* space-6 (섹션) */
```

### 호버 효과
```css
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

---

## 📋 작업 계획

### Phase 1: 핵심 페이지 스타일 점검 (즉시)
**목표**: 사용자가 가장 많이 접하는 페이지 우선 처리

1. **`/questions/new` - 질문 작성**
   - [ ] `main-layout` 구조 확인
   - [ ] 입력 필드 스타일 통일
   - [ ] 버튼 색상 및 호버 효과
   - [ ] 에디터 툴바 스타일

2. **`/profile` - 프로필**
   - [ ] 레이아웃 구조 점검
   - [ ] 사용자 정보 카드 스타일
   - [ ] 탭 네비게이션 일관성
   - [ ] 통계 표시 스타일

3. **`/settings` - 설정**
   - [ ] 설정 페이지 레이아웃
   - [ ] 폼 요소 스타일 통일
   - [ ] 토글/체크박스 디자인
   - [ ] 저장 버튼 일관성

### Phase 2: 부가 페이지 (1주 내)
**목표**: 커뮤니티 기능 페이지 일관성 확보

4. **`/topics` - 토픽**
5. **`/following` - 팔로잉**
6. **`/notifications` - 알림**
7. **`/search` - 검색**
8. **`/posts/[id]` - 포스트 상세**

### Phase 3: 관리자/인증 (2주 내)
**목표**: 관리 및 인증 플로우 스타일 적용

9. **`/admin` - 관리자**
10. **`/auth/login` - 로그인**
11. **`/onboarding` - 온보딩**
12. **`/experts/apply` - 인증 신청**

### Phase 4: 모달 컴포넌트 (3주 내)
**목표**: 모든 모달 일관된 디자인 적용

13. **`LoginPromptModal`**
14. **`TopicSelectionModal`**
15. **`EmailCollectionModal`**
16. **`NotificationSetupModal`**

---

## ✅ 체크리스트

### 페이지 스타일 점검 항목
- [ ] `main-layout` 구조 사용
- [ ] CSS 변수 사용 (하드코딩 금지)
- [ ] 회색 계열로 다크 색상 대체
- [ ] 4px 기반 간격 시스템 준수
- [ ] 폰트 두께 적절 (400, 500, 600, 700)
- [ ] Border radius 통일 (12px 카드, 8px 버튼, 20px 탭)
- [ ] 호버 효과 (`translateY(-2px)` + shadow)
- [ ] 반응형 디자인 적용
- [ ] 트랜지션 (`200ms ease-in-out`)

### 모달 스타일 점검 항목
- [ ] 배경: `rgba(0, 0, 0, 0.5)`
- [ ] 카드: `background: white`, `border-radius: 12px`
- [ ] 패딩: `1.5rem` ~ `2rem`
- [ ] 그림자: `0 8px 24px rgba(36, 41, 46, 0.12)`
- [ ] 애니메이션: `transition: all 0.3s ease`
- [ ] 닫기 버튼 위치 및 스타일
- [ ] 버튼 색상 일관성

---

## 📊 진행 상황

### 완료된 작업 (3/24 페이지)
- ✅ 메인 페이지 (`/`)
- ✅ 질문 목록 (`/questions`)
- ✅ 질문 상세 (`/questions/[id]`)

### 진행률
- **페이지**: 3/24 (12.5%)
- **모달**: 0/4 (0%)
- **전체**: 3/28 (10.7%)

---

## 🎯 다음 단계

### 즉시 작업
1. `/questions/new` 페이지 스타일 점검 및 수정
2. `/profile` 페이지 스타일 점검
3. `/settings` 페이지 스타일 점검

### 우선순위 기준
1. **사용 빈도**: 사용자가 자주 접하는 페이지 우선
2. **영향 범위**: 많은 사용자에게 영향을 미치는 페이지
3. **완성도**: 기능이 완성된 페이지 우선
4. **의존성**: 다른 페이지에 참조되는 컴포넌트 우선

---

## 📚 참고 문서

### 스타일 가이드
- **종합 가이드**: `/claudedocs/STYLE_GUIDE_UNIFIED.md`
- **CSS 변수 정의**: `/app/globals.css` (라인 1-270)

### 레이아웃 컴포넌트
- **Header**: `/components/layout/Header.tsx`
- **Sidebar**: `/components/layout/Sidebar.tsx`
- **Main Layout**: `/app/page.tsx` 참고

### 디자인 원칙
- Material Design 3.0 기반
- Aha-inspired 간격 시스템 (tight/normal/loose)
- VietKConnect 브랜드 색상
- 다크 색상 금지 (회색 계열 사용)

---

## 🔧 기술 노트

### CSS 우선순위
```css
/* 우선순위 순서 */
1. Inline styles (피하기)
2. ID selectors (피하기)
3. Class selectors (권장)
4. Element selectors (기본)
```

### 색상 변환 가이드
```css
/* 기존 → 새로운 */
#000000 → #374151 (gray-700)
#1a1a1a → #374151 (gray-700)
#333333 → #4b5563 (gray-600)
#666666 → #6b7280 (gray-500)
#999999 → #9ca3af (gray-400)
```

### 일관성 검증 명령어
```bash
# 다크 색상 검색
grep -r "#000\|#1a1a1a\|#333" app/ components/

# 하드코딩 색상 검색
grep -r "background:\s*#\|color:\s*#" app/ components/

# CSS 변수 사용 권장
grep -r "var(--" app/ components/
```

---

## 📝 결론

### 현재 상태
- 메인페이지와 질문 관련 핵심 페이지는 일관된 스타일 적용 완료
- 나머지 21개 페이지와 4개 모달은 스타일 점검 필요

### 권장 사항
1. **즉시**: Phase 1 핵심 페이지 3개 점검 및 수정
2. **1주 내**: Phase 2 부가 페이지 5개 작업
3. **2주 내**: Phase 3 관리자/인증 페이지 4개 작업
4. **3주 내**: Phase 4 모달 컴포넌트 4개 작업

### 예상 작업량
- **페이지당 평균**: 30분 ~ 1시간
- **모달당 평균**: 20분 ~ 30분
- **전체 예상 시간**: 약 20-25시간

---

**작성자**: Claude Code
**최종 업데이트**: 2025-10-14
