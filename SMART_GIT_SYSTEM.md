# 🚀 스마트 Git & 이슈 관리 시스템

## 📋 개요

이 프로젝트는 Git 워크플로우와 GitHub 이슈 관리를 자동화하는 통합 시스템입니다. 커밋 메시지를 분석하여 자동으로 이슈를 생성하고, 스마트한 커밋 확인 프로세스를 제공하며, 프로젝트 마일스톤을 자동으로 관리합니다.

## 🎯 주요 기능

### 1. 자동 이슈 생성 시스템
- **Git Hook 기반**: 커밋 후 자동으로 GitHub 이슈 생성
- **지능형 분석**: 커밋 메시지 패턴 분석 및 이슈 타입 자동 분류
- **구조화된 템플릿**: 일관된 이슈 형식으로 자동 생성

### 2. GitHub 이슈 템플릿
- **버그 리포트**: 체계적인 버그 신고 템플릿
- **기능 요청**: 상세한 기능 제안 템플릿
- **문서화 요청**: 문서 개선 및 작성 템플릿

### 3. 스마트 커밋 확인 시스템
- **변경사항 분석**: 파일 수, 변경량, 위험도 자동 평가
- **커밋 메시지 제안**: 변경 내용 기반 자동 메시지 생성
- **위험도 평가**: 고위험 커밋에 대한 확인 요청

### 4. 마일스톤 자동 관리
- **프로젝트 분석**: 코드베이스 크기 및 복잡도 자동 평가
- **마일스톤 생성**: 프로젝트 단계별 자동 마일스톤 생성
- **GitHub CLI 통합**: 원클릭 마일스톤 생성

### 5. Git 히스토리 기반 이슈 변환
- **히스토리 분석**: 기존 커밋을 이슈로 변환
- **카테고리 분류**: 커밋 타입별 자동 분류
- **배치 생성**: 여러 이슈를 한 번에 생성

## 📁 파일 구조

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml          # 버그 리포트 템플릿
│   ├── feature_request.yml     # 기능 요청 템플릿
│   └── documentation.yml       # 문서화 요청 템플릿
│
scripts/
├── agents/
│   └── auto_issue_agent.py     # 자동 이슈 생성 Python 스크립트
├── smart-commit-confirm.js     # 스마트 커밋 확인 시스템
├── milestone-manager.js        # 마일스톤 자동 관리 시스템
└── generate-issues-from-history.js  # Git 히스토리 기반 이슈 생성

.git/hooks/
└── post-commit                 # 자동 이슈 생성 Git Hook
```

## 🛠️ 설치 및 설정

### 1. 기본 요구사항

```bash
# GitHub CLI 설치
brew install gh

# GitHub 인증
gh auth login

# Node.js 및 Python 환경 확인
node --version
python3 --version
```

### 2. 환경 변수 설정

`.env` 파일 생성 (선택사항):
```bash
# GitHub Personal Access Token (선택사항)
GITHUB_TOKEN=your_github_token_here
```

### 3. 권한 설정

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/*.js
chmod +x scripts/agents/*.py
chmod +x .git/hooks/post-commit
```

## 🚀 사용 방법

### 1. 자동 이슈 생성

커밋을 하면 자동으로 이슈가 생성됩니다:

```bash
git add .
git commit -m "feat: 새로운 사용자 인증 시스템 추가"
# → 자동으로 GitHub 이슈가 생성됩니다
```

### 2. 스마트 커밋 확인

커밋 전에 변경사항을 분석하고 안전하게 커밋:

```bash
# 변경사항을 스테이징한 후
git add .

# 스마트 커밋 시스템 실행
node scripts/smart-commit-confirm.js
```

### 3. 마일스톤 생성

프로젝트 마일스톤을 자동으로 생성:

```bash
# 마일스톤 분석 및 생성
node scripts/milestone-manager.js

# 생성된 스크립트 실행
./scripts/create-milestones.sh
```

### 4. 히스토리 기반 이슈 생성

기존 커밋을 이슈로 변환:

```bash
# Git 히스토리 분석 및 이슈 생성
node scripts/generate-issues-from-history.js

# 생성된 스크립트 실행
./scripts/create-issues.sh
```

## 🔧 커스터마이징

### 이슈 생성 규칙 수정

`scripts/agents/auto_issue_agent.py`에서 커밋 패턴과 라벨 규칙을 수정할 수 있습니다:

```python
self.commit_patterns = {
    'feat': ('기능 요청', 'enhancement'),
    'fix': ('버그 리포트', 'bug'),
    'docs': ('문서화 요청', 'documentation'),
    # 새로운 패턴 추가 가능
}
```

### 커밋 메시지 제안 규칙 수정

`scripts/smart-commit-confirm.js`에서 위험도 평가 기준과 메시지 제안 로직을 수정할 수 있습니다.

### 마일스톤 구조 수정

`scripts/milestone-manager.js`에서 기본 마일스톤 구조와 일정을 수정할 수 있습니다.

## 📊 시스템 모니터링

### 로그 확인

```bash
# Hook 실행 로그 확인
tail -f .git/hooks.log

# 스크립트 실행 상태 확인
ls -la scripts/*.sh scripts/*.md
```

### 이슈 생성 확인

```bash
# 최근 생성된 이슈 확인
gh issue list --limit 10
```

## 🔍 문제 해결

### 1. 이슈가 자동 생성되지 않는 경우

```bash
# Python 스크립트 직접 테스트
python3 scripts/agents/auto_issue_agent.py "test commit message"

# GitHub CLI 인증 확인
gh auth status

# Hook 로그 확인
cat .git/hooks.log
```

### 2. GitHub CLI 관련 문제

```bash
# GitHub CLI 재인증
gh auth logout
gh auth login

# 저장소 연결 확인
gh repo view
```

### 3. 권한 문제

```bash
# 모든 스크립트 권한 재설정
find scripts/ -name "*.js" -exec chmod +x {} \\;
find scripts/ -name "*.py" -exec chmod +x {} \\;
chmod +x .git/hooks/post-commit
```

## 📈 고급 기능

### 조건부 이슈 생성

특정 브랜치나 조건에서만 이슈를 생성하도록 Hook을 수정할 수 있습니다:

```bash
# 현재 브랜치 확인 추가
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "develop" ]; then
    # 이슈 생성 로직 실행
fi
```

### 팀 협업 기능

- **코드 리뷰 자동 요청**: PR 생성 시 자동으로 리뷰어 지정
- **이슈 자동 할당**: 커밋 작성자에게 이슈 자동 할당
- **라벨 기반 워크플로우**: 라벨에 따른 자동 프로세스 실행

## 📚 참고 자료

- [GitHub CLI 문서](https://cli.github.com/manual/)
- [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Git Hooks 가이드](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

*이 시스템은 개발 생산성 향상과 프로젝트 관리 효율성을 위해 설계되었습니다.*