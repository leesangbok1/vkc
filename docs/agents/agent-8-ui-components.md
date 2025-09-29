# Agent 8: UI/UX 통합 전문가 (Header 긴급 수정 + 컴포넌트 마이그레이션)

**담당 이슈**: #45 (컴포넌트 라이브러리 마이그레이션)
**브랜치**: `feature/issue-45-components`
**상태**: 🔴 **Phase 1 긴급 시작**
**우선순위**: 🔥 **최우선** (Runtime Error 해결)

---

## 🚨 **긴급 상황 - Header 컴포넌트 수정**

### **Runtime TypeError 해결 필수**
```
❌ 현재 오류: Cannot read properties of undefined (reading 'call')
📍 위치: app/layout.tsx (22:11) @ RootLayout
🎯 원인: useAuth hook 연동 문제
```

### **즉시 수행할 작업**
1. **Header.jsx import 경로 수정**:
   - `/src/components/layout/Header.jsx` 파일 수정
   - `useAuth` hook import 경로 문제 해결
   - Next.js 15 절대 경로 별칭 활용

2. **AuthContext 연동 확인**:
   - `/src/services/AuthContext.jsx`와 정상 연결
   - Firebase 기반 인증 시스템 연동
   - useAuth, useNotifications 정상 동작 확인

3. **Next.js App Router 연동**:
   - Agent 2가 생성한 `/app/layout.tsx`에서 Header 사용
   - AuthProvider로 전체 앱 래핑 확인

---

## 🎯 **핵심 목표**

### **1차: 긴급 Header 수정**
```typescript
// 현재 문제 코드 (Header.jsx:2)
import { useAuth } from '@services/AuthContext'  // ❌ 경로 문제

// 수정 후
import { useAuth } from '@/src/services/AuthContext'  // ✅ 절대 경로
// 또는
import { useAuth } from '../../services/AuthContext'  // ✅ 상대 경로
```

### **2차: 전체 컴포넌트 시스템**
- Vite → Next.js 컴포넌트 마이그레이션
- shadcn/ui 통합
- 반응형 디자인 적용
- 접근성 (a11y) 개선

---

## 🔧 **긴급 수정 단계**

### **Step 1: Header.jsx 수정**
```typescript
// /src/components/layout/Header.jsx
import React, { useState } from 'react'
import { useAuth } from '@/src/services/AuthContext'  // 🔥 경로 수정
import { useNotifications } from '@/src/services/NotificationContext'

const Header = ({ onLoginClick }) => {
  const { user, logout, isAdmin } = useAuth()  // ✅ 정상 작동해야 함

  // ... 나머지 코드 동일
}
```

### **Step 2: AuthContext 확인**
- `/src/services/AuthContext.jsx` 파일 존재 확인
- `export const useAuth` 함수 확인
- Firebase 설정 확인

### **Step 3: layout.tsx 복원**
```typescript
// 현재 임시 헤더 제거하고 원래 Header 복원
import { Header } from '@/src/components/layout/Header'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />  {/* 🔥 정상 Header 복원 */}
        {children}
      </body>
    </html>
  )
}
```

---

## 🔧 **전체 작업 리스트**

### **Phase 1: 긴급 수정 (최우선)**
- [ ] Header.jsx import 경로 수정
- [ ] useAuth hook 연동 테스트
- [ ] layout.tsx에서 Header 복원
- [ ] 개발 서버 에러 없이 실행 확인

### **Phase 2: 컴포넌트 마이그레이션**
- [ ] 기존 컴포넌트 목록 정리
- [ ] Next.js 13+ 컴포넌트로 변환
- [ ] shadcn/ui 컴포넌트 통합
- [ ] 스타일링 시스템 정리 (CSS → Tailwind)

### **Phase 3: UI/UX 개선**
- [ ] 반응형 디자인 적용
- [ ] 다크모드 지원
- [ ] 접근성 (ARIA) 개선
- [ ] 애니메이션 및 인터랙션

---

## 📁 **작업 파일 위치**

### **긴급 수정 파일**
```
/src/components/layout/Header.jsx ← 🔥 우선 수정
/src/services/AuthContext.jsx ← 연동 확인
/app/layout.tsx ← Header 복원
```

### **마이그레이션 대상**
```
/components/forms/ ← 입력 폼들
/components/ui/ ← 기본 UI 컴포넌트
/components/layout/ ← 레이아웃 컴포넌트
```

---

## ✅ **긴급 수정 테스트**

### **즉시 확인사항**
```bash
# 1. 개발 서버 재시작 (에러 없이)
npm run dev

# 2. 브라우저 접속 (http://localhost:3004)
# - Header 정상 표시 확인
# - 로그인 버튼 정상 동작
# - Console 에러 없음

# 3. 네트워크 탭에서 useAuth 호출 확인
```

### **성공 기준**
- [ ] 개발 서버 Runtime Error 완전 해결
- [ ] Header 컴포넌트 정상 렌더링
- [ ] useAuth hook 정상 작동
- [ ] 로그인/로그아웃 버튼 표시 정상
- [ ] Console 에러 0개

---

## 🚨 **Agent 8 특별 지시사항**

### **최우선 작업**
1. **다른 모든 작업 중단**
2. **Header 컴포넌트 수정에만 집중**
3. **Agent 1에게 즉시 완료 보고**
4. **다른 에이전트 작업 차단 해제**

### **Agent 1로부터의 긴급 메시지**
> "Header 컴포넌트 오류로 인해 전체 프로젝트가 영향받고 있습니다.
> 다른 에이전트들이 정상 작업할 수 있도록 이 문제를 **최우선**으로 해결해주세요.
> AuthContext가 이미 구현되어 있으니, 올바르게 연동하여 Header를 복원해주세요."

---

## 💡 **문제 해결 힌트**

### **예상 원인과 해결책**
```typescript
// 문제 1: import 경로
❌ import { useAuth } from '@services/AuthContext'
✅ import { useAuth } from '@/src/services/AuthContext'

// 문제 2: AuthProvider 누락
❌ <Header /> // AuthContext 없이 사용
✅ <AuthProvider><Header /></AuthProvider>

// 문제 3: 조건부 렌더링
❌ user && <span>{user.name}</span>  // user가 undefined일 때 에러
✅ user?.name && <span>{user.name}</span>  // 안전한 접근
```

---

## 📊 **완료 후 보고 형식**

### **Agent 1에게 보고할 내용**
```
🎉 Header 컴포넌트 수정 완료!

✅ 해결된 문제:
- Runtime TypeError 완전 해결
- useAuth hook 정상 연동
- 개발 서버 에러 없이 실행

✅ 확인된 기능:
- Header 컴포넌트 정상 렌더링
- 로그인/로그아웃 버튼 작동
- 사용자 메뉴 드롭다운 정상

🚀 다른 에이전트 작업 재개 가능!
```

---

**담당자**: Agent 8 (UI/UX 통합 전문가)
**긴급도**: 🔥 최우선
**완료 목표**: 즉시 (다른 모든 작업보다 우선)

## ⏰ **Phase 1 동시 작업 진행 중**

**함께 작업하는 Agent들**:
- **Agent 2**: Next.js 기본 구조 수정 (병렬)
- **Agent 3**: Supabase 환경 설정 (병렬)
- **Agent 8**: Header 컴포넌트 수정 (현재)

**파일 충돌 방지**:
- Agent 2: `/app/*.tsx` 영역
- Agent 3: `/lib/supabase*.ts`, `.env*` 영역
- Agent 8: `/src/components/layout/Header.jsx` 영역

**완료 후 Phase 2 시작**: Agent 4, 5 대기 중