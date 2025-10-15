# 📁 Viet K-Connect 프로젝트 구조 가이드

## 🗂️ 디렉토리 구조

```
viet-kconnect/
├── app/                        # Next.js App Router (페이지 및 라우트)
│   ├── page.tsx               # 홈페이지
│   ├── admin/                 # 관리자 페이지
│   ├── questions/             # 질문 관련 페이지
│   ├── auth/                  # 인증 페이지
│   └── api/                   # API 라우트
│       ├── questions/         # 질문 API
│       ├── answers/           # 답변 API
│       ├── auth/              # 인증 API
│       └── ...
│
├── components/                 # React 컴포넌트
│   ├── ui/                    # shadcn/ui 기본 컴포넌트
│   ├── questions/             # 질문 관련 컴포넌트
│   ├── answers/               # 답변 컴포넌트
│   ├── layout/                # 레이아웃 컴포넌트
│   ├── auth/                  # 인증 컴포넌트
│   ├── trust/                 # 신뢰도 시스템
│   └── providers/             # Context Providers
│
├── lib/                        # 유틸리티 및 라이브러리
│   ├── services/              # 서비스 레이어
│   │   ├── question.service.ts
│   │   ├── answer.service.ts
│   │   ├── auth.service.ts
│   │   └── cache.service.ts
│   ├── utils/                 # 유틸리티 함수
│   │   ├── expert-matching.ts
│   │   ├── error-logger.ts
│   │   └── server-logger.ts
│   ├── types.ts               # TypeScript 타입 정의
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── supabase-server.ts     # 서버용 클라이언트
│   ├── supabase-browser.ts    # 브라우저용 클라이언트
│   └── auth.ts                # 인증 헬퍼
│
├── hooks/                      # React 커스텀 훅
│   ├── useAuth.tsx            # 인증 관련 훅
│   └── useNotifications.tsx   # 알림 관련 훅
│
├── contexts/                   # React Context
│   └── AuthContext.tsx        # 인증 Context
│
├── public/                     # 정적 파일
│   ├── icons/                 # 아이콘
│   ├── manifest.json          # PWA 매니페스트
│   ├── sw.js                  # Service Worker
│   └── offline.html           # 오프라인 페이지
│
├── styles/                     # 스타일 파일
│   └── globals.css            # 전역 스타일
│
├── docs/                       # 문서
│   ├── README.md              # 문서 가이드
│   ├── SUPABASE_COMPLETE_GUIDE.md  # Supabase 설정
│   ├── MASTER_PROJECT_PLAN_2025.md # 메인 로드맵
│   ├── API.md                 # API 명세서
│   ├── project/               # 프로젝트 관리
│   │   ├── PROJECT_STRUCTURE.md
│   │   └── ISSUE_TRACKER.md
│   ├── development/           # 개발 가이드
│   └── archive/               # 과거 문서
│
├── scripts/                    # 유틸리티 스크립트
│   ├── db/                    # DB 관련 스크립트
│   ├── testing/               # 테스트 스크립트
│   └── seed-data.ts           # 시드 데이터
│
├── tests/                      # 테스트 파일
│   ├── unit/                  # 단위 테스트
│   ├── integration/           # 통합 테스트
│   ├── e2e/                   # E2E 테스트 (Playwright)
│   └── setup.ts               # 테스트 설정
│
├── supabase/                   # Supabase 설정
│   └── migrations/            # DB 마이그레이션
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 002_seed_data.sql
│
└── [루트 설정 파일]
    ├── package.json            # 패키지 정의 (npm 사용)
    ├── tsconfig.json           # TypeScript 설정
    ├── tailwind.config.js      # Tailwind CSS 설정
    ├── next.config.js          # Next.js 설정
    ├── vitest.config.ts        # Vitest 설정
    ├── playwright.config.ts    # Playwright 설정
    ├── middleware.ts           # Next.js 미들웨어
    ├── vercel.json             # Vercel 배포 설정
    └── README.md               # 프로젝트 README
```

### ⚠️ 삭제된 폴더 (2025-10-11 정리)
```
❌ configs/              # 중복 설정 폴더 제거
❌ messages/             # 다국어 지원 제거 (한국어만)
❌ Dockerfile            # Docker 배포 미사용
❌ docker-compose.yml    # Vercel 배포 사용
❌ nginx.conf            # Nginx 미사용
```

## 📝 파일 명명 규칙

### 컴포넌트
- **React 컴포넌트**: PascalCase (예: `QuestionCard.tsx`)
- **컴포넌트 디렉토리**: kebab-case (예: `question-card/`)

### 페이지 및 라우트
- **페이지 파일**: `page.tsx` (Next.js App Router 규칙)
- **API 라우트**: `route.ts` (Next.js API 규칙)
- **디렉토리**: kebab-case (예: `admin-dashboard/`)

### 유틸리티 및 훅
- **유틸리티 함수**: camelCase (예: `formatDate.ts`)
- **커스텀 훅**: use로 시작하는 camelCase (예: `useAuth.tsx`)

### 설정 파일
- **설정 파일**: kebab-case 또는 dot notation (예: `eslint.config.js`, `.env.local`)

