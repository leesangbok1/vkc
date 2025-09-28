# Agent 1: GitHub 이슈 정리 담당

## 🎯 브랜치
`feature/issue-management-cleanup`

## 📋 작업 내용
1. GitHub 이슈 37개를 12개로 정리
2. 중복 이슈 닫기 (gh issue close)
3. 새 마일스톤 생성
4. 정리된 핵심 이슈 생성
5. ISSUE_TRACKER.md 업데이트

## 🚀 실행 명령어

### 1. 브랜치 생성
```bash
git checkout -b feature/issue-management-cleanup
```

### 2. 중복 이슈 닫기
```bash
# Supabase 관련 중복 (5개 → 1개)
gh issue close 11 14 15 27 --comment "통합: #003 Supabase DB 스키마로 통합"

# 인증 시스템 중복 (3개 → 1개)
gh issue close 8 16 28 --comment "통합: #004 인증 시스템으로 통합"

# 질문/답변 시스템 중복 (3개 → 1개)
gh issue close 6 18 30 --comment "통합: #006 질문/답변 시스템으로 통합"

# 배포 설정 중복 (3개 → 1개)
gh issue close 12 17 29 --comment "통합: #012 Vercel 배포로 통합"

# UI/UX 개선 중복 (3개 → 1개)
gh issue close 5 19 31 --comment "통합: #010 UI/UX 개선으로 통합"

# 성능 최적화 중복 (3개 → 1개)
gh issue close 10 20 32 --comment "통합: #011 성능 최적화로 통합"

# 이슈 템플릿 중복 (5개 종료)
gh issue close 7 22 24 34 36 --comment "이슈 템플릿 작업 완료"

# WBS 템플릿 중복 (3개 종료)
gh issue close 9 21 33 --comment "WBS 템플릿 작업 완료"

# 테스트 이슈 종료
gh issue close 4 25 37 --comment "테스트 이슈 종료"
```

### 3. 새 마일스톤 생성
```bash
gh api repos/leesangbok1/vkc/milestones \
  --method POST \
  --field title="Next.js + Supabase Migration" \
  --field description="Vite/Firebase에서 Next.js/Supabase로 전환" \
  --field due_on="2025-10-15T00:00:00Z"
```

### 4. 정리된 핵심 이슈 생성
```bash
# Migration 이슈
gh issue create \
  --title "[Migration] Next.js 14 프로젝트 구조 복원" \
  --body "- Next.js 14 설정\n- app/ 디렉토리 구조\n- TypeScript 설정\n- Tailwind CSS 설정" \
  --label "🔴 high-priority,migration" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

gh issue create \
  --title "[Migration] Supabase 프로젝트 초기 설정" \
  --body "- Supabase 프로젝트 생성\n- 환경 변수 설정\n- 클라이언트 설정" \
  --label "🔴 high-priority,migration" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

# 백엔드 인프라
gh issue create \
  --title "[DB] Supabase 데이터베이스 스키마 설계" \
  --body "- 테이블 구조 설계\n- RLS 정책\n- 인덱싱" \
  --label "🔴 high-priority,database" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

gh issue create \
  --title "[Auth] Supabase 인증 시스템 구현" \
  --body "- 이메일/비밀번호 인증\n- 세션 관리\n- 미들웨어" \
  --label "🔴 high-priority,auth" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

gh issue create \
  --title "[Auth] 카카오/구글 OAuth 소셜 로그인" \
  --body "- Google OAuth\n- 카카오 OAuth\n- 프로필 동기화" \
  --label "🟡 medium-priority,auth" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

# 핵심 기능
gh issue create \
  --title "[API] 질문 CRUD API 개발" \
  --body "- GET/POST/PUT/DELETE\n- 서버 컴포넌트\n- 캐싱 전략" \
  --label "🔴 high-priority,api" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

gh issue create \
  --title "[Feature] 알림 시스템" \
  --body "- Supabase Realtime\n- 알림 UI\n- 알림 저장소" \
  --label "🟡 medium-priority,realtime" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"

# 프론트엔드
gh issue create \
  --title "[Frontend] React 컴포넌트 마이그레이션" \
  --body "- JSX → TSX 변환\n- Firebase → Supabase\n- 스타일 조정" \
  --label "🔴 high-priority,frontend" \
  --assignee "@bk" \
  --milestone "Next.js + Supabase Migration"
```

## 📁 수정할 파일
- `docs/project/ISSUE_TRACKER.md` 업데이트

## ✅ 완료 기준
1. ✅ 37개 이슈를 12개로 정리
2. ✅ 새 마일스톤 생성
3. ✅ 정리된 이슈 생성
4. ✅ ISSUE_TRACKER.md 업데이트
5. ✅ PR 생성 및 머지

## 📅 예상 소요 시간
**총 1.5시간**