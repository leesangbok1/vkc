# POI Project - Viet K-Connect (Legacy)

✅ **현재 활성 개발 중인 프로젝트입니다**

---

## � 프로젝트 현황

### 개발 상태
- **프로젝트명**: Viet K-Connect
- **기술 스택**: React + Firebase + OpenAI 
- **개발 서버**: http://localhost:3000
- **상태**: 활성 개발 중

**📁 문서 위치**: `/docs/` 폴더에 정확한 API 및 사용자 가이드

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
- **Framework**: React (최신 버전)
- **상태 관리**: React Context + Hooks
- **라우팅**: React Router
- **스타일링**: CSS3 + 반응형 디자인
- **PWA**: Progressive Web App 지원

### Backend & Services
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (Google, Facebook, Kakao)
- **Realtime**: Firebase Realtime Database
- **Storage**: Firebase Storage  
- **AI**: OpenAI GPT-3.5 (질문 분류, 번역, 추천)
- **Hosting**: Firebase Hosting

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