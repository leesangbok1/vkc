# 🚀 Viet K-Connect MVP 완성 실행 계획

*📅 작성일: 2025-10-07 | 체계적 실행을 위한 단계별 가이드*

---

## 📊 현재 상황 분석

### ✅ 완료된 작업 (67%)
- **기술 스택**: Next.js 14 + TypeScript + Supabase + Tailwind CSS
- **UI 컴포넌트**: 35개 기본 컴포넌트 완성
- **데이터베이스 타입**: 4계층 권한 시스템 포함 완전한 타입 정의
- **프로젝트 구조**: 체계적인 폴더 구조 완성

### 🔴 긴급 해결 필요 (33%)
- **Mock 데이터 의존성**: 9개 파일에서 실제 DB 연결 필요
- **Google OAuth**: 설정은 되어있으나 실제 구현 미완성
- **API 엔드포인트**: Mock 모드에서 실제 DB 연결로 전환 필요

---

## 🎯 실행 우선순위

### **Phase 1: 기반 시스템 전환 (1-3일차)**

#### **Day 1: Mock 데이터 완전 제거**
```yaml
작업_순서:
  1. Mock 감지 로직 제거
    - lib/supabase.ts의 isMockMode 체크 로직 수정
    - NEXT_PUBLIC_MOCK_MODE 환경변수 제거

  2. Mock 데이터 파일 처리
    - lib/mock-data.ts → 개발용 시드 데이터로 전환
    - app/api/*/route.ts의 Mock 데이터 로직 제거

  3. 실제 DB 스키마 확인
    - Supabase 프로젝트 테이블 생성 상태 점검
    - 마이그레이션 SQL 실행 (필요시)

우선순위: 🔴 CRITICAL
담당자: Backend Architect + System Architect
예상시간: 4-6시간
```

#### **Day 2: Supabase 실제 연결 구현**
```yaml
작업_순서:
  1. 환경변수 검증
    - .env.local의 Supabase URL/KEY 확인
    - 연결 테스트 스크립트 실행

  2. 서버 클라이언트 수정
    - createSupabaseServerClient 실제 연결 구현
    - 에러 처리 및 폴백 로직 구현

  3. 기본 CRUD 테스트
    - categories 테이블 조회 테스트
    - users 테이블 기본 작업 테스트

우선순위: 🔴 CRITICAL
담당자: Backend Architect + DevOps Architect
예상시간: 6-8시간
```

#### **Day 3: Google OAuth 통합**
```yaml
작업_순서:
  1. Google OAuth 설정 확인
    - Google Cloud Console 설정 검증
    - Supabase Auth 설정 확인

  2. 인증 플로우 구현
    - 로그인/로그아웃 컴포넌트 실제 연결
    - 사용자 세션 관리 구현

  3. 권한 시스템 연결
    - 4계층 권한 시스템 실제 적용
    - 사용자 역할별 UI 분기 처리

우선순위: 🟡 HIGH
담당자: Frontend Architect + Security Engineer
예상시간: 6-8시간
```

### **Phase 2: 핵심 기능 구현 (4-8일차)**

#### **Day 4-5: Questions API 실제 구현**
```yaml
작업_순서:
  1. Questions CRUD API
    - GET /api/questions (페이지네이션, 필터링)
    - POST /api/questions (질문 작성)
    - PUT /api/questions/[id] (질문 수정)
    - DELETE /api/questions/[id] (질문 삭제)

  2. 카테고리 및 태그 시스템
    - GET /api/categories (실제 카테고리 조회)
    - 태그 자동완성 기능

  3. 검색 및 필터링
    - 제목/내용 전문 검색 구현
    - 카테고리별 필터링
    - 정렬 기능 (최신순, 인기순, 답변순)

우선순위: 🟡 HIGH
담당자: Backend Architect + Performance Engineer
예상시간: 12-16시간
```

#### **Day 6-7: Answers 시스템 구현**
```yaml
작업_순서:
  1. Answers CRUD API
    - GET /api/questions/[id]/answers (답변 목록)
    - POST /api/answers (답변 작성)
    - PUT /api/answers/[id] (답변 수정)
    - POST /api/answers/[id]/accept (답변 채택)

  2. 투표 시스템
    - POST /api/votes (추천/비추천)
    - 실시간 투표 수 업데이트

  3. 댓글 시스템 (기본)
    - POST /api/comments (댓글 작성)
    - GET /api/comments (댓글 조회)

우선순위: 🟡 HIGH
담당자: Backend Architect + Frontend Architect
예상시간: 12-16시간
```

