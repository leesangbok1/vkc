# 🇻🇳 Viet K-Connect

**베트남인 한국생활 Q&A 플랫폼 - MVP 버전**

*한국에 거주하는 베트남인들을 위한 간단하고 빠른 질문과 답변 커뮤니티*

---

## 📋 프로젝트 개요

### 🎯 목표
- **간단한 QnA**: 질문 작성 → 답변 → 채택의 단순한 플로우
- **구글 로그인**: 10초 만에 가입 완료
- **모바일 우선**: 80% 모바일 사용자를 위한 최적화

### 📊 현재 상태
- **완성도**: 67% (기반 구조 완료)
- **기술 스택**: Next.js 14 + Supabase + TypeScript
- **목표**: 2주 내 MVP 베타 배포

---

## 🚀 빠른 시작

### 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/your-username/viet-kconnect.git
cd viet-kconnect

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase 정보 입력

# 개발 서버 시작
npm run dev
```

### 주요 명령어
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run test         # 테스트 실행
npm run lint         # 코드 검사
```

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React built-in hooks

### Backend
- **Database**: PostgreSQL 14 (Supabase)
- **Auth**: Supabase Auth (Google OAuth)
- **Hosting**: Vercel

### 제거된 복잡한 기능
- ❌ AI 기능 (OpenAI)
- ❌ 다중 OAuth
- ❌ 복잡한 알림 시스템
- ❌ 다국어 지원

---

## 📚 문서

### 핵심 문서
| 문서 | 설명 | 상태 |
|------|------|------|
| [MVP 재설계 분석](docs/MVP_REDESIGN_ANALYSIS.md) | 전문가 분석 보고서 | ✅ 완료 |
| [PRD](docs/PRD_VIET_KCONNECT_2025.md) | 제품 요구사항 명세서 | ✅ 완료 |
| [실행계획](docs/COMPREHENSIVE_EXECUTION_PLAN.md) | 개발 실행계획서 | ✅ 완료 |
| [기술문서](docs/TECHNICAL_DOCS.md) | 기술 설계 문서 | ✅ 완료 |

### 추가 문서
- [API 명세서](docs/API.md)
- [Supabase 설정 가이드](docs/SUPABASE_SETUP_GUIDE.md)
- [UI/UX 디자인 가이드](docs/Ui%20Ux%20Design.md)

---

## 📱 주요 기능

### ✅ 구현 완료
- 베트남 테마 UI/UX 시스템
- 기본 API 구조
- 35개 UI 컴포넌트
- 모바일 반응형 레이아웃

### 🔄 진행 중
- QuestionList 완성 (60% → 100%)
- Supabase 실제 연결
- 구글 로그인 연동

### 📋 MVP 계획
1. **질문 작성**: 제목, 내용, 카테고리 선택
2. **답변 시스템**: 답변 작성, 수정, 채택
3. **카테고리**: 비자, 취업, 생활정보, 주거, 의료 (5개)
4. **검색**: 기본 텍스트 검색
5. **사용자**: 구글 로그인, 기본 프로필

---

## 🗂️ 프로젝트 구조

```
viet-kconnect/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── questions/         # 질문 관련 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── questions/        # 질문 관련 컴포넌트
│   └── answers/          # 답변 관련 컴포넌트
├── docs/                  # 프로젝트 문서
├── lib/                   # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
```

---

## 🎯 개발 로드맵

### Week 1 (10/06-10/12): MVP 개발
- [ ] QuestionList 완성
- [ ] 질문 작성 폼
- [ ] 답변 시스템
- [ ] Supabase 연결
- [ ] 구글 로그인

### Week 2 (10/13-10/19): 테스트 & 배포
- [ ] 기능 테스트
- [ ] 모바일 최적화
- [ ] 베타 사용자 모집
- [ ] MVP 베타 배포

---

## 📈 성공 지표

### MVP 성공 기준 (2주 후)
- ✅ 기본 CRUD 기능 100% 작동
- 🎯 베타 사용자 30명 이상
- ⚡ 로딩 속도 2초 이내
- 📱 모바일 반응형 완벽 구현

### 사용자 확보 기준 (6주 후)
- 👥 주간 활성 사용자 100명
- 📝 질문 작성 주 10개
- 💬 답변률 50% 이상

---

## 🤝 기여하기

### 개발 가이드라인
1. **단순함 유지**: 복잡한 기능 추가 금지
2. **모바일 우선**: 모든 UI는 모바일부터 설계
3. **TypeScript**: 타입 안정성 유지
4. **테스트**: 주요 기능은 테스트 코드 작성

### Git 워크플로우
```bash
# 새 기능 개발
git checkout -b feature/기능명
git commit -m "feat: 기능 설명"
git push origin feature/기능명
# PR 생성 후 리뷰
```

---

## 📞 문의

### 개발팀
- **이메일**: dev@vietkconnect.com
- **GitHub**: [Issues](https://github.com/your-username/viet-kconnect/issues)

### 사용자 피드백
- **베타 테스트**: [신청하기](mailto:beta@vietkconnect.com)

---

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🚀 현재 67% 완성된 상태에서 2주 내 MVP 완성 목표로 개발 진행 중입니다.**

*📅 마지막 업데이트: 2025-10-05*