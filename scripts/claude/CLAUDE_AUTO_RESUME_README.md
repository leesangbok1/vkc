# 🤖 Claude Code 자동 재개 시스템

Claude Code 사용량 한도에 도달했을 때 **완전 자동으로** 5시간 후 작업을 재개하는 시스템입니다.

## ✨ 주요 기능

### 🎯 완전 자동화
- **버튼 클릭 없음**: 토큰 부족 시 자동 감지 및 저장
- **5시간 타이머**: macOS 시스템 스케줄러 활용한 정확한 재개
- **작업 복원**: 중단된 명령어와 작업 디렉토리 자동 복원
- **백그라운드 실행**: 컴퓨터만 켜두면 자동으로 작동

### 📊 지능적 모니터링
- Claude Code 프로세스 실시간 감지
- 작업 컨텍스트 자동 저장
- 토큰 부족 vs 일반 종료 구분
- 세션 상태 영구 보존

---

## 🚀 설치 및 설정

### 1. 자동 설치
```bash
./install-claude-auto-resume.sh
```

### 2. 수동 설치
```bash
# 스크립트 복사
cp claude-auto-resume.py ~/.local/bin/claude-auto-resume
chmod +x ~/.local/bin/claude-auto-resume

# PATH 추가 (zsh 사용자)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 📖 사용법

### 기본 사용법

#### **기존 방식 (문제):**
```bash
claude  # 토큰 부족 시 수동으로 다시 시작해야 함
```

#### **새로운 방식 (해결):**
```bash
claude-auto-resume  # 토큰 부족 시 5시간 후 자동 재개!
```

### 명령어 옵션

```bash
# 1. Claude 시작 및 자동 모니터링
claude-auto-resume

# 2. 중단된 세션 수동 재개
claude-auto-resume --resume

# 3. 현재 상태 확인
claude-auto-resume --status

# 4. 저장된 데이터 정리
claude-auto-resume --clean

# 5. 프로세스 모니터링만 (고급)
claude-auto-resume --monitor
```

### 편리한 별칭
```bash
claude-auto     # = claude-auto-resume
claude-resume   # = claude-auto-resume --resume
claude-status   # = claude-auto-resume --status
claude-clean    # = claude-auto-resume --clean
```

---

## 🎬 실제 사용 시나리오

### **시나리오 1: 코딩 작업 중단**
```bash
$ claude-auto-resume
🎯 Claude Code 대화형 모드 시작
💡 Ctrl+C로 종료하면 5시간 후 자동으로 재개됩니다

User: React 컴포넌트 만들어줘
Claude: 어떤 컴포넌트를 만들까요?
User: 로그인 폼 컴포넌트
Claude: [토큰 부족으로 중단] 🚨

🚨 Claude 프로세스 중단 감지 (Signal: 15)
💾 세션 저장 완료. 5시간 후 자동 재개됩니다.
⏰ 재개 예정 시간: 2024-09-22 02:45:00
✅ 시스템 스케줄러에 재개 작업 등록 완료

# [5시간 후 자동으로...]
🔄 중단된 세션 발견
⏰ 재개 시간 도달 - 세션 복원 시작
🚀 Claude Code 재시작 중...
📝 마지막 명령어 복원: 로그인 폼 컴포넌트
✅ Claude 재시작 성공

Claude: 죄송합니다! 로그인 폼 컴포넌트를 만들어드리겠습니다...
```

### **시나리오 2: 긴 대화 중 중단**
```bash
$ claude-auto-resume
User: 이 코드 버그 있어? [긴 코드 첨부]
Claude: 네, 몇 가지 문제가 있네요...
User: 그럼 수정해줘
Claude: [토큰 부족] 🚨

# 자동 저장 및 5시간 후 재개
# 전체 대화 맥락과 "수정해줘" 요청이 그대로 복원됨
```

---

## 🔧 고급 기능

### 상태 확인
```bash
$ claude-status
📊 현재 세션 상태:
{
  "working_directory": "/Users/bk/Desktop/poi-main",
  "last_command": "React 로그인 컴포넌트 만들어줘",
  "start_time": "2024-09-21T19:45:12",
  "status": "interrupted",
  "interrupted_at": "2024-09-21T20:15:30",
  "resume_scheduled": "2024-09-22T01:15:30"
}
```

### 수동 재개
```bash
$ claude-resume
🔄 중단된 세션 발견
⏰ 재개 시간 도달 - 세션 복원 시작
🚀 Claude Code 재시작 중...
```

### 데이터 정리
```bash
$ claude-clean
🗑️ 저장된 세션 데이터 정리 완료
```

---

## 📁 시스템 구조

### 저장 위치
```
~/.claude-auto-resume/
├── session.json        # 현재 세션 정보 (JSON)
├── state.pickle        # 세션 백업 (Binary)
└── auto-resume.log     # 시스템 로그
```

### 스케줄링 방식
- **1차**: `at` 명령어 (Unix 표준)
- **2차**: macOS LaunchAgent (at 실패 시)
- **백업**: cron 작업 (시스템별)

---

## 🛠️ 문제 해결

### Q: 재개가 안 됩니다
```bash
# 1. 상태 확인
claude-status

# 2. 로그 확인
tail -f ~/.claude-auto-resume/auto-resume.log

# 3. 시스템 작업 확인 (macOS)
launchctl list | grep claude
atq  # 예약된 at 작업 확인
```

### Q: 스크립트가 실행 안 됩니다
```bash
# 권한 확인
ls -la ~/.local/bin/claude-auto-resume

# PATH 확인
echo $PATH

# Python 확인
python3 --version
```

### Q: 토큰 부족을 감지 못 합니다
```bash
# 디버그 모드로 실행
python3 ~/.local/bin/claude-auto-resume --monitor
```

---

## ⚡ 성능 최적화

### 시스템 요구사항
- **macOS/Linux** (Windows는 부분 지원)
- **Python 3.6+**
- **최소 10MB 디스크 공간**
- **백그라운드 프로세스 실행 권한**

### 메모리 사용량
- **Python 스크립트**: ~5MB
- **세션 데이터**: ~1KB
- **로그 파일**: ~100KB (1주일 기준)

---

## 🔐 보안 고려사항

### 데이터 보호
- 세션 데이터는 로컬에만 저장
- 명령어 히스토리는 암호화되지 않음
- 민감한 정보 입력 시 주의 필요

### 권한 관리
- 스크립트는 사용자 권한으로만 실행
- 시스템 스케줄러 접근 필요
- 네트워크 접근 없음

---

## 🚨 주의사항

### ✅ 할 것
- 컴퓨터를 켜두기 (절전 모드 OK)
- 중요한 작업 전 백업하기
- 정기적으로 로그 확인하기

### ❌ 하지 말 것
- 컴퓨터 완전 종료
- 세션 데이터 수동 편집
- 여러 Claude 세션 동시 실행

---

## 📈 향후 개선 계획

- [ ] Windows 완전 지원
- [ ] GUI 관리 도구
- [ ] 클라우드 백업
- [ ] 다중 세션 지원
- [ ] 웹 대시보드

---

## 🤝 기여하기

버그 리포트나 기능 제안은 GitHub Issues에 등록해주세요.

**Made with ❤️ for Claude Code Users**