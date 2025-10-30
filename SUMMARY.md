# 작업 요약 (2025-10-24)

이번 작업은 Supabase 타입 구조를 정리하고 TypeScript 검사 실패 요인을 줄이는 데 초점을 맞췄다. 주요 변경 사항은 다음과 같다.

## 주요 변경

- `lib/server/supabase-clients.ts`를 도입해 서버/서비스 클라이언트를 공통 래퍼로 관리하도록 설계했다.
- 일부 관리자 라우트에서 새 헬퍼를 사용하도록 수정하여 Supabase 호출의 중복을 줄였다.
- `lib/supabase-browser.ts`의 쿠키 래퍼를 제거하고 기본 동작에 맞춰 간소화했다.
- `scripts/backfill-nicknames.ts`에서 존재하지 않는 필드를 제거하여 스키마와 불일치를 수정했다.
- `lib/utils/expert-matching.ts`를 최신 스키마에 맞춰 일부 개선했지만, 전체 정리는 미완료 상태다.
- 진행 현황과 차단 요소(`tsc` 오류)를 `claudedocs/PROGRESS.md`에 기록했다.

## 남은 문제

- `npm run type-check`는 여전히 실패한다. 주요 원인은 다음과 같다.
  - `lib/utils/supabase-user.ts`의 `upsert/update` 호출에서 제너릭이 `never`로 추론되는 문제
  - `lib/services/questions.service.ts`와 `lib/utils/expert-matching.ts`의 DTO가 실제 스키마와 맞지 않는 구조
  - 일부 스크립트(`scripts/backfill-nicknames.ts`)의 Supabase 업데이트 호출 타입 미스매치
- Supabase DTO/쿼리 구조를 전면 재조정하지 않으면 위 오류가 해소되지 않는다.

## 권장 후속 작업

1. Supabase 호출을 감싸는 도메인별 래퍼와 DTO를 정리하고, 각 라우트/유틸이 해당 래퍼를 사용하도록 리팩터링한다.
2. 최신 스키마를 기준으로 `QuestionWithRelations`, `CertifiedUser` 등 공통 타입을 재정의해 모듈 간 통일성을 확보한다.
3. 스크립트·유틸에 대한 타입 예외(`tsconfig` exclude 또는 `@ts-expect-error`)를 최소화하거나 DTO를 보강해 `tsc`를 통과하도록 한다.

