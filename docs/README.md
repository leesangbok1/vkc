# 📚 Viet K-Connect 문서 가이드

**프로젝트 문서 구조와 활용법**

---

## 🎯 빠른 시작

### 새 개발자를 위한 필독 문서 (순서대로)
1. `MASTER_PROJECT_PLAN_2025.md` - 프로젝트 전체 로드맵
2. `SUPABASE_COMPLETE_GUIDE.md` - 개발 환경 설정
3. `project/PROJECT_STRUCTURE.md` - 프로젝트 구조 이해
4. `API.md` - API 명세 참고
5. `project/STATUS_2025-10-16.md` - 최신 상태 요약/다음 단계

---

## 🗂️ 문서 구조

### 📋 핵심 문서 (실행 중심)

#### 1. `MASTER_PROJECT_PLAN_2025.md` ⭐ **메인 로드맵**
- **목적**: 모든 분석과 계획을 통합한 최종 실행 로드맵
- **내용**: 3주 실행계획 + 4-tier 권한 시스템 + 현실적 목표
- **사용**: 개발 진행 시 기준 문서
- **업데이트**: 주요 변경사항 발생 시

#### 2. `REALISTIC_MVP_ROADMAP_2025.md` 📈 **현실적 목표**
- **목적**: 현실적 목표 재정의
- **특징**: 과대평가 문제점 지적 + 실행 가능한 범위 제시
- **작성일**: 2025-10-07

### 🔧 기술 문서

#### 3. `SUPABASE_COMPLETE_GUIDE.md` 🗄️ **필수 설정**
- **목적**: Supabase + OAuth 완전 설정 가이드
- **내용**: 프로젝트 생성부터 Google OAuth까지 통합
- **완료 시간**: 15-20분
- **작성일**: 2025-10-11

#### 4. `API.md` 📡
- **목적**: API 명세서 및 엔드포인트 정의
- **사용**: API 개발 및 프론트엔드 연동 시 참조

#### 5. `project/PROJECT_STRUCTURE.md` 📁
- **목적**: 프로젝트 디렉토리 구조 및 파일 명명 규칙
- **사용**: 새 파일 생성 시 참조

### 📊 프로젝트 관리

#### 6. `BETA_TEST_PLAN.md` 🧪
- **목적**: 베타 테스트 계획 및 체크리스트
- **사용**: 베타 출시 전 검증

#### 7. `PRODUCTION_DEPLOYMENT_CHECKLIST.md` 🚀
- **목적**: 프로덕션 배포 전 체크리스트
- **사용**: 배포 직전 최종 확인

### 📈 상태 및 평가

#### 8. `COLD_ASSESSMENT_2025-10-11.md` 🧊 **냉정한 평가**
- **목적**: 프로젝트 상태 객관적 평가
- **점수**: 72/100
- **평가일**: 2025-10-11

#### 9. `PROJECT_CLEANUP_2025-10-11.md` 📦 **정리 보고서**
- **목적**: 프로젝트 대청소 완료 보고
- **내용**: 81개 패키지 제거, 20개 파일 삭제, 문서 통합
- **작성일**: 2025-10-11

#### 10. `project/STATUS_2025-10-16.md` 📌 **최신 상태 요약**
- **목적**: 현재 완료/진행/대기/리스크 요약 및 우선순위 Next Steps
- **업데이트**: 2025-10-16

#### 11. `project/CLEANUP_CANDIDATES_2025-10-16.md` 🧹 **정리/분류 목록**
- **목적**: 안전한 아카이브/삭제 후보 리스트 및 근거 문서화
- **업데이트**: 2025-10-16

### 📚 기타 문서

#### 10. `UI_UX_COMPREHENSIVE_DESIGN_2025.md` 🎨
- UI/UX 종합 디자인 가이드

#### 11. `development/` 📂
- 개발 프로세스 및 구현 계획
- PARALLEL_CI_CD_MIGRATION_GUIDE.md
- VIET_K_CONNECT_IMPLEMENTATION_PLAN.md

---

## 📖 문서 활용법

### 🚀 프로젝트 시작 (첫 개발자)
1. `MASTER_PROJECT_PLAN_2025.md` - 전체 로드맵 이해
2. `SUPABASE_COMPLETE_GUIDE.md` - 개발 환경 설정 (15분)
3. `project/PROJECT_STRUCTURE.md` - 파일 구조 파악
4. `API.md` - API 명세 확인
5. 개발 시작!

