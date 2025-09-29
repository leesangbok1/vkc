# 🚀 병렬 작업 가이드

**목적**: 에이전트별 독립 브랜치 작업을 위한 명확한 지침
**생성일**: 2025-09-29

## 📋 필수 체크리스트

### ✅ 작업 시작 전 (필수)
```bash
# 1. 최신 상태 동기화
git fetch origin
git checkout main
git pull origin main

# 2. 이슈 확인
gh issue view [이슈번호]

# 3. 브랜치 생성 (정확한 명명 규칙)
git checkout -b feature/issue-[번호]-[기능명]

# 4. 브랜치 확인 (중요!)
git branch  # 현재 브랜치가 맞는지 확인
```

### 🔧 작업 중 (반드시 준수)
```bash
# 1. 브랜치 상태 확인 (자주)
git branch  # 현재 어느 브랜치인지 확인

# 2. 의미있는 단위로 커밋
git add [파일들]
git commit -m "feat: [구체적인 기능 설명]"

# 3. 정기적 백업 (30분-1시간마다)
git push origin feature/issue-[번호]-[기능명]
```

### ✅ 작업 완료 시 (필수)
```bash
# 1. 최종 푸시
git push -u origin feature/issue-[번호]-[기능명]

# 2. PR 생성
gh pr create --title "[Issue #번호] 기능명" --body "작업 내용 상세 설명"

# 3. 이슈 업데이트
gh issue comment [이슈번호] --body "작업 완료, PR #[PR번호] 생성"
```

## 🎯 에이전트별 작업 할당

### Agent 2: Next.js 구조 (#40)
```bash
# 브랜치: feature/issue-40-nextjs
# 작업 내용:
- app/ 디렉토리 구조 완성
- TypeScript 설정
- 기본 레이아웃 파일
- next.config.js 설정
```

### Agent 3: Supabase 설정 (#41)
```bash
# 브랜치: feature/issue-41-supabase
# 작업 내용:
- Supabase 프로젝트 생성
- 환경 변수 설정
- lib/supabase/ 클라이언트 구성
- 기본 인증 설정
```

### Agent 4: DB 스키마 (#42)
```bash
# 브랜치: feature/issue-42-database
# 작업 내용:
- PostgreSQL 테이블 설계
- RLS 정책 작성
- 마이그레이션 파일 생성
- 데이터베이스 타입 정의
```

### Agent 5: 인증 시스템 (#42)
```bash
# 브랜치: feature/issue-42-auth
# 작업 내용:
- Supabase Auth 구현
- 인증 미들웨어
- 로그인/로그아웃 API
- 세션 관리
```

### Agent 6: 소셜 로그인 (#44)
```bash
# 브랜치: feature/issue-44-social
# 작업 내용:
- Google OAuth 설정
- Kakao OAuth 설정
- 소셜 로그인 컴포넌트
- 계정 연결 로직
```

### Agent 7: CRUD API (#43)
```bash
# 브랜치: feature/issue-43-crud
# 작업 내용:
- API 라우트 구현
- 데이터 CRUD 로직
- 에러 처리
- 유효성 검사
```

### Agent 8: 컴포넌트 (#45)
```bash
# 브랜치: feature/issue-45-components
# 작업 내용:
- shadcn/ui 설정
- 기존 컴포넌트 마이그레이션
- UI 컴포넌트 라이브러리
- 스타일링 시스템
```

## 🚫 금지사항 (절대 하지 말 것)

### ❌ 잘못된 브랜치 작업
```bash
# 절대 하지 마세요!
git checkout feature/다른에이전트브랜치  # 다른 에이전트 브랜치
git checkout main  # main에서 직접 작업
git commit -m "..."  # 잘못된 브랜치에서 커밋
```

### ❌ 브랜치 확인 없이 작업
```bash
# 위험! 브랜치 확인 없이 작업
git add .
git commit -m "작업"  # 어느 브랜치인지 모르고 커밋
```

### ❌ 푸시 없이 장시간 작업
```bash
# 위험! 로컬에만 작업 저장
# 1시간 이상 푸시 안 함 → 작업 손실 위험
```

## 🔧 문제 해결

### 잘못된 브랜치에서 작업한 경우
```bash
# 1. 현재 작업 임시 저장
git stash push -m "잘못된 브랜치에서 작업"

# 2. 올바른 브랜치로 이동
git checkout feature/issue-[올바른번호]-[기능명]

# 3. 작업 복구
git stash pop
```

### 브랜치 충돌 발생 시
```bash
# 1. 현재 작업 저장
git add .
git commit -m "wip: save current work"

# 2. main 브랜치 최신화
git checkout main
git pull origin main

# 3. 내 브랜치에 최신 변경사항 적용
git checkout feature/issue-[번호]-[기능명]
git rebase main

# 4. 충돌 해결 후
git add .
git rebase --continue
```

### 실수로 다른 에이전트 파일 수정 시
```bash
# 1. 수정사항 되돌리기
git checkout HEAD -- [다른에이전트파일]

# 2. 본인 작업 파일만 커밋
git add [본인작업파일들]
git commit -m "feat: 본인 작업 내용"
```

## 📊 진행 상황 추적

### 일일 체크
```bash
# 1. 본인 브랜치 상태 확인
git status
git log --oneline -5

# 2. GitHub에 푸시 상태 확인
git remote show origin

# 3. 이슈 상태 업데이트
gh issue comment [이슈번호] --body "오늘 진행 상황: [내용]"
```

### 주간 동기화
```bash
# 1. main 브랜치 최신화
git checkout main
git pull origin main

# 2. 내 브랜치 동기화
git checkout feature/issue-[번호]-[기능명]
git rebase main
```

## 🎯 성공 기준

### 각 에이전트별 목표
- ✅ 담당 이슈와 브랜치 1:1 매핑
- ✅ 다른 에이전트 파일 수정 없음
- ✅ 일일 1회 이상 GitHub 푸시
- ✅ 작업 완료 시 PR 생성
- ✅ 이슈 상태 실시간 업데이트

### 팀 전체 목표
- ✅ 브랜치 충돌 최소화 (< 5%)
- ✅ 모든 작업 추적 가능
- ✅ 일일 진행 상황 공유
- ✅ 주간 통합 리뷰 진행

## 📞 도움 요청

### 문제 발생 시
1. **브랜치 문제**: `git branch` 결과 공유
2. **충돌 문제**: `git status` 결과 공유
3. **푸시 문제**: 오류 메시지 전체 공유

### 확인이 필요한 경우
1. **작업 범위**: 본인 담당 파일이 맞는지 확인
2. **의존성**: 다른 에이전트 작업 기다려야 하는지 확인
3. **우선순위**: 작업 순서가 맞는지 확인

---

**기억하세요**: 명확한 지시사항 준수가 성공의 핵심입니다! 🎯