# 파일 자동 정리 시스템

viet-kconnect 프로젝트의 파일 자동 정리 시스템 가이드입니다.

## 🎯 목적

새로 추가되는 모든 파일이 각자 유형에 맞게 정리된 폴더에 자동으로 배치되도록 하여 프로젝트 구조를 일관성 있게 유지합니다.

## 📁 디렉토리 구조

```
viet-kconnect/
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── auth/            # 인증 관련 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── common/          # 공통 컴포넌트
│   │   ├── questions/       # 질문 관련 컴포넌트
│   │   ├── filters/         # 필터 컴포넌트
│   │   ├── widgets/         # 위젯 컴포넌트
│   │   └── ...
│   ├── pages/               # 페이지 컴포넌트
│   ├── services/            # 서비스 및 API
│   ├── utils/               # 유틸리티 함수
│   ├── hooks/               # React hooks
│   ├── config/              # 설정 파일
│   ├── styles/              # 스타일 파일
│   └── assets/              # 정적 자원
├── docs/                    # 문서
├── scripts/                 # 스크립트
└── config/                  # 프로젝트 설정
```

## 🔧 설정 파일

### `config/file-organization.json`

파일 자동 정리 규칙을 정의하는 설정 파일입니다.

```json
{
  "rules": {
    "components": {
      "patterns": ["*.jsx"],
      "destinations": {
        "auth": ["Login", "Auth", "SignIn"],
        "layout": ["Header", "Footer", "Nav"],
        "common": ["Button", "Modal", "Loading"]
      },
      "basePath": "src/components"
    }
  }
}
```

## 🛠️ 사용법

### NPM 스크립트

```bash
# 프로젝트 전체 파일 정리
npm run organize

# 실시간 파일 감시 및 자동 정리
npm run organize:watch

# 프로젝트 구조 검증
npm run organize:validate

# 디렉토리 구조만 검증
npm run organize:dirs

# 파일 위치만 검증
npm run organize:files

# 자동 수정 명령어 생성
npm run organize:fix
```

### 직접 실행

```bash
# 파일 정리
node scripts/file-organizer.js scan

# 파일 감시 시작
node scripts/file-organizer.js watch

# 구조 검증
node scripts/structure-validator.js full
```

## 🤖 자동화 기능

### 1. 파일 감시 (Watch Mode)

```bash
npm run organize:watch
```

- 새로 생성되는 파일을 실시간으로 감시
- 규칙에 따라 자동으로 적절한 폴더로 이동
- 로그 파일에 모든 변경사항 기록

### 2. Git Hooks

커밋 전에 자동으로 프로젝트 구조를 검증합니다.

```bash
# Git hooks 설정 (자동으로 실행됨)
npm run prepare
```

### 3. VSCode 통합

`.vscode/settings.json`에서 자동으로:
- Import 경로 자동 완성
- 파일 저장 시 자동 포맷팅
- 파일 네스팅 설정

## 📋 파일 분류 규칙

### React 컴포넌트 (.jsx)

| 파일명 패턴 | 대상 폴더 | 예시 |
|------------|----------|------|
| `*Login*`, `*Auth*` | `src/components/auth/` | `LoginModal.jsx` |
| `*Header*`, `*Footer*` | `src/components/layout/` | `Header.jsx` |
| `*Button*`, `*Modal*` | `src/components/common/` | `LoadingSpinner.jsx` |
| `*Question*`, `*Answer*` | `src/components/questions/` | `QuestionForm.jsx` |

### 페이지 컴포넌트

| 패턴 | 대상 폴더 |
|------|----------|
| `*Page.jsx`, `*View.jsx` | `src/pages/` |

### 서비스 파일

| 패턴 | 대상 폴더 |
|------|----------|
| `*Service.js`, `*API.js`, `*api.js` | `src/services/` |

### 유틸리티

| 패턴 | 대상 폴더 |
|------|----------|
| `*Utils.js`, `*Helper.js`, `*util.js` | `src/utils/` |

### React Hooks

| 패턴 | 대상 폴더 |
|------|----------|
| `use*.js`, `use*.jsx` | `src/hooks/` |

## 🔍 검증 기능

### 구조 검증

```bash
npm run organize:validate
```

다음 항목들을 검증합니다:
- ✅ 필수 디렉토리 존재 여부
- ✅ 파일이 올바른 위치에 있는지
- ✅ Import 경로가 올바른지
- ✅ 필수 종속성 설치 여부

### 자동 수정

```bash
npm run organize:fix
```

문제가 발견되면 자동 수정 명령어를 제안합니다.

## 📝 로그

모든 파일 이동과 변경사항은 `logs/file-organization.log`에 기록됩니다.

```
[2024-01-15T10:30:00.000Z] ✅ 파일 이동 완료: NewComponent.jsx → src/components/common/NewComponent.jsx
[2024-01-15T10:30:01.000Z] 🔄 Import 경로 업데이트 필요: src/components/common/NewComponent.jsx
```

## ⚙️ 설정 옵션

### `config/file-organization.json` 주요 옵션

```json
{
  "autoMove": {
    "enabled": true,        // 자동 이동 활성화
    "dryRun": false,       // 드라이 런 모드
    "createFolders": true, // 폴더 자동 생성
    "logMoves": true       // 이동 로그 기록
  },
  "ignorePaths": [
    "node_modules",
    ".git",
    "dist"
  ]
}
```

## 🚫 무시되는 경로

다음 경로들은 자동 정리에서 제외됩니다:
- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `.next/`, `.nuxt/`
- `coverage/`

## 🔧 커스터마이징

### 새로운 파일 유형 추가

`config/file-organization.json`에 새로운 규칙을 추가:

```json
{
  "rules": {
    "custom": {
      "patterns": ["*.custom.js"],
      "basePath": "src/custom",
      "destinations": {
        "type1": ["Pattern1", "Pattern2"],
        "type2": ["Pattern3", "Pattern4"]
      }
    }
  }
}
```

### VSCode 설정 커스터마이징

`.vscode/settings.json`에서 path alias 및 기타 설정을 조정할 수 있습니다.

## 🐛 문제 해결

### 자주 발생하는 문제

1. **파일이 이동되지 않는 경우**
   ```bash
   # 설정 파일 확인
   cat config/file-organization.json

   # 수동 실행
   npm run organize
   ```

2. **Import 경로 오류**
   ```bash
   # Import 경로 검증
   npm run organize:validate
   ```

3. **권한 오류**
   ```bash
   # 스크립트 실행 권한 확인
   chmod +x scripts/*.js
   chmod +x .githooks/*
   ```

## 📈 성능 최적화

- 대용량 프로젝트의 경우 `ignorePaths`에 불필요한 경로를 추가
- Watch 모드는 개발 중에만 사용 권장
- Dry run 모드로 먼저 테스트 후 실제 적용

## 🤝 기여하기

새로운 파일 유형이나 규칙을 추가하고 싶다면:

1. `config/file-organization.json`에 규칙 추가
2. `scripts/file-organizer.js`에 로직 구현
3. 테스트 후 문서 업데이트

---

이 시스템을 통해 프로젝트 구조를 일관성 있게 유지하고, 개발 효율성을 높일 수 있습니다.