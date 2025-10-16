# 🔐 Google OAuth 설정 가이드

**작성일**: 2025-01-16
**목적**: Supabase + Google 로그인 연동 설정

---

## 🎯 Step 1: Google Cloud Console 설정

### 1️⃣ Google Cloud Console 접속
https://console.cloud.google.com/

### 2️⃣ 프로젝트 선택 또는 생성
1. 상단 프로젝트 선택 드롭다운 클릭
2. 기존 프로젝트 선택 또는 **"새 프로젝트"** 클릭
3. 프로젝트 이름: `VietKConnect` (또는 원하는 이름)

### 3️⃣ OAuth 동의 화면 구성
1. 왼쪽 메뉴 → **"API 및 서비스"** → **"OAuth 동의 화면"**
2. User Type: **"외부"** 선택 → **"만들기"**
3. 앱 정보 입력:
   ```
   앱 이름: VietKConnect
   사용자 지원 이메일: [your-email@example.com]
   앱 로고: (선택사항)
   앱 도메인:
     - 홈페이지: http://localhost:3000
   개발자 연락처: [your-email@example.com]
   ```
4. **"저장 후 계속"** 클릭
5. 범위 추가 (Scopes):
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - **"저장 후 계속"** 클릭
6. 테스트 사용자 추가:
   - **"ADD USERS"** 클릭
   - 테스트할 Gmail 주소 입력
   - **"저장 후 계속"** 클릭

### 4️⃣ OAuth 2.0 클라이언트 ID 생성
1. 왼쪽 메뉴 → **"사용자 인증 정보"**
2. 상단 **"+ 사용자 인증 정보 만들기"** → **"OAuth 클라이언트 ID"**
3. 애플리케이션 유형: **"웹 애플리케이션"**
4. 이름: `VietKConnect Web Client`
5. **승인된 자바스크립트 원본** 추가:
   ```
   http://127.0.0.1:3000
   ```
   ⚠️ **중요**: `localhost` 대신 `127.0.0.1` 사용 (Google OAuth 개발 환경 제약)
6. **승인된 리디렉션 URI** 추가:
   ```
   https://aamzgmhfshsgosjoywlu.supabase.co/auth/v1/callback
   ```
   ⚠️ **중요**: 이건 Supabase URL이므로 그대로 사용
7. **"만들기"** 클릭
8. 📋 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사해두기:
   ```
   클라이언트 ID: [복사한 값]
   클라이언트 보안 비밀번호: [복사한 값]
   ```

---

## 🎯 Step 2: Supabase Dashboard 설정

### 1️⃣ Supabase 프로젝트 접속
https://supabase.com/dashboard/project/aamzgmhfshsgosjoywlu

### 2️⃣ Authentication → Providers 설정
1. 왼쪽 사이드바 → **⚙️ Authentication** → **Providers**
2. **Google** 찾기 → 오른쪽 토글 **ON**
3. Google Provider 설정:
   ```
   Enabled: ✅ ON

   Client ID (for OAuth):
   [Step 1에서 복사한 Google 클라이언트 ID 붙여넣기]

   Client Secret (for OAuth):
   [Step 1에서 복사한 Google 클라이언트 보안 비밀번호 붙여넣기]

   Authorized Client IDs: (비워두기)

   Skip nonce check: ❌ OFF
   ```
4. **"Save"** 버튼 클릭

### 3️⃣ Redirect URLs 확인
1. 같은 페이지 하단 **"Redirect URLs"** 섹션 확인
2. 다음 URL이 자동으로 추가되어 있어야 함:
   ```
   https://aamzgmhfshsgosjoywlu.supabase.co/auth/v1/callback
   ```

### 4️⃣ Site URL 설정 (개발 환경)
1. Authentication → **URL Configuration**
2. **Site URL** 설정:
   ```
   Site URL: http://127.0.0.1:3000
   ```
   ⚠️ **중요**: Google OAuth 연동 시 `localhost` 대신 `127.0.0.1` 사용
3. **Redirect URLs** 섹션에 추가:
   ```
   http://127.0.0.1:3000/auth/callback
   http://127.0.0.1:3000/*
   ```

---

## ✅ 설정 완료 체크리스트

### Google Cloud Console
- [ ] 프로젝트 생성 완료
- [ ] OAuth 동의 화면 구성 완료
- [ ] OAuth 2.0 클라이언트 ID 생성 완료
- [ ] 클라이언트 ID 복사
- [ ] 클라이언트 보안 비밀번호 복사
- [ ] 승인된 리디렉션 URI 설정: `https://aamzgmhfshsgosjoywlu.supabase.co/auth/v1/callback`

### Supabase Dashboard
- [ ] Google Provider 활성화 완료
- [ ] Client ID 입력 완료
- [ ] Client Secret 입력 완료
- [ ] 설정 저장 완료
- [ ] Site URL 설정: `http://127.0.0.1:3000` (localhost 대신 127.0.0.1 사용)

---

## 🧪 테스트 준비 완료!

설정이 완료되면 다음 단계로 진행:
1. ✅ Step 1 & 2 완료
2. ⏳ Step 3: 로그인 페이지 코드 구현
3. ⏳ Step 4: 콜백 핸들러 구현
4. ⏳ Step 5: Header 사용자 정보 연동

---

## 🔗 참고 링크

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/aamzgmhfshsgosjoywlu
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

## ⚠️ 주요 주의 사항

### 🔴 개발 환경 설정
1. **localhost 대신 127.0.0.1 사용**:
   - Google OAuth는 개발 환경에서 `localhost` 도메인 제약이 있음
   - 모든 URL에 `http://127.0.0.1:3000` 사용
   - 브라우저 접속도 `http://127.0.0.1:3000` 사용

2. **테스트 모드**:
   - OAuth 동의 화면이 "테스트" 모드일 경우, 추가한 테스트 사용자만 로그인 가능
   - 반드시 테스트 사용자로 본인 Gmail 추가

### 🟡 프로덕션 배포 시
1. OAuth 동의 화면을 "프로덕션"으로 변경 필요
2. Redirect URI에 프로덕션 도메인 추가
3. Google Cloud Console과 Supabase 양쪽 모두 업데이트

---

**설정 완료 후 알려주세요!** 🚀
다음 단계 코드 구현을 진행하겠습니다.
