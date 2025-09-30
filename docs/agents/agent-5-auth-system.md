# Agent 5: 인증 시스템 + QuestionInput UX 구현

**담당 이슈**: #39 (인증 시스템 마이그레이션)
**브랜치**: `feature/issue-39-auth`
**우선순위**: 🔥 **최우선 (다른 모든 에이전트 작업의 기반)**

---

## 🎯 **핵심 목표**

### **1차 목표: QuestionInput 올바른 UX 구현**
```
❌ 잘못된 UX: 처음부터 "로그인이 필요합니다" 표시
✅ 올바른 UX: 일반 입력창 → 타이핑 시작 → 로그인 모달
```

### **2차 목표: 완전한 인증 시스템**
- Firebase → Supabase 인증 마이그레이션
- 카카오/구글 소셜 로그인 연동
- 사용자 세션 관리 및 보안

---

## 🚨 **긴급 UX 요구사항**

### **QuestionInput 컴포넌트 올바른 동작**
```typescript
// 📍 위치: /components/forms/QuestionInput.tsx
// 🎯 목표: 자연스러운 질문 작성 경험

const QuestionInput = () => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()

  // 🔥 핵심 로직: 첫 타이핑 시에만 로그인 확인
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 사용자가 처음 타이핑할 때
    if (!hasUserInteracted && e.target.value.length === 1) {
      setHasUserInteracted(true)
      handleInputStart('content')

      // 로그인하지 않은 경우 모달 표시하고 입력 중단
      if (!user) {
        setShowLoginModal(true)
        return // 입력을 진행하지 않음
      }
    }

    // 로그인된 사용자만 입력 진행
    if (user) {
      setFormData(prev => ({ ...prev, content: e.target.value }))
    }
  }

  return (
    <div className="question-input-container">
      {/* 항상 일반 입력창으로 표시 */}
      <textarea
        placeholder="궁금한 것이 있으시면 자유롭게 질문해보세요..."
        onChange={handleContentChange}
        className="w-full p-4 border rounded-lg"
        rows={4}
      />

      {/* 로그인 모달은 타이핑 시작할 때만 표시 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false)
            // 로그인 후 입력 재개 가능
          }}
        />
      )}
    </div>
  )
}
```

### **핵심 UX 플로우**
1. **처음 화면**: 일반적인 질문 입력창 표시
2. **사용자 타이핑 시작**: 로그인 상태 확인
3. **미로그인 상태**: 로그인 모달 표시, 입력 중단
4. **로그인 완료**: 입력 계속 진행 가능
5. **이미 로그인됨**: 자유롭게 입력 가능

---

## 🔧 **구현 작업 리스트**

### **Phase 1: UX 수정 (최우선)**
- [ ] QuestionInput 컴포넌트 수정
- [ ] 로그인 모달 컴포넌트 생성
- [ ] 첫 타이핑 감지 로직 구현
- [ ] 로그인 후 입력 재개 기능
- [ ] UX 테스트 및 검증

### **Phase 2: 인증 시스템 완성**
- [ ] AuthContext 생성/수정
- [ ] useAuth 훅 구현
- [ ] Supabase 인증 설정
- [ ] 카카오/구글 OAuth 설정
- [ ] 세션 관리 로직

### **Phase 3: 통합 및 테스트**
- [ ] Header 컴포넌트 연동
- [ ] 라우트 보안 설정
- [ ] 에러 핸들링
- [ ] 전체 인증 플로우 테스트

---

## 📁 **작업 파일 리스트**

### **새로 생성할 파일**
```
/components/forms/QuestionInput.tsx ← 🔥 최우선
/components/auth/LoginModal.tsx
/components/auth/SocialLoginButtons.tsx
/hooks/useAuth.ts
/contexts/AuthContext.tsx
/lib/supabase-auth.ts
/lib/oauth-config.ts
```

### **수정할 기존 파일**
```
/components/layout/Header.tsx ← useAuth 연동
/app/layout.tsx ← AuthProvider 래핑
/middleware.ts ← 라우트 보안
```

---

## 🎨 **UI/UX 가이드라인**

### **LoginModal 디자인**
- 중앙 모달, 반투명 배경
- "질문을 작성하려면 로그인이 필요합니다" 메시지
- 카카오/구글 로그인 버튼
- "나중에" 버튼 (모달 닫기)

### **QuestionInput 스타일**
- 기존 디자인 유지
- 로그인 요구 메시지 **절대 표시 안 함**
- 플레이스홀더: "궁금한 것이 있으시면 자유롭게 질문해보세요..."

---

## 🔐 **보안 요구사항**

### **OAuth 설정**
```typescript
// 카카오 OAuth
const KAKAO_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback/kakao`
}

// 구글 OAuth
const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback/google`
}
```

### **세션 관리**
- JWT 토큰 기반 인증
- Refresh Token 자동 갱신
- 보안 쿠키 설정
- CSRF 보호

---

## ✅ **테스트 체크리스트**

### **UX 테스트**
- [ ] 질문 입력창이 처음에 일반적으로 표시됨
- [ ] 첫 글자 입력 시 로그인 모달 표시 (미로그인시)
- [ ] 로그인 후 입력 재개 가능
- [ ] 이미 로그인된 사용자는 바로 입력 가능
- [ ] "나중에" 클릭 시 모달 닫힘

