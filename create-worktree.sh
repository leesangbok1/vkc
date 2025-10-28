#!/bin/zsh

# 사용법: ./create-worktree.sh <issue-number>
if [ -z "$1" ]; then
  echo "Usage: $0 <issue-number>"
  exit 1
fi

ISSUE_NUM="$1"
WORKTREE_DIR="issue-$ISSUE_NUM"

# 워크트리 생성 (브랜치명: issue/<이슈번호>)
git worktree add "$WORKTREE_DIR" -b "issue/$ISSUE_NUM"

# 워크트리 폴더로 이동
cd "$WORKTREE_DIR" || exit 1

# 커스텀 커맨드 실행 (실제 환경에 맞게 수정)
echo "/resolve-issue $ISSUE_NUM"
# 실제로는 아래처럼 실행할 수도 있음
# /resolve-issue $ISSUE_NUM

echo "Worktree for issue $ISSUE_NUM created and command executed."
