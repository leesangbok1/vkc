# UI Pattern Baseline

목표: 패턴 중심 개발. 항상 기준점을 세우고, 모든 화면에 동일한 레이아웃/스타일 패턴을 적용합니다.

1) Layout 패턴
- PageLayout 컴포넌트 사용: components/layout/PageLayout.tsx:1
  - variant
    - withSidebar: 메인 콘텐츠 + 우측 사이드바(질문 상세 등)
    - centered: 중앙 정렬 1컬럼(설정/프로필/알림/지갑/토픽/카테고리/이벤트/북마크 등)
    - full: 필요 시 전체폭 화면
- 페이지 구조(권장)
  - withSidebar: <main.main-layout> → <div.container> → <div.main-content> + <aside.sidebar>
  - centered: <main.main-layout> → <div.main-container.centered> 또는 <div>
- Sidebar 정책
  - 기본: 질문/답변/홈에서는 노출, 그 외 페이지는 미노출(또는 centered)

2) CSS/토큰
- 디자인 토큰: styles/design-system.css:1 기준 사용
- 전역 유틸은 Tailwind와 중복되지 않게 유지. 신규 커스텀 유틸은 접두사 `vk-` 권장
- 레이아웃 변수: app/globals.css:200-260의 `--content-width`, `--sidebar-width`, `--layout-gap` 활용

3) 컴포넌트 패턴
- Header: 공통 헤더 유지, 툴팁/검색/언어 드롭다운 일관
- ActionBar: 공유/북마크/도움됨 동작 패턴 재사용
- Cards/Buttons: design-system의 기본 스타일 + 변형만 적용

4) 접근성/시멘틱
- 페이지 내 실제 콘텐츠 루트에 `<main>` 1개만 두는 것을 원칙으로 함
- 포커스/키보드 내비게이션·대체 텍스트 점검

5) 변경 전 확인 체크리스트(작업 전 필수)
- [ ] 이 페이지의 레이아웃 변형은? (withSidebar/centered/full)
- [ ] Sidebar 정책과 일치하는가?
- [ ] Tailwind 유틸과 커스텀 유틸 중복 없는가?
- [ ] 디자인 토큰만으로 구현 가능한가? 커스텀 색/간격 최소화
- [ ] `<main>` 중복/누락 없음, Landmark 구조 적절함

6) 커밋/PR 규칙
- 커밋 메시지 접두사: feat(layout)/refactor(layout)/chore(docs)
- PR 템플릿 체크리스트 100% 통과

