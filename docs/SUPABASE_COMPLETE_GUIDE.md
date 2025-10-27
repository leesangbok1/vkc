# 🗄️ Supabase 완전 설정 가이드

> **완료 시간**: 15-20분 | **난이도**: 초급 | **상태**: 2025-10-11 업데이트

**목표**: Mock 모드에서 실제 Supabase + OAuth 프로덕션 환경으로 전환

---

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성-3분)
2. [환경 변수 설정](#2-환경-변수-설정-2분)
3. [데이터베이스 스키마 적용](#3-데이터베이스-스키마-적용-5분)
4. [Google OAuth 설정](#4-google-oauth-설정-5분)
5. [연결 테스트](#5-연결-테스트-2분)
6. [문제 해결](#문제-해결)

---

## 1. Supabase 프로젝트 생성 (3분)

### 1.1 계정 생성 및 로그인
```
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (권장)
```

### 1.2 새 프로젝트 생성
```
Project Name: viet-kconnect
Organization: Personal (개인 계정)
Database Password: [강력한 비밀번호 설정 - 반드시 기록!]
Region: Northeast Asia (ap-northeast-1) - 서울
```

**중요**: 데이터베이스 비밀번호는 복구 불가능하므로 안전하게 보관하세요.

### 1.3 프로젝트 생성 대기
- 약 1-2분 소요
- 완료되면 자동으로 Dashboard로 이동

---

## 2. 환경 변수 설정 (2분)

### 2.1 API 키 복사

Supabase Dashboard → **Settings → API**로 이동:

```bash
📍 Project URL
https://[your-project-ref].supabase.co

🔑 anon public (공개 키)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔒 service_role (서버 전용 키)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 .env.local 파일 업데이트

프로젝트 루트의 `.env.local` 파일을 수정:

```bash
# Supabase 설정 (실제 값으로 교체)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Mock 모드 비활성화 (중요!)
NEXT_PUBLIC_MOCK_MODE=false

# Database URL (선택사항, 마이그레이션용)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**주의사항**:
- `NEXT_PUBLIC_` 접두사는 브라우저에서 접근 가능
- `service_role` 키는 절대 클라이언트에 노출 금지
- Mock 모드를 반드시 `false`로 설정

---

## 3. 데이터베이스 스키마 적용 (5분)

### 3.1 SQL Editor 접속

Supabase Dashboard → **SQL Editor** 클릭

### 3.2 마이그레이션 파일 실행

다음 순서로 파일 내용을 복사하여 실행:

#### 1단계: 기본 스키마
```sql
-- supabase/migrations/001_initial_schema.sql 내용 복사
-- "Run" 버튼 클릭
```

#### 2단계: RLS 정책
```sql
-- supabase/migrations/002_rls_policies.sql 내용 복사
-- "Run" 버튼 클릭
```

#### 3단계: 4-tier 권한 시스템
```sql
-- supabase/migrations/003_4tier_permission_system.sql 내용 복사
-- "Run" 버튼 클릭 (존재하는 경우)
```

### 3.3 스키마 적용 확인

SQL Editor에서 실행:

```sql
-- 생성된 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 예상 결과:
-- answers
-- categories
-- comments
-- notifications
-- questions
-- users
-- votes
```

---

## 4. Google OAuth 설정 (5분)

### 4.1 Google Cloud Console 설정

#### 1. 프로젝트 생성
```
1. https://console.cloud.google.com/ 접속
2. "Select a project" → "New Project" 클릭
3. Project name: viet-kconnect
4. "Create" 클릭
```

#### 2. OAuth 동의 화면 설정
```
1. APIs & Services → OAuth consent screen
2. User Type: External 선택
3. App name: Viet K-Connect
4. User support email: 본인 이메일
5. Developer contact: 본인 이메일
6. "Save and Continue"
```

#### 3. OAuth 2.0 Client ID 생성
```
1. Credentials → "Create Credentials" → "OAuth client ID"
2. Application type: Web application
3. Name: Viet K-Connect Web Client
4. Authorized JavaScript origins:
   - http://localhost:3000 (개발)
   - https://your-domain.com (프로덕션)

5. Authorized redirect URIs:
   - http://localhost:3000/auth/callback
   - https://[your-project-ref].supabase.co/auth/v1/callback

6. "Create" 클릭
7. Client ID와 Client Secret 복사 (팝업에 표시됨)
```

### 4.2 Supabase에서 Google 활성화

```
1. Supabase Dashboard → Authentication → Providers
2. "Google" 찾기 → "Enable"
3. Client ID: [Google에서 복사한 Client ID]
4. Client Secret: [Google에서 복사한 Client Secret]
5. "Save" 클릭
```

### 4.3 .env.local에 Google 정보 추가 (선택사항)

```bash
# Google OAuth (클라이언트 측에서 사용하는 경우)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 5. 연결 테스트 (2분)

### 5.1 개발 서버 재시작

```bash
# 터미널에서 실행
npm run dev
```

### 5.2 브라우저 테스트

```
1. http://localhost:3000 접속
2. 브라우저 개발자 도구 → Console 확인
3. "Supabase server client running in mock mode" 메시지가 없어야 함
```

### 5.3 API 엔드포인트 테스트

```bash
# 새 터미널에서 실행
curl http://localhost:3000/api/questions

# 예상 응답 (빈 배열):
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### 5.4 인증 테스트

```
1. 홈페이지에서 "로그인" 클릭
2. Google 로그인 버튼 확인
3. 로그인 시도 (Google 계정 선택 팝업이 나타나야 함)
```

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Project URL, anon key, service key 복사
- [ ] .env.local 파일 업데이트 (3개 값)
- [ ] NEXT_PUBLIC_MOCK_MODE=false 설정
- [ ] 3개 마이그레이션 파일 실행
- [ ] 테이블 생성 확인 (7개 테이블)
- [ ] Google Cloud Console OAuth 설정
- [ ] Supabase Google Provider 활성화
- [ ] 개발 서버 재시작
- [ ] API 엔드포인트 응답 확인
- [ ] Google 로그인 팝업 확인

---

## 🚨 문제 해결

### "Invalid API key" 에러
```
원인: 환경 변수가 잘못 설정됨
해결:
1. .env.local 파일의 키 값 재확인
2. 공백이나 특수문자 확인
3. Supabase Dashboard에서 키 재복사
4. 개발 서버 재시작
```

### "relation does not exist" 에러
```
원인: 데이터베이스 스키마가 적용되지 않음
해결:
1. SQL Editor에서 테이블 존재 확인
2. 마이그레이션 파일 다시 실행
3. 에러 메시지 확인 후 수정
```

### Google 로그인 "redirect_uri_mismatch" 에러
```
원인: Redirect URI가 일치하지 않음
해결:
1. Google Cloud Console에서 Redirect URI 확인
2. 정확한 Supabase 콜백 URL 추가:
   https://[your-project-ref].supabase.co/auth/v1/callback
3. 로컬 개발용 추가:
   http://localhost:3000/auth/callback
```

### Mock 모드가 여전히 활성화됨
```
원인: 환경 변수 변경이 반영되지 않음
해결:
1. .env.local 파일 저장 확인
2. 개발 서버 완전 종료 (Ctrl+C)
3. npm run dev 재실행
4. 브라우저 캐시 삭제
```

### CORS 에러
```
원인: 도메인이 허용 목록에 없음
해결:
1. Supabase Dashboard → Settings → API
2. "URL Configuration" 섹션 확인
3. localhost:3000이 포함되어 있는지 확인
```

---

## 📚 참고 자료

### Supabase 공식 문서
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

### Google OAuth 문서
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

### 프로젝트 파일
- `/lib/supabase.ts` - Supabase 클라이언트 설정
- `/lib/supabase-server.ts` - 서버 컴포넌트용 클라이언트
- `/lib/supabase-browser.ts` - 브라우저용 클라이언트
- `/middleware.ts` - 인증 미들웨어
- `/app/auth/callback/route.ts` - OAuth 콜백 핸들러

---

## 🎯 다음 단계

설정 완료 후:

1. **질문 작성 테스트**: 로그인 후 질문 작성 기능 테스트
2. **답변 시스템 테스트**: 질문에 답변 작성 및 채택 테스트
3. **권한 시스템 확인**: Guest/User/Expert/Admin 역할별 기능 테스트
4. **테스트 데이터 생성**: `scripts/seed-data.ts` 실행
5. **Vercel 배포**: 프로덕션 환경 배포 및 테스트

---

**마지막 업데이트**: 2025-10-11
**작성자**: Viet K-Connect 개발팀
**난이도**: ⭐⭐☆☆☆ (초급-중급)