### 🔧 기능 개발할 때
1. `MASTER_PROJECT_PLAN_2025.md` - 현재 주차 작업 확인
2. `API.md` - 해당 API 엔드포인트 확인
3. `project/PROJECT_STRUCTURE.md` - 파일 생성 위치 확인
4. 개발 → 테스트 → 문서 업데이트

### 🐛 문제 해결할 때
1. `COLD_ASSESSMENT_2025-10-11.md` - 알려진 문제 확인
2. `SUPABASE_COMPLETE_GUIDE.md` - 설정 문제 해결
3. `project/ISSUE_TRACKER.md` - 이슈 등록 및 추적

### 📊 상태 점검할 때
1. `COLD_ASSESSMENT_2025-10-11.md` - 현재 점수 확인 (72/100)
2. `PROJECT_CLEANUP_2025-10-11.md` - 최근 개선사항 확인
3. `MASTER_PROJECT_PLAN_2025.md` - 진행률 업데이트

---

## 📁 Archive

### `archive/` 폴더
- 과거 분석 문서 및 완료된 작업 문서 보관
- 개발 과정에서 생성된 임시 분석 자료
- 참고용으로 보관, 현재 계획과 다를 수 있음

**최근 이동 문서 (2025-10-11)**:
- `supabase-guides/` - 통합 전 개별 가이드 3개
- `SMART_GIT_SYSTEM.md` - Git 자동화 시스템 (미사용)
- `PROTOTYPE_TO_NEXTJS_*.md` - Next.js 통합 계획 (완료)

**기존 보관 문서**:
- `COMPREHENSIVE_DOCUMENT_ANALYSIS.md`
- `MVP_REDESIGN_ANALYSIS.md`
- `FILE_STRUCTURE_ANALYSIS.md`
- `VIET_K_CONNECT_UI_IMPROVEMENT_PLAN.md`
- `assessments/` - 전문가 평가 보고서
- `old-plans/` - 구버전 실행 계획
- `ui-ux/` - 과거 UI/UX 개선 계획

---

## 🎯 우선순위 가이드

### 📈 High Priority (매일 참조)
- `MASTER_PROJECT_PLAN_2025.md` - 메인 로드맵
- `SUPABASE_COMPLETE_GUIDE.md` - 설정 가이드
- `API.md` - API 명세서

### 📊 Medium Priority (주간 참조)
- `REALISTIC_MVP_ROADMAP_2025.md` - 현실적 목표
- `COLD_ASSESSMENT_2025-10-11.md` - 상태 평가
- `project/PROJECT_STRUCTURE.md` - 프로젝트 구조

### 📚 Low Priority (필요시 참조)
- UI/UX 디자인 문서
- 배포 체크리스트
- Archive 폴더

---

## 📝 문서 업데이트 규칙

### 업데이트 시점
1. **MASTER_PROJECT_PLAN_2025.md**: 주요 변경사항 발생 시
2. **API.md**: 새 엔드포인트 추가 또는 수정 시
3. **평가 문서**: 월 1회 정기 평가
4. **기술 가이드**: 설정 방법 변경 시

### Archive 이동 기준
- 완료된 작업의 계획 문서
- 대체된 구버전 문서
- 더 이상 사용하지 않는 시스템 가이드
- 중복 제거된 문서

### 문서 작성 원칙
- **간결성**: 핵심만 담기
- **통합성**: 중복보다 하나의 완전한 문서
- **최신성**: 정기적 업데이트
- **접근성**: 찾기 쉬운 구조

---

## 🔄 정기 점검

### 주간 점검
- [ ] 진행 상황 MASTER_PROJECT_PLAN에 반영
- [ ] 새로운 이슈 ISSUE_TRACKER에 등록
- [ ] API 변경사항 API.md 업데이트

### 월간 점검
- [ ] 프로젝트 상태 평가 (COLD_ASSESSMENT 업데이트)
- [ ] 사용하지 않는 문서 archive 이동
- [ ] 문서 구조 최적화

---

## 📞 문서 관련 문의

### 문서가 없거나 오래된 경우
1. docs/README.md (이 문서) 확인
2. archive/ 폴더에서 검색
3. Git 히스토리에서 변경 내역 확인

### 새 문서 추가 시
1. 문서 목적 명확히 정의
2. 적절한 위치 선택 (루트 vs 하위 폴더)
3. docs/README.md에 링크 추가

---

*📅 최종 업데이트: 2025-10-11*
*🎯 목적: 일관성 있는 문서 관리 및 효율적 활용*
*📊 현재 상태: 정리 완료, 통합 문서 우선*
