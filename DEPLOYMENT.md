# Viet K-Connect 배포 가이드

## 🚀 Vercel 배포 단계별 가이드

### 1단계: Supabase 프로젝트 설정

1. **Supabase 프로젝트 생성**
   - [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
   - 프로젝트 이름: `viet-k-connect`
   - 리전: `Seoul (ap-northeast-1)` 권장

2. **데이터베이스 스키마 설정**
   ```sql
   -- 스키마 파일 실행
   \i supabase/migrations/001_initial_schema.sql
   \i supabase/migrations/002_rls_policies.sql
   \i supabase/migrations/003_4tier_permission_system.sql
   ```

3. **시드 데이터 삽입**
   ```bash
   npm run db:seed
   ```

4. **OAuth 설정**
   - Authentication > Providers > Google 활성화
   - Google OAuth 클라이언트 ID/Secret 설정

### 2단계: Vercel 프로젝트 설정

1. **Vercel 계정 연결**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **프로젝트 초기화**
   ```bash
   vercel
   # 설정: Next.js 프레임워크 선택
   # 빌드 명령: npm run build
   # 출력 디렉토리: .next
   ```

### 3단계: 환경변수 설정

Vercel Dashboard > Settings > Environment Variables에서 다음 변수들을 설정:

#### 필수 환경변수

| 변수명 | 설명 | 예시값 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXTAUTH_SECRET` | NextAuth 시크릿 키 | `openssl rand -base64 32`로 생성 |
| `NEXTAUTH_URL` | 배포된 앱 URL | `https://viet-k-connect.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | `xxx.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 | `GOCSPX-xxx` |

#### 선택 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_MOCK_MODE` | Mock 모드 활성화 | `false` |
| `LOG_LEVEL` | 로그 레벨 | `info` |

### 4단계: Google OAuth 설정

1. **Google Cloud Console 설정**
   - [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
   - APIs & Services > OAuth consent screen 설정
   - APIs & Services > Credentials > OAuth 2.0 Client ID 생성

2. **승인된 리디렉션 URI 추가**
   ```
   Production: https://viet-k-connect.vercel.app/auth/callback/google
   Development: http://localhost:3000/auth/callback/google
   ```

### 5단계: 배포 실행

1. **수동 배포**
   ```bash
   vercel --prod
   ```

2. **자동 배포 (GitHub 연결)**
   - Vercel Dashboard에서 GitHub 저장소 연결
   - main 브랜치 푸시 시 자동 배포

### 6단계: 배포 후 확인사항

1. **기능 테스트**
   - [ ] 홈페이지 로딩
   - [ ] Google 로그인
   - [ ] 질문 작성/조회
   - [ ] 답변 작성/채택
   - [ ] 검색 기능
   - [ ] 프로필 페이지
   - [ ] 카테고리 필터링

2. **성능 확인**
   - [ ] 페이지 로딩 속도 (< 3초)
   - [ ] Lighthouse 점수 (90+ 권장)
   - [ ] 모바일 반응형 확인

3. **데이터베이스 확인**
   - [ ] 실제 데이터 연결
   - [ ] 시드 데이터 확인
   - [ ] RLS 정책 적용

## 🔧 문제 해결

### 일반적인 오류

1. **환경변수 오류**
   ```
   Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL
   ```
   - 해결: Vercel Dashboard에서 환경변수 재확인

2. **OAuth 로그인 실패**
   ```
   Error: redirect_uri_mismatch
   ```
   - 해결: Google OAuth 설정에서 리디렉션 URI 확인

3. **데이터베이스 연결 실패**
   ```
   Error: Database connection failed
   ```
   - 해결: Supabase 프로젝트 URL/키 확인

### 디버깅 도구

1. **Vercel 로그 확인**
   ```bash
   vercel logs [deployment-url]
   ```

2. **로컬 환경에서 테스트**
   ```bash
   npm run build
   npm run start
   ```

3. **Supabase 대시보드에서 로그 확인**
   - Logs > API, Auth, Database

## 📋 체크리스트

### 배포 전 확인
- [ ] `.env.example` 파일 업데이트
- [ ] `vercel.json` 설정 확인
- [ ] 테스트 코드 통과
- [ ] TypeScript 오류 없음
- [ ] 빌드 오류 없음

### 배포 후 확인
- [ ] 프로덕션 환경 테스트
- [ ] SEO 메타태그 확인
- [ ] 보안 설정 확인
- [ ] 성능 최적화 확인

## 🚦 배포 환경 구성

### Production
- **URL**: `https://viet-k-connect.vercel.app`
- **브랜치**: `main`
- **데이터베이스**: Production Supabase

### Staging (선택)
- **URL**: `https://viet-k-connect-staging.vercel.app`
- **브랜치**: `staging`
- **데이터베이스**: Staging Supabase

### Development
- **URL**: `http://localhost:3000`
- **브랜치**: `develop`
- **데이터베이스**: Local 또는 Development Supabase

## 📞 지원

배포 관련 문제가 발생하면:
1. 이 가이드의 문제 해결 섹션 확인
2. Vercel 문서 참조: https://vercel.com/docs
3. Supabase 문서 참조: https://supabase.com/docs