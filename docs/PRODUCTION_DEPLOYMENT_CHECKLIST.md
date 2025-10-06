# 🚀 프로덕션 배포 최종 체크리스트

**Week 3 목표**: 베타 테스트를 위한 실제 프로덕션 배포 완료

---

## ✅ 배포 전 필수 체크리스트

### 1. 코드 품질 검증
- [ ] **TypeScript 컴파일 오류 없음**
  ```bash
  npm run type-check
  ```
- [ ] **ESLint 오류 없음**
  ```bash
  npm run lint
  ```
- [ ] **빌드 성공**
  ```bash
  npm run build
  ```
- [ ] **로컬 테스트 통과**
  ```bash
  npm run start
  # localhost:3000에서 주요 기능 테스트
  ```

### 2. 접근성 & 성능 검증
- [ ] **WCAG 2.1 AA 준수 검증**
  ```bash
  npm run audit:accessibility
  ```
- [ ] **성능 목표 달성 확인**
  ```bash
  npm run audit:performance
  ```
- [ ] **종합 검증 완료**
  ```bash
  npm run audit:full
  ```

### 3. 보안 검증
- [ ] **환경변수 보안 확인**
  - NEXTAUTH_SECRET: 충분히 복잡한 랜덤 값
  - SUPABASE_SERVICE_ROLE_KEY: Vercel에만 설정, 노출 금지
  - Google OAuth 시크릿: 안전하게 보관
- [ ] **민감 정보 제거**
  - .env 파일이 .gitignore에 포함됨
  - 하드코딩된 비밀번호/키 없음
  - console.log로 민감 정보 출력 없음

### 4. 데이터베이스 준비
- [ ] **Supabase 프로덕션 프로젝트 설정 완료**
- [ ] **스키마 마이그레이션 적용**
  ```sql
  -- 001_initial_schema.sql
  -- 002_rls_policies.sql
  -- 003_4tier_permission_system.sql
  ```
- [ ] **시드 데이터 삽입**
  ```bash
  npm run db:seed
  ```
- [ ] **백업 설정 활성화**

---

## 🔧 Vercel 배포 단계

### 1단계: 프로젝트 연결
```bash
# Vercel CLI 설치 및 로그인
npm install -g vercel
vercel login

# 프로젝트 초기화
vercel

# 설정 확인사항:
# - Framework Preset: Next.js
# - Build Command: npm run build
# - Output Directory: .next
# - Install Command: npm install
```

### 2단계: 환경변수 설정
Vercel Dashboard > Settings > Environment Variables에서 설정:

**필수 환경변수:**
```bash
# Supabase 연결
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# NextAuth 설정
NEXTAUTH_SECRET=[random-secret]
NEXTAUTH_URL=https://[your-app].vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=[client-id].googleusercontent.com
GOOGLE_CLIENT_SECRET=[client-secret]

# 선택적 설정
NEXT_PUBLIC_MOCK_MODE=false
LOG_LEVEL=info
```

### 3단계: Google OAuth 설정 업데이트
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. APIs & Services > Credentials
3. OAuth 2.0 Client ID 선택
4. 승인된 리디렉션 URI에 추가:
   ```
   https://[your-app].vercel.app/auth/callback/google
   ```

### 4단계: 도메인 설정 (선택)
- Vercel Dashboard > Domains에서 커스텀 도메인 연결
- 권장 도메인: `viet-k-connect.vercel.app` (기본) 또는 커스텀 도메인

### 5단계: 배포 실행
```bash
# 프로덕션 배포
vercel --prod

# 배포 완료 후 URL 확인
# 예: https://viet-k-connect.vercel.app
```

---

## 🧪 배포 후 검증

