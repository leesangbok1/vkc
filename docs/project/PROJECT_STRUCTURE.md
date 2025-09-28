# 📁 Viet K-Connect 프로젝트 구조 가이드

## 🗂️ 디렉토리 구조

```
viet-kconnect/
├── src/                        # 소스 코드 (React + Vite)
│   ├── components/            # React 컴포넌트
│   │   ├── common/           # 공통 컴포넌트 (ErrorBoundary, LoadingSpinner)
│   │   ├── auth/             # 인증 관련 컴포넌트
│   │   ├── chat/             # 채팅 시스템 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트 (Header)
│   │   ├── questions/        # 질문 관련 컴포넌트
│   │   ├── filters/          # 필터 컴포넌트
│   │   ├── home/             # 홈페이지 컴포넌트
│   │   ├── widgets/          # 위젯 컴포넌트
│   │   ├── ai/               # AI 관련 컴포넌트
│   │   └── realtime/         # 실시간 기능 컴포넌트
│   │
│   ├── pages/                 # React Router 페이지
│   │   ├── HomePage.jsx      # 홈페이지
│   │   ├── AllPostsPage.jsx  # 전체 게시글 페이지
│   │   └── PostDetailPage.jsx # 게시글 상세 페이지
│   │
│   ├── services/              # 서비스 레이어
│   │   ├── firebase-api.js   # Firebase API 통합
│   │   ├── realtime-firebase.js # 실시간 Firebase
│   │   ├── AIService.js      # AI 서비스
│   │   ├── AuthContext.jsx   # 인증 컨텍스트
│   │   ├── RealtimeContext.jsx # 실시간 컨텍스트
│   │   ├── NotificationContext.jsx # 알림 컨텍스트
│   │   ├── ChatSystem.js     # 채팅 시스템 로직
│   │   ├── notification-service.js # 알림 서비스
│   │   └── smart-search.js   # 스마트 검색
│   │
│   ├── config/                # 설정 파일
│   │   └── firebase.js       # Firebase 설정
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   ├── logger.js         # 로깅 유틸리티
│   │   ├── performance.js    # 성능 관련
│   │   ├── tokenManager.js   # 토큰 관리
│   │   └── [기타 유틸리티들]
│   │
│   ├── hooks/                 # React 커스텀 훅
│   │   └── useTokenManager.js # 토큰 관리 훅
│   │
│   ├── workers/               # Web Workers
│   │   └── tokenMonitor.worker.js # 토큰 모니터링
│   │
│   ├── tests/                 # 테스트 파일
│   │   ├── setup.js          # 테스트 설정
│   │   └── utils.test.js     # 유틸리티 테스트
│   │
│   ├── examples/              # 사용 예제
│   │   └── [예제 파일들]
│   │
│   ├── i18n/                  # 다국어 지원
│   │   └── i18n.js           # 국제화 설정
│   │
│   ├── App.jsx               # 메인 앱 컴포넌트
│   ├── main.jsx              # 앱 진입점
│   └── index.css             # 전역 스타일
│
├── public/                     # 정적 파일
│   ├── icons/                 # 아이콘
│   └── images/                # 이미지
│
├── docs/                       # 문서
│   ├── project/               # 프로젝트 문서
│   │   ├── PROJECT_STRUCTURE.md # 프로젝트 구조
│   │   └── ISSUE_TRACKER.md   # 이슈 관리
│   ├── development/           # 개발 문서
│   ├── templates/             # 템플릿
│   └── archive/               # 아카이브 (임시 문서들)
│
├── scripts/                    # 유틸리티 스크립트
│   ├── claude/                # Claude 자동화 관련
│   └── [기타 스크립트들]
│
├── tests/                      # E2E 테스트 (Playwright)
│   └── [테스트 파일들]
│
├── .docker/                    # Docker 설정 (선택사항)
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx.conf
│
├── .github/                    # GitHub 워크플로우
│   └── workflows/
│
├── agents/                     # AI 에이전트 관련
│   └── [에이전트 파일들]
│
└── [루트 설정 파일]
    ├── package.json            # 패키지 정의
    ├── vite.config.js          # Vite 설정
    ├── vitest.config.js        # Vitest 설정
    ├── eslint.config.js        # ESLint 설정
    ├── .prettierrc             # Prettier 설정
    ├── .env.example            # 환경 변수 예제
    ├── vercel.json             # Vercel 배포 설정
    └── README.md              # 프로젝트 README
```

## 📝 파일 명명 규칙

### 컴포넌트
- **React 컴포넌트**: PascalCase (예: `QuestionCard.jsx`)
- **컴포넌트 디렉토리**: kebab-case 또는 PascalCase (현재 혼용)

### 페이지
- **페이지 파일**: PascalCase (예: `HomePage.jsx`, `PostDetailPage.jsx`)
- **디렉토리**: kebab-case (예: `all-posts/`)

### 서비스 및 유틸리티
- **서비스 파일**: camelCase 또는 PascalCase (예: `firebase-api.js`, `AIService.js`)
- **유틸리티 함수**: camelCase (예: `tokenManager.js`)
- **커스텀 훅**: use로 시작하는 camelCase (예: `useTokenManager.js`)

### 설정 파일
- **설정 파일**: kebab-case 또는 dot notation (예: `vite.config.js`, `.env.example`)

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