#### **Day 8: 사용자 프로필 및 권한**
```yaml
작업_순서:
  1. 사용자 프로필 API
    - GET /api/auth/profile (프로필 조회)
    - PUT /api/auth/profile (프로필 수정)

  2. 인증 시스템 UI
    - 인증 상태별 배지 표시
    - 비자타입/거주년차 표시

  3. 권한별 기능 제한
    - 미인증 사용자 제한사항
    - 인증 사용자 혜택 시스템

우선순위: 🟢 MEDIUM
담당자: Frontend Architect + Security Engineer
예상시간: 6-8시간
```

### **Phase 3: 통합 및 최적화 (9-12일차)**

#### **Day 9-10: 프론트엔드 통합**
```yaml
작업_순서:
  1. QuestionList 컴포넌트
    - 실제 API 연결
    - 로딩 상태 및 에러 처리
    - 무한 스크롤 구현

  2. QuestionDetail 페이지
    - 질문 상세 조회
    - 답변 목록 표시
    - 답변 작성 폼

  3. 사용자 인터페이스
    - 헤더 인증 상태 표시
    - 모바일 네비게이션
    - 반응형 디자인 최적화

우선순위: 🟡 HIGH
담당자: Frontend Architect + Performance Engineer
예상시간: 12-16시간
```

#### **Day 11: 성능 최적화**
```yaml
작업_순서:
  1. 데이터베이스 최적화
    - 쿼리 성능 분석
    - 인덱스 최적화
    - 페이지네이션 성능 개선

  2. 프론트엔드 최적화
    - 이미지 최적화
    - 코드 스플리팅
    - 캐싱 전략

  3. 모바일 성능
    - 3G 환경 테스트
    - 로딩 시간 3초 이내 달성

우선순위: 🟢 MEDIUM
담당자: Performance Engineer + DevOps Architect
예상시간: 6-8시간
```

#### **Day 12: 보안 및 테스트**
```yaml
작업_순서:
  1. 보안 검증
    - SQL 인젝션 방지 확인
    - XSS 방지 확인
    - CSRF 토큰 검증

  2. 권한 시스템 테스트
    - 각 역할별 접근 권한 확인
    - API 엔드포인트 보안 테스트

  3. 통합 테스트
    - 사용자 여정 전체 테스트
    - 에러 시나리오 테스트

우선순위: 🔴 CRITICAL
담당자: Security Engineer + Quality Engineer
예상시간: 6-8시간
```

### **Phase 4: 배포 및 런칭 (13-14일차)**

#### **Day 13: 배포 준비**
```yaml
작업_순서:
  1. 프로덕션 환경 설정
    - Vercel 배포 설정
    - 환경변수 프로덕션 적용
    - 도메인 및 SSL 설정

  2. 베트남 콘텐츠 시딩
    - 기본 카테고리 5개 생성
    - 샘플 질문 50개 준비
    - 시드 사용자 계정 생성

  3. 모니터링 설정
    - 에러 트래킹 설정
    - 성능 모니터링
    - 사용자 분석 도구

우선순위: 🟡 HIGH
담당자: DevOps Architect + System Architect
예상시간: 6-8시간
```

#### **Day 14: 베타 런칭**
```yaml
작업_순서:
  1. 소프트 런칭
    - 베트남 커뮤니티 20명 초대
    - 초기 피드백 수집

  2. 실시간 모니터링
    - 서버 상태 모니터링
    - 사용자 행동 분석
    - 즉시 버그 수정

  3. 피드백 적용
    - 긴급 이슈 해결
    - UI/UX 개선사항 적용

우선순위: 🔴 CRITICAL
담당자: 전체 팀 + 커뮤니티 매니저
예상시간: 8시간 (전일 모니터링)
```

---

## 👥 페르소나 에이전트 협업 시스템

### **일일 협업 플로우**
```yaml
09:00_스탠드업:
  - 각 페르소나별 진행상황 공유
  - 당일 우선순위 재조정
  - 블로커 식별 및 해결방안 논의

12:00_체크인:
  - 오전 작업 완료도 확인
  - 오후 계획 조정
  - 긴급 이슈 처리

18:00_데일리_리뷰:
  - 완료 작업 검토
  - 내일 우선순위 설정
  - 리스크 평가 및 완화방안
```

