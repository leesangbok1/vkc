# Agent 3: Supabase 프로젝트 초기 설정

**담당 이슈**: #41 (Supabase 프로젝트 초기 설정)
**브랜치**: `feature/issue-41-supabase`
**상태**: 🔴 **Phase 1 긴급 시작**
**우선순위**: 🔥 **최우선** (기반 인프라)

---

## 🎯 핵심 목표

### Supabase 환경 구축
- 프로젝트 생성 및 설정
- 환경 변수 구성
- 클라이언트 연결 설정
- OAuth 프로바이더 설정

### 인증 설정
- Google OAuth 설정
- Kakao OAuth 설정
- 리디렉션 URL 구성
- 보안 정책 설정

---

## 🔧 주요 작업

### 프로젝트 설정
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 초기 설정
- [ ] API 키 발급 및 관리
- [ ] 환경 변수 구성

### OAuth 설정
- [ ] Google OAuth 앱 생성
- [ ] Kakao OAuth 앱 생성
- [ ] Redirect URL 설정
- [ ] 테스트 계정 설정

### 클라이언트 설정
- [ ] Supabase 클라이언트 생성
- [ ] 서버 컴포넌트용 클라이언트
- [ ] 클라이언트 컴포넌트용 클라이언트
- [ ] 미들웨어 설정

## 🚨 **긴급 명령 - Agent 1로부터**

**현재 상황**: Agent 7의 CRUD API가 완성되었지만 Supabase 연결이 필요
- 환경변수 설정 필요
- Supabase 클라이언트 연결 설정
- OAuth 기본 설정 준비

**즉시 수행할 작업** (Agent 2와 병렬):
1. **Next.js 15 + Supabase 환경 설정**:
   - `.env.local` 환경변수 설정 (NEXT_PUBLIC_ 접두사 사용)
   - Supabase 프로젝트 URL 및 Anon Key 설정

2. **Next.js용 Supabase 클라이언트 생성**:
   - `/lib/supabase.ts` - 기본 클라이언트
   - `/lib/supabase-server.ts` - 서버 컴포넌트용 (`@supabase/ssr`)
   - `/lib/supabase-browser.ts` - 클라이언트 컴포넌트용

3. **인증 설정 준비**:
   - Google OAuth 설정 (Redirect URL: `/auth/callback`)
   - Kakao OAuth 기본 구성
   - `/middleware.ts` 인증 미들웨어 생성

**Agent 4, 5를 위한 준비**:
- Agent 4가 DB 스키마 구현할 수 있도록 기반 제공
- Agent 5가 인증 시스템 구현할 수 있도록 OAuth 준비

**완료 후 즉시 보고**: Agent 1에게 완료 상태 및 다음 Agent 작업 가능 여부

**담당자**: Agent 3
**시작 시간**: 즉시 (Agent 2와 동시)