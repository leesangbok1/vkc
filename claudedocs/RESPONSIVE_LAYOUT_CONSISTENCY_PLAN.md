# Responsive Layout & Translation Consistency Plan

## 목표
- 모든 카드/배너/탭/컨트롤을 한국어/영어/베트남어 + 주요 뷰포트(360/390/768/1024/1280)에서 동일한 레이아웃으로 유지
- 번역으로 텍스트가 길어져도 높이/정렬이 깨지지 않도록 사전 정의된 규칙 준수
- 사용자 직관성·명확성·효율성 우선

## 최근 업데이트 (2025-10-17)
- Right Sidebar sticky top 24px — 헤더 높이를 포함한 고정값으로 배너가 스크롤 시 항상 상단 유지
- 홈 이벤트 배너: `BannerCarousel` 3슬라이드 회전 구조 유지, 장문 번역 시 내부 스크롤 확인
- `PAGE_LAYOUT_STATUS.md` 최신화 — 미적용 페이지 7건을 커스텀 섹션으로 분리, 차후 full/centered 이관 대상 식별
- 이벤트/사이드바 배너 규칙은 UI_PATTERN_BASELINE.md에 동기화 완료

## 단계별 접근

### 1. 토큰 및 레이아웃 매트릭스 확정
- Breakpoints: 360, 390, 768, 1024, 1280 (design-system 토큰화)
- PageLayout variant별 여백/폭/정렬 표 작성 (withSidebar/centered/full)
- 카드 높이/배너 높이/사이드바 폭 등 핵심 값 CSS 변수화

### 2. 컴포넌트 패턴 점검
- 카드/리스트: `.feed-container .question-card` 룩&필 재사용, 모든 리스트 페이지 컨텍스트 확인
- 배너: UI_PATTERN_BASELINE.md에 정의된 규칙 준수(홈 캐러셀/BannerCarousel, 사이드바 카드는 고정 높이 유지)
- 드롭다운/모달/사이드바: max-height + overflow-y:auto 표준 적용, 헤더/푸터 고정
- 작은 컨트롤(탭/배지/태그): 한 줄 + ellipsis로 통일

### 3. 번역 대응 체크
- 각 컴포넌트별 번역 정책 (internal scroll vs clamp) 문서화
- `translate="no"` / `notranslate`가 필요한 상호작용 요소 목록화
- 날짜/시간 등 로케일 의존 내용은 클라이언트 전용 처리 여부 확인

### 4. 사이드바/헤더/푸터 정렬 확인
- 사이드바: 상단 배너는 `.sidebar-upper`로 분리, 뉴스 카드는 `.sidebar-pinned`(top 24px)로 sticky. 페이지 별 필요한 경우만 override.
- 헤더: 동결 범위 명시, 다국어 메뉴/툴팁 번역 가드 점검
- 푸터 영역(배너/카드): 높이 예약값 충족 여부 확인

### 5. QA 스냅샷 & 회귀 테스트
- Viewport × 언어 조합별 시각 캡처(크롬 DevTools + 번역 확장) → 비교
- 하이드레이션 경고 모니터링(콘솔/오버레이)
- 실제 입력 흐름(폼, 모달, 드롭다운)에서 스크롤/클램프 동작 확인

### 6. 문서화 & 자동화 준비
- UI_PATTERN_BASELINE.md 업데이트(새 규칙 반영)
- 작업 로그(claudedocs/WORKLOG.md) 누적
- 향후 자동 스냅샷(Cypress/Playwright) 계획 수립

## 우선순위 (P0 → P2)
1. 즉시(P0): 현재 감지한 깨짐/높이 불일치/하이드레이션 이슈 수정 (진행 중)
2. 단기(P1): 토큰/매트릭스 확정 + 컴포넌트 규칙 일괄 적용
3. 중기(P2): QA 스냅샷 루틴화 + 자동화 준비
