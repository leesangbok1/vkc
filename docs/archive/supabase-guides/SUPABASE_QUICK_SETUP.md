# 🚀 Supabase 실제 연동 가이드 (5분 완료)

> **목표**: Mock 모드 → 실제 Supabase 연결로 전환하여 MVP 베타 테스트 준비

## 📋 1단계: Supabase 프로젝트 생성 (2분)

### 1. Supabase 계정 생성
- 📍 https://supabase.com/dashboard 접속
- GitHub 계정으로 로그인 (추천)

### 2. 새 프로젝트 생성
```bash
프로젝트명: viet-kconnect-2025
Organization: 개인 계정 선택
Database Password: 안전한 비밀번호 설정 (기록 필수!)
Region: Northeast Asia (ap-northeast-1) - 한국 서버
```

### 3. 프로젝트 생성 대기
- 약 30-60초 소요
- 완료되면 Dashboard 화면으로 이동

## 🔐 2단계: API 키 복사 (1분)

### Project Settings > API 이동
```bash
1. 왼쪽 사이드바 → Settings → API 클릭
2. 다음 정보 복사:

📍 Project URL: https://your-project-ref.supabase.co
🔑 anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔒 service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚙️ 3단계: 환경 변수 업데이트 (30초)

### .env.local 파일 수정
```bash
# 기존 내용을 실제 값으로 교체
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Mock 모드 비활성화
NEXT_PUBLIC_MOCK_MODE=false
```

## 📊 4단계: 데이터베이스 스키마 적용 (2분)

### SQL Editor에서 마이그레이션 실행
```bash
1. Dashboard → SQL Editor 이동
2. 다음 순서로 실행:

📝 1) supabase/migrations/001_initial_schema.sql 전체 복사 → 실행
📝 2) supabase/migrations/002_rls_policies.sql 전체 복사 → 실행
📝 3) supabase/migrations/003_4tier_permission_system.sql 전체 복사 → 실행
```

### 실행 확인 방법
```sql
-- 테이블 생성 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- 예상 결과: users, categories, questions, answers, votes, comments, notifications
```

## 🔄 5단계: 연결 테스트 (30초)

### 개발 서버 재시작
```bash
# 현재 서버 중지 (Ctrl+C)
npm run dev

# 브라우저에서 확인
# → http://localhost:3000
# → Mock 데이터 대신 빈 상태 또는 실제 DB 연결 확인
```

### 성공 확인 방법
```bash
✅ 콘솔에 "Supabase server client running in mock mode" 메시지 없음
✅ 네트워크 탭에서 실제 Supabase API 호출 확인
✅ 질문 목록이 빈 배열로 정상 응답
```

## 🎯 6단계: 인증 설정 (Google OAuth)

### Authentication > Providers 설정
```bash
1. Dashboard → Authentication → Providers
2. Google 활성화
3. Google Console에서 OAuth 설정:
   - https://console.cloud.google.com/
   - 새 프로젝트 생성: "viet-kconnect"
   - OAuth 동의 화면 설정
   - Client ID/Secret 생성
   - Redirect URL 추가: https://your-project.supabase.co/auth/v1/callback
```

## 🧪 7단계: 테스트 데이터 추가 (선택사항)

### SQL Editor에서 실행
```sql
-- 테스트 질문 1개 추가
INSERT INTO questions (
  title, content, author_id, category_id, tags, status
) VALUES (
  '테스트 질문입니다',
  '실제 Supabase 연결이 잘 되는지 확인하는 질문입니다.',
  'admin-test-user-uuid',
  1,
  ARRAY['테스트', '연결확인'],
  'open'
);
```

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] API 키 3개 복사 완료
- [ ] .env.local 업데이트 완료
- [ ] 3개 마이그레이션 실행 완료
- [ ] Mock 모드 비활성화 완료
- [ ] 개발 서버 재시작 완료
- [ ] 실제 DB 연결 확인 완료
- [ ] Google OAuth 설정 완료 (선택)

## 🚨 문제 해결

### 연결 실패 시
```bash
1. .env.local 값 재확인
2. 개발 서버 재시작
3. 브라우저 콘솔 에러 확인
4. Supabase Dashboard > Logs 확인
```

### 스키마 에러 시
```bash
1. SQL Editor에서 테이블 존재 확인
2. RLS 정책 적용 확인
3. 권한 설정 확인
```

---

**🎯 완료 시점**: Mock 모드 → 실제 Supabase 연결 성공!
**📈 다음 단계**: 질문 작성 기능 테스트 및 Google 로그인 구현