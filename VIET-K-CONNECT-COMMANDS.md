# Viet K-Connect 프로젝트 커스텀 명령어 가이드

## 프로젝트 개요
베트남 한국인 커뮤니티를 위한 신뢰 기반 Q&A 플랫폼 MVP 개발

---

## 📋 /project - 프로젝트 핵심 정보

### /project info
**프로젝트 기본 정보**
- 프로젝트명: Viet K-Connect
- 타겟: 한국 거주 베트남인 (E-7, E-9, D-2, D-4 비자)
- MVP 목표: 3주 내 출시, MAU 1000명 (2개월)
- 핵심 가치: "24시간 내 검증된 답변 보장"

### /project kpi
**핵심 성과 지표**
- Week 1: 가입 50명, 질문 10개, 답변률 50%
- Week 2: 가입 150명, 질문 30개, 답변률 60%
- Week 3: 가입 300명, WAU 100명, 답변률 70%
- Month 2: MAU 1000명, NPS 40+, 자연증가율 20%/월

### /project differentiation
**경쟁 차별화**
- vs Facebook: 검증된 답변자 매칭 시스템
- vs 네이버카페: 구조화된 Q&A + AI 분류
- 핵심 차별화: 신뢰도 기반 매칭 + 24시간 답변 보장

---

## 🛠️ /tech - 기술 스택 및 아키텍처

### /tech stack
**기술 스택**
```
Frontend:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS + shadcn/ui
  - Zustand (상태관리)

Backend:
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Supabase Storage
  - Edge Functions

Services:
  - OpenAI GPT-3.5-turbo
  - 카카오 알림톡 API
  - Google Analytics 4
  - Vercel (배포)
```

### /tech architecture
**시스템 아키텍처**
- PWA (Progressive Web App)
- Mobile-first responsive design
- Server-side rendering (SSR)
- Edge functions for API routes
- PostgreSQL with RLS (Row Level Security)

### /tech schema
**데이터베이스 스키마**
```sql
users:
  - id, name, email, profile_pic
  - visa_type, region
  - trust_score, contribution_level
  - created_at, last_active

posts:
  - id, author_id
  - title, content, category
  - status, matched_experts[]
  - created_at, answered_at

answers:
  - id, post_id, author_id
  - content, is_accepted
  - likes, created_at

verifications:
  - id, user_id
  - type, status
  - verified_at, verified_by

notifications:
  - id, user_id
  - type, content
  - read_at, sent_at
```

---

## ⚡ /features - 핵심 기능 명세

### /features matching
**스마트 매칭 알고리즘**
1. AI 질문 분석 (카테고리, 긴급도)
2. 경험자 필터링 (비자 타입, 지역)
3. 신뢰도 기반 랭킹
4. 상위 5명 추천
5. 24시간 자동 재매칭

### /features trust
**기여도 시스템** (포인트 대신 평판)
- 🌱 새싹 (0-10): 기본 회원
- 🌿 도우미 (11-50): 프로필 뱃지
- 🔥 조언자 (51-200): 우선 노출
- ⭐ 전문가 (201-500): 전문가 인증
- 👑 마스터 (500+): 수익 공유

### /features notification
**알림 전략**
1. 카카오 알림톡 (95% 열람률)
2. 인앱 알림 센터
3. 소셜 프레셔 (선택받은 의무감)

### /features auth
**인증 시스템**
- 필수: 카카오/구글 소셜 로그인
- 선택: 이메일 인증
- 고급: 비자 스크린샷 검증 (OCR)

---

## 🎨 /ui - UI/UX 디자인 가이드

### /ui principle
**디자인 원칙**
- Mobile-first (360px 기준)
- Thumb Zone 최적화 (하단 80%)
- Bottom Sheet 패턴
- 스와이프 카드 인터랙션
- Progressive Disclosure

### /ui components
**필수 컴포넌트**
- `QuestionCard`: 질문 카드
- `ExpertCard`: 전문가 선택 카드
- `TrustBadge`: 신뢰도 표시
- `BottomSheet`: 질문 작성
- `NotificationBell`: 알림 센터

### /ui flow
**사용자 플로우**
1. 홈 피드 → 질문 작성
2. AI 분석 → 전문가 5명 추천
3. 카드 스와이프 선택
4. 24시간 내 답변 도착
5. 평가 → 채택 → 공유