### **기능 테스트**
- [ ] 카카오 로그인 성공
- [ ] 구글 로그인 성공
- [ ] 로그아웃 기능 정상
- [ ] 세션 유지 확인
- [ ] 보안 라우트 접근 제한

---

## 📊 **성공 기준**

### **1차 성공 기준 (필수)**
```typescript
// QuestionInput 테스트 시나리오
describe('QuestionInput UX', () => {
  test('미로그인 사용자 첫 타이핑 → 로그인 모달', () => {
    // 처음엔 일반 입력창
    expect(screen.getByPlaceholderText('궁금한 것이')).toBeVisible()

    // 첫 글자 입력
    fireEvent.change(textarea, { target: { value: 'ㅎ' } })

    // 로그인 모달 표시
    expect(screen.getByText('로그인이 필요합니다')).toBeVisible()
  })
})
```

### **2차 성공 기준**
- 카카오/구글 로그인 100% 성공률
- 세션 유지 24시간
- 보안 검증 통과
- 전체 인증 플로우 에러 0건

---

## 💡 **참고 자료**

### **기존 구현 참고**
- `/src/services/AuthContext.jsx` (Firebase 버전)
- `/src/components/layout/Header.jsx` (기존 useAuth 사용법)

### **Supabase 인증 예시**
```typescript
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'

const supabase = createClient(url, key)

// OAuth 로그인
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`
  }
})
```

---

## 🚨 **Agent 5 특별 지시사항**

1. **UX가 최우선**: 코드 품질보다 사용자 경험이 더 중요
2. **다른 에이전트 대기 중**: 당신의 인증 시스템을 기다리고 있음
3. **빠른 완성 필요**: 완벽함보다는 동작하는 버전 우선
4. **테스트 필수**: UX 시나리오 반드시 확인

## 🚨 **Agent 1 긴급 지시사항 (2025-09-30)**

### **3차 우선순위 대기**
- **상황**: Agent 3 Supabase 설정 완료 후 즉시 시작
- **타임라인**: 2시간 이내 완료
- **핵심**: QuestionInput UX가 사용자 경험의 핵심

### **구체적 실행 사항**
1. **QuestionInput UX 최우선 구현** (자연스러운 로그인 플로우)
2. AuthContext 및 useAuth hook 생성
3. 로그인 모달 컴포넌트 구현
4. Agent 1에게 UX 테스트 결과 보고

### **🎉 Agent 3 완료! 즉시 작업 시작**

**Agent 1로부터의 메시지**: "Supabase 클라이언트 준비 완료! QuestionInput UX 최우선 구현하세요!"

### **🚀 즉시 작업 시작 가능**
- ✅ Supabase Auth 클라이언트 준비됨
- ✅ Database Types 사용 가능
- **현재 시간**: 2025-09-30 오후
- **병렬 작업**: Agent 4와 독립적으로 동시 진행

---

**담당자**: Agent 5
**예상 소요**: 2시간 (Supabase 준비 후)
**의존성**: Agent 3 완료 후
**영향 범위**: 전체 사용자 경험의 핵심

---

## 📋 **Agent 5 독립적 작업 영역**

### **전용 폴더**
- `/components/auth/` - 인증 관련 컴포넌트
- `/components/forms/` - QuestionInput 등 폼 컴포넌트
- `/hooks/auth/` - 인증 관련 훅

### **전용 파일**
- `components/forms/QuestionInput.tsx` (최우선)
- `components/auth/LoginModal.tsx`
- `components/auth/SocialLoginButtons.tsx`
- `hooks/useAuth.ts`
- `lib/supabase-auth.ts`

### **충돌 방지**
- Agent 3: `/lib/supabase.ts` (기본 클라이언트)
- Agent 4: `/lib/database/` (DB 스키마)
- Agent 5: `/components/auth/`, `/hooks/auth/` (인증 전용)

---

## 📋 **Agent 5 작업 완료 보고 양식**

**완료 시 이 파일에 추가할 내용:**
```
## ✅ Agent 5 작업 완료 보고 (날짜/시간)

### 생성한 컴포넌트들
- [ ] components/forms/QuestionInput.tsx (핵심 UX)
- [ ] components/auth/LoginModal.tsx
- [ ] components/auth/SocialLoginButtons.tsx
- [ ] hooks/useAuth.ts

### QuestionInput UX 테스트
- [ ] 미로그인 시 일반 입력창 표시
- [ ] 첫 타이핑 시 로그인 모달 표시
- [ ] 로그인 후 입력 재개 가능
- [ ] "나중에" 버튼으로 모달 닫기

### 인증 시스템 테스트
- [ ] Google OAuth 로그인 성공
- [ ] Kakao OAuth 로그인 성공
- [ ] 세션 유지 24시간 확인
- [ ] 로그아웃 기능 정상

### Supabase Auth 연동
- [ ] Supabase Auth 클라이언트 연동
- [ ] 사용자 세션 관리
- [ ] 보안 쿠키 설정

### 다음 Agent 준비 완료
- [ ] Agent 6 소셜 로그인 확장 가능
- [ ] Agent 8 UI 컴포넌트 인증 연동 가능
```