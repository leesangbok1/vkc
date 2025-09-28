# 📁 Viet K-Connect 프로젝트 구조 가이드

## 🗂️ 디렉토리 구조

```
viet-kconnect/
├── app/                        # Next.js App Router (페이지 및 라우트)
│   ├── page.tsx               # 홈페이지
│   ├── admin/                 # 관리자 페이지
│   ├── questions/             # 질문 관련 페이지
│   ├── login/                 # 로그인 페이지
│   ├── mobile/                # 모바일 전용 페이지
│   └── api/                   # API 라우트
│
├── components/                 # React 컴포넌트
│   ├── ui/                    # shadcn/ui 기본 컴포넌트
│   ├── features/              # 기능별 컴포넌트
│   ├── layout/                # 레이아웃 컴포넌트
│   ├── shared/                # 공유 컴포넌트
│   └── mobile/                # 모바일 전용 컴포넌트
│
├── lib/                        # 유틸리티 및 라이브러리
│   ├── database/              # 데이터베이스 관련
│   ├── services/              # 서비스 레이어
│   ├── utils/                 # 유틸리티 함수
│   ├── types.ts               # TypeScript 타입 정의
│   └── mock-data.ts           # Mock 데이터
│
├── hooks/                      # React 커스텀 훅
│   ├── useAuth.tsx            # 인증 관련 훅
│   └── useNotifications.tsx   # 알림 관련 훅
│
├── public/                     # 정적 파일
│   ├── icons/                 # 아이콘
│   ├── images/                # 이미지
│   └── manifest.json          # PWA 매니페스트
│
├── styles/                     # 스타일 파일
│   └── globals.css            # 전역 스타일
│
├── docs/                       # 문서
│   ├── technical/             # 기술 문서
│   │   └── CLAUDE.md          # Claude AI 가이드
│   ├── business/              # 비즈니스 문서
│   │   ├── Viet_K_Connect_Final_PRD_v2.0.md
│   │   └── Viet_K_Connect_System_Architecture_v2.md
│   └── guides/                # 사용자 가이드
│
├── scripts/                    # 유틸리티 스크립트
│   ├── agents/                # AI 에이전트 스크립트
│   └── simple-site-test.js    # 테스트 스크립트
│
├── tests/                      # 테스트 파일
│   ├── unit/                  # 단위 테스트
│   ├── integration/           # 통합 테스트
│   └── e2e/                   # E2E 테스트
│
├── messages/                   # 다국어 메시지
│   ├── ko.json                # 한국어
│   ├── vi.json                # 베트남어
│   └── en.json                # 영어
│
├── supabase/                   # Supabase 설정
│   └── init.sql               # 데이터베이스 초기화
│
└── [루트 설정 파일]
    ├── package.json            # 패키지 정의
    ├── tsconfig.json           # TypeScript 설정
    ├── tailwind.config.js      # Tailwind CSS 설정
    ├── next.config.js          # Next.js 설정
    ├── eslint.config.js        # ESLint 설정
    └── README.md              # 프로젝트 README
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

1. **Next.js App Router**: 모든 페이지는 `app/` 디렉토리 사용
2. **TypeScript 우선**: 모든 새 파일은 TypeScript로 작성
3. **Tailwind CSS**: 스타일링은 Tailwind 유틸리티 클래스 사용
4. **shadcn/ui**: UI 컴포넌트는 shadcn/ui 기반
5. **환경 변수**: 민감한 정보는 `.env.local` 사용

---

*마지막 업데이트: 2025-09-28*
*작성자: Viet K-Connect 개발팀*