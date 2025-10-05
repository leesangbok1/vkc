# 🚀 Viet K-Connect 통합 개발 시스템

완전한 개발 요청 → 실행 파이프라인을 지원하는 통합 시스템입니다.

## 📋 시스템 구성

### 1. 플랜 관리 시스템 (`plan-manager.js`)
- 개발 요청사항 분석 및 플랜 생성
- 사용자 승인 워크플로우
- 플랜 파일 저장 및 관리

### 2. 컨텍스트 보존 시스템 (`context-manager.js`)
- 세션간 작업 내용 저장/복원
- 진행 상황 파일 기반 추적
- 컨텍스트 한계 보완

### 3. GitHub 자동화 시스템 (`github-auto-issue.js`)
- 작업 완료 시 자동 이슈 생성
- 사용자 승인 후 자동 커밋
- Agent 작업 완료 추적

### 4. 병렬 작업 관리 (`parallel-agent-manager.js`)
- 8개 Agent 병렬 작업 관리
- 의존성 기반 작업 스케줄링
- 진행률 모니터링

### 5. 통합 워크플로우 (`workflow-manager.js`)
- 모든 시스템 통합 관리
- 완전한 개발 파이프라인
- 자동화된 진행 상황 추적

## 🔄 워크플로우

### 기본 사용법

```bash
# 1. 완전한 개발 워크플로우 실행
node scripts/workflow-manager.js execute "로그인 페이지 개발"

# 2. 세션 재개
node scripts/context-manager.js resume

# 3. 진행 상황 확인
node scripts/workflow-manager.js dashboard
```

### 상세 워크플로우

```
📝 요청사항 입력
    ↓
🧠 자동 플랜 생성
    ↓
🤝 사용자 승인
    ↓
📋 컨텍스트 생성
    ↓
⚡ 플랜 실행
    ↓
🤖 Agent 시스템 연동
    ↓
📊 진행 상황 추적
    ↓
🎯 자동 커밋 & 이슈 생성
```

## 📊 플랜 생성 시스템

### 자동 분석 기능
- **도메인 식별**: UI, API, Auth, Database, Testing 등
- **복잡도 추정**: Low, Medium, High
- **소요 시간 계산**: 1-5일 자동 추정
- **우선순위 판단**: Normal, High
- **리소스 요구사항**: 필요 도구 및 스킬 식별

### 생성되는 플랜 내용
- ✅ 상세 작업 목록 (Task breakdown)
- 📈 타임라인 및 마일스톤
- 🛠️ 필요 리소스 및 도구
- ⚠️ 리스크 식별 및 대응방안
- 📁 예상 파일 변경 목록
- 🔗 의존성 관리

## 💾 컨텍스트 보존 시스템

### 세션 관리
```bash
# 새 세션 생성
node scripts/context-manager.js create "요청사항"

# 세션 재개
node scripts/context-manager.js resume [SESSION_ID]

# 세션 목록
node scripts/context-manager.js list

# 세션 요약
node scripts/context-manager.js summary SESSION_ID
```

### 저장되는 정보
- 📝 요청사항 및 진행 상황
- 🎯 연결된 플랜 정보
- ✅ 완료된 단계 및 다음 단계
- 📁 파일 변경 내역
- 🌿 Git 환경 정보 (브랜치, 커밋)
- 📝 작업 노트

## 🤖 Agent 시스템 연동

### 8개 Agent 자동 배치
```
Agent 1: 프로젝트 관리 & 자동화
Agent 2: Next.js 15 최적화
Agent 3: Supabase 운영 환경
Agent 4: 데이터베이스 최적화
Agent 5: OAuth 인증 시스템
Agent 6: 소셜 로그인 & 프로필
Agent 7: CRUD API & 실시간
Agent 8: UI/UX 베트남 테마
```

### 자동 이슈 생성
- 플랜 도메인 분석 → 관련 Agent 식별
- Agent별 작업 이슈 자동 생성
- 진행 상황 자동 추적
- 완료 시 자동 커밋

## 📈 진행 상황 추적