---

## 📈 /growth - 성장 전략

### /growth strategy
**단계별 성장 전략**

**Week 1-2: Seed (0→100)**
- 페이스북 그룹 3곳 베타 테스터 모집
- "24시간 답변 보장" 메시지

**Week 3-4: Activation (100→500)**
- FAQ 30개 시딩
- 전문가 10명 섭외
- 성공 사례 3개 스토리

**Month 2: Viral (500→2000)**
- 카톡 공유 활성화
- SEO 최적화
- 자연 증가 20%/월

### /growth metrics
**핵심 성장 지표**
- 답변률: 70% 이상
- 24시간 내 답변: 85% 이상
- 재방문율: 40% 이상
- K-Factor: 1.2 이상
- NPS: 40 이상

---

## 💻 /development - 개발 프로세스

### /development phase1
**Day 1-3: 기반 구축**
- [ ] Next.js 14 + TypeScript 셋업
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 설계
- [ ] 소셜 로그인 구현

### /development phase2
**Day 4-10: 핵심 기능**
- [ ] 스마트 매칭 알고리즘
- [ ] 기여도 시스템
- [ ] 카카오 알림톡 연동
- [ ] Q&A CRUD

### /development phase3
**Day 11-15: UI/UX**
- [ ] 모바일 최적화
- [ ] PWA 설정
- [ ] Bottom Sheet UI
- [ ] 스와이프 인터랙션

### /development phase4
**Day 16-21: 출시**
- [ ] 콘텐츠 시딩 (FAQ 30개)
- [ ] 베타 테스트 (50명)
- [ ] 성능 최적화
- [ ] 소프트 런칭

---

## ⚠️ /risk - 리스크 관리

### /risk coldstart
**초기 사용자 부족 대응**
- FAQ 30개 사전 작성
- 전문가 10명 사전 섭외
- 페이스북 그룹 활용

### /risk quality
**콘텐츠 품질 관리**
- AI 스팸 필터
- 커뮤니티 신고 시스템
- 주간 모더레이션

### /risk legal
**법적 이슈 예방**
- 모든 답변 "개인 경험" 라벨
- 법률/의료 조언 금지
- 이용약관 명시

---

## 🚀 /commands - 실행 명령어

### 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프리뷰
npm run preview

# Vercel 배포
vercel --prod

# Supabase 동기화
npx supabase db push

# 테스트
npm run test
```

### Git 커밋 컨벤션
```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무 수정
```

---

## 📊 /analytics - 분석 도구

### 추적 이벤트
- `question_created`: 질문 작성
- `expert_selected`: 전문가 선택
- `answer_submitted`: 답변 제출
- `answer_accepted`: 답변 채택
- `content_shared`: 콘텐츠 공유

### 핵심 퍼널
1. 방문 → 가입 (목표: 30%)
2. 가입 → 첫 질문 (목표: 50%)
3. 질문 → 답변 받음 (목표: 70%)
4. 답변 → 채택 (목표: 60%)
5. 채택 → 재방문 (목표: 40%)

---

## 📝 체크리스트

### MVP 출시 전 필수 체크
- [ ] 모바일 반응형 테스트
- [ ] 카카오 알림톡 작동 확인
- [ ] 소셜 로그인 테스트
- [ ] 매칭 알고리즘 검증
- [ ] 초기 콘텐츠 30개 준비
- [ ] 전문가 10명 확보
- [ ] 이용약관/개인정보처리방침
- [ ] Google Analytics 설정
- [ ] 에러 모니터링 설정
- [ ] 백업 시스템 구축

---

## 🎯 Quick Reference

### 핵심 원칙
1. **단순함**: 질문 → 매칭 → 답변
2. **신뢰도**: 실명 + 경험 검증
3. **속도**: 24시간 내 답변 보장
4. **품질**: 여러 답변 중 최선 선택

### 성공 공식
```
성공 = (신뢰도 × 응답속도) / 복잡도
```

### 연락처
- 프로젝트 관리자: 이상복
- 이메일: sangbok3918@naver.com
- 전화: 010-9977-3918

---

*Last Updated: 2024*