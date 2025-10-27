# Archived E2E Tests

## 📁 이 폴더는?

기존 E2E 테스트를 보관하는 디렉토리입니다.

### 보관 이유
- 토큰 효율성 최적화 (기존 E2E는 토큰 소비가 많음)
- Critical User Journey 중심으로 재구성
- 필요시 참조용으로 보관

### 파일 목록
- `home.spec.ts` - 홈 페이지 E2E 테스트 (기존)
- `questions.spec.ts` - 질문 페이지 E2E 테스트 (기존)

### 사용 방법

필요시 개별 실행 가능:
```bash
npm run test:e2e -- tests/e2e/archived/home.spec.ts
npm run test:e2e -- tests/e2e/archived/questions.spec.ts
```

### 참고
- 새로운 E2E 테스트는 `tests/e2e/critical/` 에 작성
- Critical Path만 유지하여 토큰 효율성 극대화