### 실시간 대시보드
```bash
# 통합 대시보드 보기
node scripts/workflow-manager.js dashboard

# 컨텍스트 대시보드
node scripts/context-manager.js dashboard

# Agent 진행률
node scripts/parallel-agent-manager.js
```

### 추적 정보
- 📊 전체 진행률 (완료/총 작업)
- 🎯 현재 단계 및 다음 마일스톤
- 📅 예상 완료 시간
- ⚠️ 리스크 및 차단 요소
- 🔄 Agent별 작업 상태

## 🔧 시스템 관리

### 환경 설정
```bash
# GitHub Token 설정 (이슈 생성용)
export GITHUB_TOKEN=your_token_here

# 또는 .env 파일에 추가
echo "GITHUB_TOKEN=your_token_here" >> .env
```

### 정기 유지보수
```bash
# 오래된 컨텍스트 정리 (30일 이상)
node scripts/context-manager.js cleanup 30

# Agent 작업 상태 체크
node scripts/github-auto-issue.js

# 전체 시스템 상태 확인
node scripts/workflow-manager.js dashboard
```

## 📁 파일 구조

```
scripts/
├── plan-manager.js          # 플랜 생성 및 관리
├── context-manager.js       # 컨텍스트 보존 시스템
├── github-auto-issue.js     # GitHub 자동화
├── parallel-agent-manager.js # Agent 병렬 작업 관리
├── workflow-manager.js      # 통합 워크플로우
└── README.md               # 이 파일

plans/                      # 생성된 플랜 저장
├── plan-session-xxx.json
├── plan-session-xxx.md
└── ...

contexts/                   # 컨텍스트 정보 저장
├── sessions/              # 세션 데이터
├── progress/              # 진행 상황
├── progress-dashboard.md  # 진행 대시보드
└── recent-session.txt     # 최근 세션 ID
```

## 🎯 사용 시나리오

### 시나리오 1: 새 기능 개발
```bash
# 요청
node scripts/workflow-manager.js execute "사용자 프로필 페이지 개발"

# 자동 실행
- 플랜 생성 (UI + API + Database)
- 사용자 승인 요청
- Agent 8 (UI) + Agent 7 (API) + Agent 4 (DB) 작업 배치
- GitHub 이슈 자동 생성
- 진행 상황 실시간 추적
```

### 시나리오 2: 중단된 작업 재개
```bash
# 최근 세션 재개
node scripts/context-manager.js resume

# 특정 세션 재개
node scripts/context-manager.js resume session-1696387200000

# 진행 상황 확인
node scripts/workflow-manager.js status session-1696387200000
```

### 시나리오 3: 전체 현황 모니터링
```bash
# 통합 대시보드
node scripts/workflow-manager.js dashboard

# 결과: contexts/progress-dashboard.md 생성
# 결과: docs/AGENT_PROGRESS_DASHBOARD.md 업데이트
```

## ⚠️ 주의사항

### 필수 요구사항
- Node.js 16+ 환경
- Git 저장소에서 실행
- GITHUB_TOKEN 환경변수 설정
- 기존 Agent 시스템과 호환

### 제한사항
- GitHub API rate limit (시간당 5000회)
- 플랜 승인은 수동으로 진행
- Agent 작업 완료는 문서 기반 감지

### 보안 고려사항
- GitHub Token은 환경변수로만 관리
- 민감한 정보는 컨텍스트에서 제외
- 플랜 파일은 로컬 저장만 지원

## 🔮 향후 개선사항

1. **실시간 웹 대시보드**: React 기반 실시간 모니터링
2. **Slack/Discord 연동**: 진행 상황 자동 알림
3. **AI 기반 플랜 최적화**: GPT를 활용한 더 정확한 분석
4. **자동 테스트 연동**: 진행률에 테스트 결과 반영
5. **배포 자동화**: 완료 시 자동 배포 파이프라인

---

**생성일**: ${new Date().toLocaleString('ko-KR')}
**버전**: 1.0.0
**관리자**: Claude Code System