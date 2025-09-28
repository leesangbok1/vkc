# 🚀 이슈 관리 시스템 사용 가이드

## ⚡ 빠른 시작 (5분 설정)

### 1. 첫 설정 (한 번만 실행)
```bash
# GitHub 토큰 설정 (.env 파일에 추가)
echo "GITHUB_TOKEN=your_token_here" >> .env

# 마일스톤 생성
bash scripts/create-milestones.sh

# 과거 작업을 이슈로 변환
bash scripts/create-issues.sh
```

### 2. 일상적인 사용법
```bash
# 코드 작성 후
git add .

# 스마트 커밋 (선택사항 - 변경사항 미리 확인)
node scripts/smart-commit-confirm.js

# 또는 바로 커밋 (자동으로 이슈 생성됨)
git commit -m "feat: 새로운 기능 구현"
```

## 🎯 주요 기능

### ✅ **자동 이슈 생성**
- 커밋할 때마다 자동으로 GitHub 이슈 생성
- 커밋 메시지 기반으로 이슈 타입 자동 분류
- 구조화된 이슈 템플릿 적용

### 📊 **스마트 커밋 확인**
```bash
node scripts/smart-commit-confirm.js
```
- 변경사항 자동 분석
- 리스크 평가 및 경고
- 커밋 메시지 자동 제안

### 🎯 **마일스톤 관리**
```bash
node scripts/milestone-manager.js
```
- 프로젝트 진행도 기반 마일스톤 자동 생성
- 우선순위 및 마감일 자동 설정

## 📝 이슈 템플릿

### 🐛 버그 리포트
- GitHub에서 "New Issue" → "Bug Report" 선택
- 구조화된 양식으로 버그 정보 입력

### ✨ 기능 요청
- GitHub에서 "New Issue" → "Feature Request" 선택
- 기능 설명, 동기, 완료 기준 등 체계적 입력

### 📚 문서 작업
- GitHub에서 "New Issue" → "Documentation" 선택
- 문서 작업 유형, 대상 파일, 언어 등 선택

## 🔄 커밋 메시지 규칙

### 자동 이슈 생성을 위한 커밋 메시지 형식:
```bash
# 기능 개발
git commit -m "feat: 로그인 시스템 구현"

# 버그 수정
git commit -m "fix: 로그인 오류 해결"

# 문서 작업
git commit -m "docs: API 문서 업데이트"

# 테스트 추가
git commit -m "test: 로그인 기능 테스트 추가"
```

## 🎯 마일스톤 시스템

현재 생성된 마일스톤:
- 🚀 **Phase 2: 핵심 기능 개발** (30일)
- ✨ **핵심 기능 구현** (21일)
- 🐛 **안정성 개선** (14일)
- 📚 **문서화 완성** (14일)
- 🧪 **테스트 커버리지 향상** (21일)

## ⚙️ 고급 설정

### 자동화 비활성화
```bash
# 자동 이슈 생성 끄기
echo "AUTO_ISSUE_CREATION=false" >> .env

# 스마트 커밋 확인 끄기
echo "SMART_COMMIT_CONFIRM=false" >> .env
```

### 템플릿 수정
- `.github/ISSUE_TEMPLATE/` 폴더의 `.yml` 파일 수정

## 🔗 주요 링크

- [상세 문서](docs/SMART_GIT_SYSTEM.md)
- [마일스톤 상태](docs/milestone-status.md)
- [GitHub 이슈](https://github.com/leesangbok1/vkc/issues)
- [GitHub 마일스톤](https://github.com/leesangbok1/vkc/milestones)

## 🆘 문제 해결

### GitHub Token 오류
```bash
# 토큰 권한 확인
gh auth status

# 토큰 재설정
gh auth login
```

### Python 오류
```bash
# Python 경로 확인
which python3

# 가상환경 활성화 (필요한 경우)
source venv/bin/activate
```

---

**🎉 이제 모든 커밋이 자동으로 이슈로 추적되어 프로젝트 관리가 한결 수월해집니다!**