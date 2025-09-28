# Agent 2: Next.js 프로젝트 초기화 담당

## 🎯 브랜치
`feature/nextjs-restore`

## 📋 작업 내용
1. Next.js 14 프로젝트 생성
2. TypeScript 설정
3. Tailwind CSS 설정
4. app/ 디렉토리 구조 생성
5. 기본 컴포넌트 설정

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/nextjs-restore
```

### 2. Next.js 프로젝트 초기화
```bash
# 기존 Vite 관련 파일 백업
mv vite.config.js vite.config.js.backup
mv index.html index.html.backup

# Next.js 14 설치
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
```

### 3. 필수 패키지 설치
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @types/node @types/react @types/react-dom
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react @radix-ui/react-slot
```

## 📁 생성할 파일 구조
```
app/
├── layout.tsx                # 루트 레이아웃
├── page.tsx                  # 홈페이지
├── globals.css               # 전역 스타일
├── (auth)/                   # 인증 그룹
│   ├── login/page.tsx
│   └── register/page.tsx
├── (main)/                   # 메인 그룹
│   ├── questions/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── profile/page.tsx
└── api/                      # API 라우트
    └── questions/
        ├── route.ts
        └── [id]/route.ts

components/
├── ui/                       # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── layout/                   # 레이아웃 컴포넌트
│   ├── header.tsx
│   └── sidebar.tsx
└── features/                 # 기능별 컴포넌트
    └── questions/

lib/
├── utils.ts                  # 유틸리티 함수
├── supabase.ts              # Supabase 클라이언트
└── database.types.ts        # DB 타입 정의

hooks/
└── useAuth.ts               # 인증 훅

middleware.ts                 # Next.js 미들웨어
```

## 📝 생성할 핵심 파일

### app/layout.tsx
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Viet K-Connect',
  description: '베트남 한인 커뮤니티 Q&A 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### app/page.tsx
```typescript
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Viet K-Connect
      </h1>
      <p className="text-center text-gray-600">
        베트남 한인 커뮤니티 Q&A 플랫폼
      </p>
    </main>
  )
}
```

### lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### middleware.ts
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## ⚙️ 설정 파일 수정

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## ✅ 완료 기준
1. ✅ Next.js 14 프로젝트 생성
2. ✅ TypeScript 설정 완료
3. ✅ Tailwind CSS 설정 완료
4. ✅ app/ 디렉토리 구조 생성
5. ✅ 기본 컴포넌트 생성
6. ✅ 빌드 테스트 통과 (`npm run build`)

## 📅 예상 소요 시간
**총 2시간**