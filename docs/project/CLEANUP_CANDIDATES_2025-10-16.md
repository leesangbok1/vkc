# 🧹 정리/분류 작업 목록 (2025-10-16)

> 원칙: 즉시 삭제 대신 아카이브/보류로 안전하게 관리합니다. 실제 사용 여부 확인 후 단계적 삭제를 권장합니다.

## ✅ 이번에 처리한 항목
- Move: `scripts/testing/test-supabase-connection.js` → `scripts/legacy/testing/test-supabase-connection.js`
  - 사유: TypeScript 개선판(`scripts/test-supabase-connection.ts`) 존재. 패키지 스크립트 미참조.

## 📌 아카이브/보류 후보

### 1) 빌드 아티팩트(과거 커밋됨)
- 경로: `.next/**`
- 상태: `.gitignore`에 포함되어 있으나 저장소 이력에 남아 있음
- 제안: `git rm --cached -r .next` 후 커밋(별도 승인/세션에서 진행)

### 2) PWA 관련 구자산(이미 별도 보관)
- 경로: `archived-assets/pwa/**`
- 상태: 보관 목적 유지(실사용 없음)
- 제안: 유지(문서에 “보관” 명시)

### 3) 알림 서비스 구현 파일 이중화
- 경로: `lib/services/notification-service.ts`(클라이언트 구독)
- 경로: `lib/services/notification.service.ts`(서버 발송)
- 상태: 역할이 달라 중복 아님 → 유지
- 제안: README 주석/문서에 역할 차이 명시

### 4) 테스트/도구 스크립트 중복
- 후보: `scripts/testing/` 내 JS 도구들이 TS 대체 스크립트와 중복되는지 점검
- 제안: TS로 일원화, JS 파일은 `scripts/legacy/` 이동(점진 적용)

### 5) 마이그레이션 통합본
- 경로: `supabase/migrations/combined_migration.sql`
- 상태: 분할 마이그레이션과 병행 관리
- 제안: 유지(운영 프로세스 확정 후 통합본/분할본 중 하나로 정리)

## 🔎 검토 메모
- 패키지 스크립트/런타임에서 참조되는 파일은 이동/삭제 금지.
- 문서/가이드에서 언급만 되고 코드에서 미참조인 파일은 아카이브 대상 우선 검토.

---

마지막 업데이트: 2025-10-16