### 1. 기본 기능 테스트
- [ ] **홈페이지 로딩** (https://[your-app].vercel.app)
- [ ] **Google 로그인 작동**
- [ ] **질문 작성/조회**
- [ ] **답변 작성/채택**
- [ ] **검색 기능**
- [ ] **프로필 페이지**
- [ ] **카테고리 필터링**

### 2. 성능 검증
- [ ] **페이지 로딩 속도 < 3초**
- [ ] **Lighthouse 성능 점수 > 90**
- [ ] **모바일 반응형 정상 작동**
- [ ] **이미지 최적화 확인**

### 3. 4-Tier 권한 시스템 검증
- [ ] **Guest**: 읽기 전용 접근
- [ ] **User**: 가입 후 질문/답변 작성
- [ ] **Verified**: 전문가 인증 후 추가 권한
- [ ] **Admin**: 관리자 기능 접근

### 4. 데이터베이스 연결 검증
- [ ] **실제 데이터 저장/조회**
- [ ] **RLS 정책 적용 확인**
- [ ] **시드 데이터 표시**
- [ ] **사용자 인증 상태 저장**

---

## 🐛 문제 해결

### 자주 발생하는 오류

#### 1. 환경변수 오류
```
Error: Missing environment variable
```
**해결방법:**
1. Vercel Dashboard에서 환경변수 재확인
2. Production, Preview, Development 모두 설정
3. 배포 재시작

#### 2. OAuth 리디렉션 오류
```
Error: redirect_uri_mismatch
```
**해결방법:**
1. Google Cloud Console에서 Authorized redirect URIs 확인
2. 정확한 Vercel URL 추가
3. HTTP → HTTPS 확인

#### 3. 데이터베이스 연결 실패
```
Error: Database connection failed
```
**해결방법:**
1. Supabase 프로젝트 상태 확인
2. URL/Key 정확성 검증
3. RLS 정책 설정 확인

#### 4. 빌드 실패
```
Error: Build failed
```
**해결방법:**
1. 로컬에서 `npm run build` 성공 확인
2. package.json의 dependencies 확인
3. TypeScript 오류 수정

### 긴급 대응 절차

#### Level 1 - 기능 오류 (24시간 내 수정)
1. 오류 로그 확인: `vercel logs [url]`
2. 핫픽스 적용 및 재배포
3. 베타 테스터에게 공지

#### Level 2 - 서비스 장애 (4시간 내 복구)
1. 이전 버전으로 롤백: `vercel rollback`
2. 원인 분석 및 수정
3. 테스트 후 재배포

#### Level 3 - 보안 이슈 (1시간 내 대응)
1. 즉시 서비스 중단
2. 환경변수 재생성
3. 보안 패치 적용

---

## 📋 베타 출시 준비

### 베타 테스터 온보딩
1. **베타 링크 공유**: https://[your-app].vercel.app
2. **간단한 사용 가이드** 제공
3. **피드백 수집 채널** 안내 (Google Form)
4. **문의 채널** 제공 (이메일 또는 카카오톡)

### 모니터링 설정
- [ ] **Vercel Analytics 활성화**
- [ ] **Supabase Logs 모니터링**
- [ ] **사용자 행동 추적** (베타 테스트용)
- [ ] **오류 로그 실시간 알림**

### 성공 지표 추적
```yaml
기술적_지표:
  - 가동시간: >99.5%
  - 페이지_로딩: <3초
  - 오류율: <1%
  - 동시_사용자: 50명 지원

사용자_지표:
  - 가입_완료율: >80%
  - 질문_작성율: >50%
  - 답변_작성율: >30%
  - 재방문율: >60%
```

---

## 🎯 다음 단계

### 베타 테스트 완료 후
1. **피드백 수집 및 분석**
2. **핵심 개선사항 반영**
3. **정식 출시 준비**
4. **마케팅 및 홍보 전략 실행**

### 장기 계획
1. **사용자 기반 확장** (100명 → 1,000명)
2. **추가 기능 개발** (Phase 2 기능들)
3. **모바일 앱 개발** (React Native)
4. **수익 모델 도입**

---

## ✅ 최종 확인

모든 항목 완료 후:
- [ ] 프로덕션 URL 정상 작동
- [ ] 베타 테스터 모집 준비 완료
- [ ] 피드백 수집 시스템 준비
- [ ] 긴급 대응 체계 구축

**🎉 베타 출시 준비 완료!**

베타 테스트를 통해 실제 사용자 피드백을 받고, MVP를 더욱 완성도 높은 제품으로 발전시킬 수 있습니다.