### **페르소나별 책임 영역**
```yaml
🏗️_System_Architect:
  - 전체 아키텍처 결정
  - 기술 스택 통합 관리
  - 품질 게이트 관리

🔧_Backend_Architect:
  - API 엔드포인트 구현
  - 데이터베이스 스키마 관리
  - Supabase 연동

🎨_Frontend_Architect:
  - UI/UX 컴포넌트 구현
  - 모바일 반응형 최적화
  - 사용자 경험 개선

🛡️_Security_Engineer:
  - 인증/권한 시스템 구현
  - 보안 취약점 점검
  - API 보안 설정

⚡_Performance_Engineer:
  - 성능 최적화
  - 데이터베이스 쿼리 최적화
  - 모바일 성능 개선

🚀_DevOps_Architect:
  - 배포 파이프라인 관리
  - 환경 설정 관리
  - 모니터링 시스템 구축
```

---

## 📊 성공 지표 및 품질 게이트

### **일일 품질 게이트**
```yaml
코드_품질:
  - TypeScript 엄격 모드 통과
  - ESLint 규칙 100% 준수
  - 단위 테스트 통과율 90%+

성능_기준:
  - 페이지 로딩 시간 3초 이내
  - API 응답시간 500ms 이내
  - Lighthouse 점수 90+ (모바일)

보안_기준:
  - 보안 스캔 취약점 0개
  - 권한 검증 테스트 100% 통과
  - 입력 검증 테스트 통과
```

### **최종 MVP 성공 기준**
```yaml
기술적_완성도:
  - Mock 데이터 0% (100% 실제 DB)
  - Google OAuth 완전 동작
  - 핵심 CRUD 기능 100% 동작
  - 모바일 반응형 95% 완성

사용자_경험:
  - 베트남 베타 사용자 20명 확보
  - 질문 작성 성공률 90%+
  - 답변 기능 사용률 70%+
  - 재방문율 60%+

커뮤니티_기반:
  - 일일 질문 2개 이상
  - 답변률 50% 이상
  - 사용자 만족도 4.0/5.0
```

---

## 🔄 리스크 관리 및 대응

### **Critical 리스크**
```yaml
Supabase_연결_실패:
  확률: 20%
  영향: HIGH
  대응: 스테이징 환경 사전 테스트, 롤백 계획

OAuth_설정_오류:
  확률: 30%
  영향: MEDIUM
  대응: Google Cloud Console 재설정, 대체 인증 방법

성능_목표_미달성:
  확률: 40%
  영향: MEDIUM
  대응: 기능 범위 축소, 성능 우선 최적화
```

### **대응 전략**
```yaml
일일_리스크_점검:
  - 블로커 실시간 식별
  - 대안 솔루션 준비
  - 에스컬레이션 프로세스

주간_계획_조정:
  - 진척도 기반 우선순위 재조정
  - 리소스 재배치
  - 범위 조정 결정
```

---

## 📅 실행 체크리스트

### **즉시 시작 (오늘)**
- [ ] Supabase 프로젝트 상태 확인
- [ ] Google OAuth 설정 검증
- [ ] Mock 데이터 제거 계획 수립
- [ ] 페르소나 역할 분담 확정

### **Week 1 (Day 1-7)**
- [ ] Mock 데이터 완전 제거
- [ ] Supabase 실제 연결 구현
- [ ] Google OAuth 통합
- [ ] Questions API 구현
- [ ] Answers 시스템 구현

### **Week 2 (Day 8-14)**
- [ ] 프론트엔드 통합 완성
- [ ] 성능 최적화
- [ ] 보안 검증
- [ ] 배포 및 베타 런칭

---

## 🎯 최종 목표

**2주 후 달성할 상태:**

✅ **기술적 완성**: Mock 데이터 0%, 실제 DB 100% 연결
✅ **기능적 완성**: 질문/답변/인증 시스템 완전 동작
✅ **사용자 경험**: 모바일 최적화된 베트남 Q&A 플랫폼
✅ **커뮤니티 기반**: 20명 베타 사용자로 초기 커뮤니티 형성

**이 계획으로 Viet K-Connect MVP를 67% → 100% 완성하여 베트남 커뮤니티에 실제 가치를 제공할 수 있습니다.**

---

*📄 Implementation Plan v1.0*
*📅 Created: 2025-10-07*
*🎯 Target: 2-week MVP completion*
*👥 Team: Multi-persona collaborative approach*