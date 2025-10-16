# Worklog

원칙: 작업 전 기존 작업 확인 → 패턴 기준 검토 → 변경 → 기록.

## 2025-10-16
- 작업: PageLayout 도입 및 주요 페이지 적용 (centered/withSidebar)
- 커밋: be5c0f0, 44acbd3, 9d2ad8b, 99b9022
- 기준/패턴:
  - centered: settings/profile/notifications/missions/bookmarks/wallet/following/topics/categories/posts/events
  - withSidebar: questions 상세
- 사전 확인:
  - 기존 레이아웃 사용 현황 점검 (main-layout/Sidebar 유무)
  - Sidebar 정책과 일치 여부 검토
- 사후 점검:
  - 빌드 영향 없음(문서/구조 변경), 데이터 로직 무변경 확인
  - 헤더/사이드바 정렬 CSS는 별도 단계에서 리팩터 예정

다음: admin/certifications, 홈 페이지 정리 및 Header/Sidebar 정렬 고도화(sticky/계산식 제거)

### 추가
- 작업: Admin Certifications 페이지 PageLayout 적용(centered)
- 커밋: (추가) — 반영됨
- 비고: 헤더 비수정 가이드 준수

### 추가 2
- 작업: Home(withSidebar), Search, My Questions, Login, Experts Apply 페이지 PageLayout 적용
- 커밋: 84eae88
- 비고: 헤더 비수정, 데이터 로직 무변경, 로딩 분기 centered로 통일

### 추가 3
- 작업: 번역 확장 텍스트 대응 글로벌 규칙 추가(styles/translation-safe.css), globals에 import
- 커밋: d50402c
- 규칙:
  - 텍스트 상자 래핑 강화(overflow-wrap:anywhere, word-break:break-word, hyphens:auto)
  - 모달/드롭다운/사이드바 카드: 최대 높이 80vh + 세로 스크롤
  - 작은 UI 컨트롤(탭/배지/필): ellipsis 처리
