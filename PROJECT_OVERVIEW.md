# POI Project - Viet K-Connect (Legacy)

⚠️ **이 프로젝트는 레거시 버전입니다**

---

## 🚨 중요 공지

### 현재 상태
- **이 프로젝트**: 초기 Vanilla JS 프로토타입 (개발 중단)
- **실제 프로젝트**: `/Users/bk/Desktop/viet-kconnect` (Next.js 14 + shadcn/ui)
- **실행 중**: http://localhost:3000

**→ 새 프로젝트로 이동하세요**: `/Users/bk/Desktop/viet-kconnect/`

---

## 📱 프로젝트 개요

### 서비스명
**Viet K-Connect** - 베트남인 한국 거주자 Q&A 플랫폼

### 핵심 가치
"검증된 선배가 한국 생활 궁금증을 해결"
- 타겟: 한국 거주 베트남인 30만명
- 차별점: 실명 인증 + AI 매칭 + 최대 24시간 답변

### 주요 기능
1. **소셜 로그인**: 카카오/구글/페이스북
2. **AI 분류**: GPT-3.5 기반 질문 자동 분류
3. **스마트 매칭**: 전문가 자동 추천
4. **A/B 테스트**: 질문 우선 vs 검색 우선 UI
5. **모바일 최적화**: PWA, 360px 기준 반응형
6. **다국어 지원**: 한국어/베트남어/영어
7. **뱃지 시스템**: Senior, Expert, Verified, Helper

---

## 🏗️ 기술 스택 (레거시)

### Frontend
- **Framework**: Vanilla JavaScript + Vite
- **상태 관리**: 단일 전역 state 객체
- **라우팅**: 해시 기반 클라이언트 사이드 라우팅
- **스타일링**: CSS 변수 + BEM 패턴
- **의존성**: React/Firebase (설치되어 있지만 미사용)

### 실제 구현 (새 프로젝트)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-3.5

---

## 🎨 디자인 시스템

### 색상 테마 (베트남 국기 기반)
```css
--vietnam-red: #EA4335     /* Primary */
--vietnam-yellow: #FFCD00  /* Secondary */
--trust-green: #10B981     /* Success/Trust */
--expert-gold: #F59E0B     /* Expert badge */
```

### 뱃지 시스템
- 🎖️ **Senior**: 3년차 이상 (오렌지)
- 🏅 **Expert**: 전문가 인증 (골드)
- ✅ **Verified**: 신원 확인 (그린)
- ❤️ **Helper**: 도움 많이 줌 (블루)

---

## 🛠️ 개발 명령어 (레거시)

### 기본 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 미리보기
npm run preview
```

### 파일 구조
```
poi-main/
├── src/
│   ├── main.js           # 메인 JavaScript
│   ├── style.css         # 스타일시트
│   ├── components/       # 컴포넌트
│   ├── pages/           # 페이지 모듈
│   └── utils/           # 유틸리티
├── index.html           # HTML 진입점
└── package.json         # 패키지 설정
```

---

## ✅ 구현 완료 사항 (새 프로젝트에서)

### 완성된 기능
1. ✅ **완전한 UI 시스템** - 모든 주요 화면 구현
2. ✅ **A/B 테스트 데모** - 실시간 전환 가능
3. ✅ **모바일 반응형** - 완벽한 모바일 경험
4. ✅ **컴포넌트 라이브러리** - 재사용 가능한 UI 구성
5. ✅ **관리자 도구** - 대시보드 및 관리 기능

### 달성한 목표
- ✅ 모바일 우선 디자인
- ✅ 베트남 커뮤니티 특화 UI
- ✅ 신뢰 시각화 시스템
- ✅ A/B 테스트 인터페이스

---

## 🔮 향후 계획 (새 프로젝트)

### Phase 1: 백엔드 통합
- Supabase 데이터베이스 연동
- 실제 사용자 인증 시스템
- Real-time 알림 구현

### Phase 2: 기능 완성
- AI 기반 질문 분류
- 전문가 매칭 알고리즘
- 24시간 답변 보장 시스템

### Phase 3: 고도화
- PWA 기능 추가
- 다국어 자동 번역
- 고급 분석 도구

---

## 💡 참고 정보

### 프로젝트 히스토리
- 이 프로젝트의 핵심 기능과 UI 디자인은 새 Next.js 프로젝트에 반영됨
- A/B 테스트 컨셉과 베트남 커뮤니티 특화 기능이 계승됨
- 레거시 코드는 참고용으로만 보존

### 개발 환경
- **개발 완료**: 2025년 9월 18일
- **개발자**: Claude (AI Assistant)
- **상태**: UI 프로토타입 완성, 개발 중단
- **다음 단계**: `/Users/bk/Desktop/viet-kconnect/`에서 백엔드 통합

---

## 🔗 관련 문서

- `TECHNICAL_DOCS.md`: 상세 기술 문서 및 아키텍처
- `PROJECT_PLAN.md`: 작업 계획 및 마일스톤
- `METHODOLOGY.md`: 개발 방법론
- `create-designs.md`: 테마 시스템 설계

---

*이 프로젝트는 레거시 버전입니다. 실제 개발은 `/Users/bk/Desktop/viet-kconnect/`에서 진행하세요.*