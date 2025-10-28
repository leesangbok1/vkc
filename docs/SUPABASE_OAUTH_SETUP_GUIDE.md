# Supabase OAuth 설정 가이드

> **Agent 3 작업 완료 보고서**: Supabase 프로젝트 초기 설정이 완료되었습니다.

## 🎯 완료된 작업

### ✅ Supabase 클라이언트 설정
- **lib/supabase.ts**: 기본 클라이언트 및 타입 정의
- **lib/supabase-server.ts**: Next.js Server Components용 클라이언트
- **lib/supabase-browser.ts**: Client Components용 클라이언트
- **middleware.ts**: 인증 미들웨어 (Route Protection)
- **app/auth/callback/route.ts**: OAuth 콜백 핸들러

### ✅ 환경 변수 구성
- `.env.local`: Next.js 15 호환 환경 변수 설정
- `.env.example`: 템플릿 파일 업데이트

---

## 📋 Supabase 프로젝트 설정 단계

### 1. Supabase 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름: `viet-kconnect`
4. 데이터베이스 비밀번호 설정
5. 리전 선택: `Northeast Asia (ap-northeast-1)`

### 2. 환경 변수 설정
프로젝트 생성 후 Settings > API에서 확인:

```bash
# .env.local에 실제 값으로 교체
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🔐 OAuth 프로바이더 설정

### Google OAuth 설정

#### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services > Credentials** 이동
4. **Create Credentials > OAuth 2.0 Client IDs** 클릭
5. Application type: **Web application**
6. Name: `Viet K-Connect`

#### 2. Authorized URLs 설정
```
Authorized JavaScript origins:
- http://localhost:3000 (개발용)
- https://your-domain.com (프로덕션용)

Authorized redirect URIs:
- http://localhost:3000/auth/callback (개발용)
- https://your-domain.com/auth/callback (프로덕션용)
- https://your-project-id.supabase.co/auth/v1/callback (Supabase)
```

#### 3. Supabase에서 Google OAuth 활성화
1. Supabase Dashboard > Authentication > Providers
2. Google 활성화
3. Client ID와 Client Secret 입력 (Google Cloud Console에서 복사)

### Kakao OAuth 설정

#### 1. Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. **내 애플리케이션** > **애플리케이션 추가하기**
3. 앱 이름: `Viet K-Connect`
4. 사업자명: 본인 이름 입력

#### 2. 플랫폼 설정
1. **앱 설정 > 플랫폼** 이동
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인:
   - `http://localhost:3000` (개발용)
   - `https://your-domain.com` (프로덕션용)

#### 3. Kakao Login 설정
1. **제품 설정 > 카카오 로그인** 이동
2. **카카오 로그인 활성화** ON
3. **Redirect URI 등록**:
   - `http://localhost:3000/auth/callback` (개발용)
   - `https://your-domain.com/auth/callback` (프로덕션용)
   - `https://your-project-id.supabase.co/auth/v1/callback`

#### 4. 동의항목 설정
1. **제품 설정 > 카카오 로그인 > 동의항목** 이동
2. **필수 동의**:
   - 닉네임
   - 프로필 사진
3. **선택 동의**:
   - 카카오계정(이메일)

#### 5. Supabase에서 Kakao OAuth 활성화
1. Supabase Dashboard > Authentication > Providers
2. Kakao 활성화 (Custom을 통해 설정)
3. Client ID: Kakao REST API 키
4. Client Secret: Kakao Client Secret (보안 설정에서 생성)

---

## 🔧 개발자를 위한 사용법

### 클라이언트에서 인증 사용
```typescript
import { authUtils } from '@/lib/supabase-browser'

// Google 로그인
const handleGoogleLogin = async () => {
  try {
    await authUtils.signInWithGoogle()
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Kakao 로그인
const handleKakaoLogin = async () => {
  try {
    await authUtils.signInWithKakao()
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// 로그아웃
const handleLogout = async () => {
  await authUtils.signOut()
}
```

### 서버에서 인증 상태 확인
```typescript
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function ServerComponent() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <div>로그인이 필요합니다</div>
  }

  return <div>안녕하세요, {session.user.email}!</div>
}
```

---

## 🛡️ 보안 설정

### Route Protection
미들웨어에서 자동으로 처리되는 보호된 경로:
- `/questions/new` - 질문 작성
- `/profile` - 프로필 페이지
- `/dashboard` - 대시보드
- `/admin` - 관리자 페이지

### RLS (Row Level Security)
Agent 4가 데이터베이스 스키마 구현 시 RLS 정책이 설정될 예정입니다.

---

## 🚀 Agent 4, 5를 위한 준비사항

### ✅ Agent 4 (DB 스키마) 준비완료
- Supabase 클라이언트 설정 완료
- 타입 정의 기본 구조 준비
- 서버/브라우저 클라이언트 분리

### ✅ Agent 5 (인증 시스템) 준비완료
- OAuth 인증 플로우 구현 완료
- 미들웨어 기반 route protection
- 클라이언트/서버 인증 유틸리티 준비

---

## ⚠️ 다음 단계

1. **Agent 1에게 보고**: Supabase 기반 인프라 준비 완료
2. **Agent 4 작업 가능**: 데이터베이스 스키마 구현 시작 가능
3. **Agent 5 작업 가능**: 인증 UI/UX 구현 시작 가능

---

## 📞 문제 해결

### 일반적인 오류
1. **CORS 오류**: Supabase에서 도메인 설정 확인
2. **OAuth 리디렉션 오류**: 콜백 URL이 정확히 설정되었는지 확인
3. **환경 변수 오류**: `NEXT_PUBLIC_` 접두사 확인

### 연락처
- **Agent 3 담당자**: Supabase 설정 관련 문의
- **Agent 1**: 전체 프로젝트 조율