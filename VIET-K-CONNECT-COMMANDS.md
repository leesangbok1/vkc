# Viet K-Connect UI 프로젝트 - 빠른 참조 가이드

## 📍 현재 상태
- **프로젝트**: `/Users/bk/Desktop/viet-kconnect/`
- **상태**: UI 프로토타입 완성
- **실행**: http://localhost:3000 (개발 서버 가동 중)
- **기술**: Next.js 14 + shadcn/ui + Tailwind CSS

---

## 🛠️ 개발 명령어

### 기본 명령어
```bash
cd /Users/bk/Desktop/viet-kconnect

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 실행
npm start

# 린트 검사
npm run lint
```

### 컴포넌트 추가
```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 예시: 새 컴포넌트들
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add slider
```

---

## 📱 구현된 주요 기능

### /ui 컴포넌트
- ✅ **Header**: 다국어, 알림, 드롭다운
- ✅ **BottomNav**: 모바일 하단 네비게이션
- ✅ **QuestionCard**: 질문 상태별 표시
- ✅ **AnswerCard**: 답변 및 채택 시스템
- ✅ **LoginModal**: 소셜 로그인 UI

### /pages 페이지
- ✅ **홈페이지** (`/`): A/B 테스트 메인 화면
- ✅ **관리자** (`/admin`): 대시보드 및 통계

### /features 기능
- ✅ **A/B 테스트**: 질문형 vs 검색형 UI 토글
- ✅ **모바일 반응형**: 360px 기준 완벽 대응
- ✅ **뱃지 시스템**: Senior, Expert, Verified, Helper
- ✅ **다국어 UI**: 한국어/베트남어/영어 전환

---

## 🎨 디자인 시스템

### 색상 변수 (globals.css)
```css
--vietnam-red: #EA4335      /* Primary */
--vietnam-yellow: #FFCD00   /* Secondary */
--trust-green: #10B981      /* Success */
--expert-gold: #F59E0B      /* Expert */
```

### 뱃지 클래스
```css
.badge-senior    /* 🎖️ 오렌지 */
.badge-expert    /* 🏅 골드 */
.badge-verified  /* ✅ 그린 */
.badge-helper    /* ❤️ 블루 */
```

---

## 📊 Mock 데이터 구조

### /lib/mock-data.ts
```typescript
// 10개 카테고리
mockCategories: visa, employment, housing, education, life, medical, finance, culture, food, networking

// 4명 사용자 (다양한 뱃지/비자)
mockUsers: Nguyen Van An, Tran Thi Huong, Le Van Duc, Pham Minh Tuan

// 5개 질문 (다양한 상태)
mockQuestions: 비자변경, 원룸구하기, TOPIK시험, 건강보험, 베트남음식

// 신뢰 지표
mockTrustMetrics: 답변률 87.3%, 평균응답 6시간23분, 활동전문가 127명
```

---

## 🚀 확장 계획

### Phase 1: 백엔드 연동
```bash
# Supabase 설정 (향후)
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
```

### Phase 2: 기능 추가
```bash
# 추가 라이브러리 (향후)
npm install @tanstack/react-query  # 데이터 페칭
npm install framer-motion           # 애니메이션
npm install next-pwa               # PWA 기능
```

---

## 💻 파일 구조 요약

```
📁 viet-kconnect/
├── 📄 app/page.tsx              # 메인 (A/B 테스트)
├── 📄 app/admin/page.tsx        # 관리자 대시보드
├── 📄 app/layout.tsx            # 루트 레이아웃
├── 📁 components/
│   ├── 📁 shared/               # Header, BottomNav
│   ├── 📁 features/             # Question, Answer, Login
│   └── 📁 ui/                   # shadcn/ui
├── 📁 lib/
│   ├── 📄 types.ts              # TypeScript 정의
│   ├── 📄 mock-data.ts          # Mock 데이터
│   └── 📄 utils.ts              # shadcn 유틸
└── 📄 CLAUDE.md                 # 프로젝트 메모리
```

---

## 🎯 핵심 성과

### ✅ 달성 목표
1. **완전한 UI 시스템** - 모든 주요 화면
2. **A/B 테스트 데모** - 실시간 전환
3. **모바일 최적화** - 완벽한 반응형
4. **컴포넌트 재사용** - shadcn/ui 기반
5. **베트남 테마** - 국기 색상 적용

### 📈 기술 스택 완성도
- ✅ Next.js 14 (App Router)
- ✅ TypeScript 타입 시스템
- ✅ Tailwind CSS 스타일링
- ✅ shadcn/ui 컴포넌트
- ✅ Lucide React 아이콘
- ✅ 한국어 폰트 (Noto Sans KR)

---

## 🔧 유용한 팁

### VS Code 확장
```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
```

### 개발 워크플로
```bash
1. npm run dev          # 개발 서버 시작
2. 컴포넌트 수정        # 실시간 반영 확인
3. npm run lint         # 코드 검사
4. Git 커밋             # 변경사항 저장
```

---

## 📞 프로젝트 정보

- **완성일**: 2025년 9월 18일
- **개발자**: Claude (AI Assistant) + 사용자
- **상태**: UI 프로토타입 완성
- **다음 단계**: 백엔드 통합 검토

---

*auto-compact 정리 완료*