### 문서
- **기술 문서**: UPPER_SNAKE_CASE 또는 kebab-case
- **마크다운 파일**: `.md` 확장자

## 🚀 파일 생성 가이드라인

### 새 컴포넌트 추가 시
```bash
# UI 기본 컴포넌트
components/ui/NewComponent.tsx

# 기능 컴포넌트
components/features/NewFeature.tsx

# 페이지 전용 컴포넌트
app/page-name/components/PageComponent.tsx
```

### 새 페이지 추가 시
```bash
# 일반 페이지
app/new-page/page.tsx

# 동적 라우트
app/items/[id]/page.tsx

# API 라우트
app/api/new-endpoint/route.ts
```

### 테스트 파일 추가 시
```bash
# 컴포넌트 테스트
tests/unit/components/ComponentName.test.tsx

# API 테스트
tests/integration/api/endpoint.test.ts

# E2E 테스트
tests/e2e/user-flow.spec.ts
```

## 📦 모듈 임포트 순서

```typescript
// 1. React/Next.js
import React from 'react'
import { useRouter } from 'next/navigation'

// 2. 외부 라이브러리
import { format } from 'date-fns'
import { supabase } from '@supabase/client'

// 3. 내부 컴포넌트
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'

// 4. 유틸리티/타입
import { formatDate } from '@/lib/utils'
import type { User } from '@/lib/types'

// 5. 스타일
import styles from './Component.module.css'
```

## 🔧 개발 워크플로우

### 1. 기능 개발 시
1. 요구사항 분석 → `docs/` 에 문서화
2. 컴포넌트 개발 → `components/` 에 구현
3. 페이지 통합 → `app/` 에 라우트 추가
4. 테스트 작성 → `tests/` 에 테스트 추가

### 2. 버그 수정 시
1. 이슈 재현 → 테스트 케이스 작성
2. 버그 수정 → 코드 수정
3. 테스트 통과 확인
4. 문서 업데이트 (필요시)

### 3. 리팩토링 시
1. 테스트 커버리지 확인
2. 점진적 리팩토링
3. 테스트 통과 확인
4. 성능 측정

## 🚫 피해야 할 사항

### ❌ 하지 말아야 할 것
- 루트 디렉토리에 소스 파일 직접 생성
- 컴포넌트에 비즈니스 로직 포함
- 하드코딩된 값 사용 (환경 변수 활용)
- 테스트 없는 코드 커밋
- 문서화 없는 복잡한 로직

### ✅ 권장 사항
- 컴포넌트는 단일 책임 원칙 준수
- 재사용 가능한 컴포넌트 우선
- TypeScript 타입 명시
- 의미있는 변수/함수명 사용
- 주석은 "왜"를 설명 (무엇을 하는지는 코드로)

## 📊 디렉토리별 책임

| 디렉토리 | 책임 | 예시 |
|---------|------|-----|
| `app/` | 라우팅 및 페이지 | 페이지 컴포넌트, API 라우트 |
| `components/` | UI 컴포넌트 | 버튼, 카드, 모달 |
| `lib/` | 비즈니스 로직 | 데이터 처리, API 클라이언트 |
| `hooks/` | 상태 관리 | 인증, 데이터 페칭 |
| `public/` | 정적 자원 | 이미지, 폰트, 아이콘 |
| `tests/` | 테스트 코드 | 단위, 통합, E2E 테스트 |
| `docs/` | 문서화 | 기술, 비즈니스 문서 |

## 🔄 정기 유지보수

### 주간 점검
- [ ] 불필요한 dependencies 제거
- [ ] 빌드 경고 해결
- [ ] 테스트 커버리지 확인
- [ ] 문서 최신화

### 월간 점검
- [ ] 보안 업데이트 확인
- [ ] 성능 메트릭 분석
- [ ] 코드 품질 리뷰
- [ ] 기술 부채 평가

## 📌 중요 참고사항

### 기술 스택 (2025-10-11 확정)
1. **Next.js 15 App Router**: 모든 페이지는 `app/` 디렉토리 사용
2. **TypeScript 5.9**: 모든 새 파일은 TypeScript로 작성
3. **Tailwind CSS**: 스타일링은 Tailwind 유틸리티 클래스 사용
4. **shadcn/ui**: UI 컴포넌트는 shadcn/ui 기반
5. **Supabase**: 백엔드 및 인증 (Firebase 제거됨)
6. **Vercel**: 배포 플랫폼 (Docker 제거됨)
7. **npm**: 패키지 관리자 (pnpm 제거됨)
8. **한국어**: 단일 언어 (i18n 제거됨)

### 환경 변수
- `.env.local`: 개발 환경 (Git 제외)
- `.env.example`: 템플릿 파일
- `NEXT_PUBLIC_*`: 브라우저 접근 가능
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용

### 패키지 관리
- `npm install`: 패키지 설치
- `npm run dev`: 개발 서버
- `npm run build`: 프로덕션 빌드
- `npm test`: 테스트 실행

---

*마지막 업데이트: 2025-10-11*
*작성자: Viet K-Connect 개발팀*
*변경사항: 프로젝트 정리 반영, 기술 스택 명확화*