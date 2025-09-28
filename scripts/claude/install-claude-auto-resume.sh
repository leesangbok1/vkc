#!/bin/bash
# Claude Code 자동 재개 시스템 설치 스크립트

set -e

echo "🤖 Claude Code 자동 재개 시스템 설치를 시작합니다..."

# 현재 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.local/bin"
CLAUDE_AUTO_RESUME_SCRIPT="$SCRIPT_DIR/claude-auto-resume.py"

# 설치 디렉토리 생성
mkdir -p "$INSTALL_DIR"

# 스크립트 복사
echo "📁 설치 디렉토리: $INSTALL_DIR"
cp "$CLAUDE_AUTO_RESUME_SCRIPT" "$INSTALL_DIR/claude-auto-resume"
chmod +x "$INSTALL_DIR/claude-auto-resume"

# PATH에 추가 (필요한 경우)
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "🔧 PATH에 $INSTALL_DIR 추가 중..."

    # 사용자의 shell 확인
    SHELL_NAME=$(basename "$SHELL")

    case "$SHELL_NAME" in
        bash)
            RC_FILE="$HOME/.bashrc"
            if [[ ! -f "$RC_FILE" ]]; then
                RC_FILE="$HOME/.bash_profile"
            fi
            ;;
        zsh)
            RC_FILE="$HOME/.zshrc"
            ;;
        fish)
            RC_FILE="$HOME/.config/fish/config.fish"
            mkdir -p "$(dirname "$RC_FILE")"
            ;;
        *)
            RC_FILE="$HOME/.profile"
            ;;
    esac

    if [[ "$SHELL_NAME" == "fish" ]]; then
        echo "set -gx PATH $INSTALL_DIR \$PATH" >> "$RC_FILE"
    else
        echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$RC_FILE"
    fi

    echo "✅ $RC_FILE에 PATH 추가 완료"
    echo "💡 새 터미널을 열거나 'source $RC_FILE'를 실행하세요"
fi

# 별칭 생성
echo "🔗 유용한 별칭 생성 중..."

ALIAS_COMMANDS="
# Claude Code 자동 재개 시스템 별칭
alias claude-auto='claude-auto-resume'
alias claude-resume='claude-auto-resume --resume'
alias claude-status='claude-auto-resume --status'
alias claude-clean='claude-auto-resume --clean'
"

case "$SHELL_NAME" in
    fish)
        ALIAS_FILE="$HOME/.config/fish/conf.d/claude-auto-resume.fish"
        mkdir -p "$(dirname "$ALIAS_FILE")"
        cat > "$ALIAS_FILE" << 'EOF'
# Claude Code 자동 재개 시스템 별칭
alias claude-auto='claude-auto-resume'
alias claude-resume='claude-auto-resume --resume'
alias claude-status='claude-auto-resume --status'
alias claude-clean='claude-auto-resume --clean'
EOF
        ;;
    *)
        echo "$ALIAS_COMMANDS" >> "$RC_FILE"
        ;;
esac

# 테스트
echo "🧪 설치 테스트 중..."
if command -v python3 >/dev/null 2>&1; then
    python3 "$INSTALL_DIR/claude-auto-resume" --status >/dev/null 2>&1 && echo "✅ Python 스크립트 실행 가능" || echo "⚠️ Python 스크립트 실행 시 오류 발생"
else
    echo "❌ Python3가 설치되지 않았습니다. Python3를 먼저 설치해주세요."
    exit 1
fi

# 완료 메시지
echo ""
echo "🎉 Claude Code 자동 재개 시스템 설치 완료!"
echo ""
echo "📖 사용법:"
echo "  claude-auto-resume          # Claude 시작 및 자동 모니터링"
echo "  claude-auto-resume --resume # 중단된 세션 재개"
echo "  claude-auto-resume --status # 현재 상태 확인"
echo "  claude-auto-resume --clean  # 저장된 데이터 정리"
echo ""
echo "🔧 별칭:"
echo "  claude-auto     # claude-auto-resume와 동일"
echo "  claude-resume   # 세션 재개"
echo "  claude-status   # 상태 확인"
echo "  claude-clean    # 데이터 정리"
echo ""
echo "💡 사용 예시:"
echo "  claude-auto-resume  # 이제 이것으로 Claude를 시작하세요!"
echo ""
echo "⚠️  주의사항:"
echo "  - 새 터미널을 열거나 'source $RC_FILE'를 실행하세요"
echo "  - Claude 사용 중 Ctrl+C로 종료하면 5시간 후 자동 재개됩니다"
echo "  - 컴퓨터를 끄지 마세요 (절전 모드는 괜찮습니다)"
echo ""