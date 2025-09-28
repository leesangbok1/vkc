# 📱 iPhone → Mac VSCode Claude MCP Server

iMessage를 통해 iPhone에서 Mac의 VSCode Claude를 원격 제어할 수 있는 MCP(Model Context Protocol) 서버입니다.

## ✨ 주요 기능

- 📱 **iMessage 통합**: iPhone에서 간단한 메시지로 명령 실행
- 🔐 **JWT 인증**: 보안 토큰 기반 인증 시스템
- 🛠️ **다양한 명령**: Git, npm, 빌드, 테스트, Claude 연동
- ⚡ **실시간 피드백**: 명령 실행 결과를 즉시 iPhone으로 전송
- 🎯 **VSCode 통합**: Claude Code와 완벽 연동

## 🚀 빠른 시작

### 1. 자동 설치

```bash
cd /Users/bk/Desktop/poi-main/server/mcp-server
./scripts/setup.sh
```

### 2. 수동 설치

```bash
# 의존성 설치
npm install

# 환경 설정
cp .env.example .env
# .env 파일에서 PHONE_NUMBER와 JWT_SECRET 설정

# 빌드
npm run build

# Claude Desktop 설정
# ~/Library/Application Support/Claude/claude_desktop_config.json 파일 설정
```

### 3. 서버 시작

```bash
npm start
```

## 📱 iPhone 사용법

### 초기 등록
```
register:+1234567890
```

### 인증된 명령 실행
```
token:YOUR_JWT_TOKEN cmd:status
```

### 지원 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `status` | 프로젝트 상태 확인 | `cmd: status` |
| `git` | Git 명령 실행 | `cmd: git status` |
| `npm` | npm 명령 실행 | `cmd: npm test` |
| `build` | 프로젝트 빌드 | `cmd: build` |
| `test` | 테스트 실행 | `cmd: test` |
| `claude` | Claude에게 지시 | `cmd: claude 리팩토링해줘` |

## 🏗️ 아키텍처

```
iPhone (iMessage)
    ↓
Mac Messages App (AppleScript)
    ↓
MCP Server (Node.js/TypeScript)
    ↓
VSCode Claude (MCP Protocol)
```

## 📁 프로젝트 구조

```
server/mcp-server/
├── src/
│   ├── index.ts          # 메인 엔트리 포인트
│   ├── mcp-server.ts     # MCP 서버 구현
│   ├── imessage.ts       # iMessage 통합
│   ├── commands.ts       # 명령어 처리
│   ├── auth.ts           # JWT 인증
│   ├── config.ts         # 설정 관리
│   ├── logger.ts         # 로깅 시스템
│   └── types.ts          # TypeScript 타입
├── scripts/
│   ├── setup.sh          # 자동 설치 스크립트
│   └── test.sh           # 테스트 스크립트
├── dist/                 # 빌드 결과
├── logs/                 # 로그 파일
└── claude_desktop_config.json
```

## ⚙️ 설정

### 환경 변수 (.env)

```bash
# 서버 설정
PORT=8991
JWT_SECRET=your-super-secure-jwt-secret

# iPhone 설정
PHONE_NUMBER=+1234567890

# iMessage 설정
IMESSAGE_POLL_INTERVAL=2000
MAX_MESSAGE_AGE=300000

# 보안 설정
ALLOWED_COMMANDS=git,npm,node,test,build,claude
COMMAND_TIMEOUT=30000

# 로깅 설정
LOG_LEVEL=info
LOG_FILE=./logs/mcp-server.log

# 프로젝트 설정
PROJECT_ROOT=/Users/bk/Desktop/poi-main
```

### Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "imessage-commander": {
      "command": "node",
      "args": ["/Users/bk/Desktop/poi-main/server/mcp-server/dist/index.js"],
      "env": {
        "PORT": "8991",
        "JWT_SECRET": "your-jwt-secret",
        "PHONE_NUMBER": "+1234567890",
        "PROJECT_ROOT": "/Users/bk/Desktop/poi-main"
      }
    }
  }
}
```

## 🔒 보안 기능

- **JWT 토큰 인증**: 24시간 유효한 토큰 기반 인증
- **전화번호 화이트리스트**: 설정된 번호만 접근 허용
- **명령어 화이트리스트**: 허용된 명령어만 실행 가능
- **타임아웃 제한**: 명령 실행 시간 제한
- **로그 감시**: 모든 활동 로깅

## 🧪 테스트

```bash
# 전체 테스트 실행
./scripts/test.sh

# 개별 테스트
npm test

# 빌드 테스트
npm run build
```

## 📋 사용 시나리오

### 외출 중 긴급 수정
```
iPhone: "token:abc123 cmd: git pull"
iPhone: "token:abc123 cmd: claude 로그인 버그 수정해줘"
iPhone: "token:abc123 cmd: test"
iPhone: "token:abc123 cmd: git commit -m 'fix: login bug'"
iPhone: "token:abc123 cmd: git push"
```

### 빌드 상태 확인
```
iPhone: "token:abc123 cmd: status"
iPhone: "token:abc123 cmd: build"
```

### Claude와 상호작용
```
iPhone: "token:abc123 cmd: claude API 엔드포인트 추가해줘"
iPhone: "token:abc123 cmd: claude 테스트 케이스 작성해줘"
```

## 🐛 문제 해결

### "Messages를 찾을 수 없음"
- iPhone 번호가 올바른지 확인
- Messages 앱에서 해당 대화가 존재하는지 확인

### "AppleScript 권한 오류"
```bash
# 권한 테스트
osascript -e 'tell application "Messages" to get chats'
```
시스템 환경설정 → 보안 및 개인정보 → 개인정보 → 자동화에서 권한 허용

### 로그 확인
```bash
# 서버 로그
tail -f logs/mcp-server.log

# 실시간 디버깅
npm run dev
```

## 🔄 업데이트

```bash
# 의존성 업데이트
npm update

# 재빌드
npm run build

# Claude Desktop 재시작 필요
```

## 📚 API 참조

### MCP 도구

- `send_imessage`: iMessage 전송
- `execute_command`: 명령 실행
- `get_project_status`: 프로젝트 상태 조회
- `authenticate_phone`: 전화번호 인증
- `register_phone`: 전화번호 등록

### 명령 형식

```typescript
interface Command {
  id: string;
  type: CommandType;
  payload: string;
  timestamp: number;
  sender: string;
  status: CommandStatus;
}
```

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## ⚠️ 주의사항

1. **보안**: 민감한 명령은 실행하지 마세요
2. **네트워크**: Mac과 iPhone이 같은 iCloud 계정으로 로그인되어 있어야 합니다
3. **권한**: AppleScript 권한 허용이 필요합니다
4. **백업**: 중요한 작업 전에는 항상 백업하세요