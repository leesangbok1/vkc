# Execution Plan - Viet K-Connect
# 실행 계획서 (2025 Q1)

## 📍 현재 상태 평가 (As-Is)

### ✅ 완료된 작업
1. **UI/UX 프로토타입** (100% 완료)
   - Next.js 14 프로젝트 구조
   - shadcn/ui 컴포넌트 라이브러리
   - 모든 주요 화면 구현
   - A/B 테스트 인터페이스

2. **디자인 시스템** (100% 완료)
   - 베트남 테마 색상
   - 반응형 레이아웃
   - 모바일 최적화

### 🔄 진행 중
1. **프로젝트 문서화**
   - PRD 작성 완료
   - 실행 계획 작성 중
   - 기술 문서 업데이트 필요

### 📅 예정 작업
1. **백엔드 통합** (0% 시작 전)
2. **AI 기능 구현** (0% 시작 전)
3. **배포 및 운영** (0% 시작 전)

---

## 🎯 목표 상태 (To-Be)

### 6주 후 목표
- **MVP 출시**: 베타 사용자 100명 확보
- **핵심 기능**: Q&A + AI 분류 + 실시간 알림
- **품질 지표**: 버그 < 10개, 성능 > 90점
- **사용자 만족**: NPS > 40

---

## 📅 상세 실행 계획

### 🚀 Week 1: Backend Foundation (9/19-9/25)

#### Day 1-2: Supabase 프로젝트 설정
```bash
# 실행 작업
1. Supabase 프로젝트 생성
2. 환경 변수 설정 (.env.local)
3. Database 연결 테스트
4. Auth 프로바이더 설정
```

**체크리스트:**
- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성 (viet-kconnect-prod)
- [ ] API 키 발급 및 저장
- [ ] Next.js 연동 (@supabase/supabase-js)
- [ ] 연결 테스트 코드 작성

**담당자:** Backend Developer
**예상 시간:** 8시간

#### Day 3-4: 데이터베이스 스키마 구현
```sql
-- 핵심 테이블 생성
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE questions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  content TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE answers (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES questions(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  is_best BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

**체크리스트:**
- [ ] ERD 다이어그램 작성
- [ ] 테이블 생성 SQL 작성
- [ ] 인덱스 최적화
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 시드 데이터 삽입

**담당자:** Backend Developer
**예상 시간:** 12시간

#### Day 5-7: OAuth 인증 시스템
```typescript
// OAuth 프로바이더 설정
const providers = {
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    redirectUri: '/api/auth/callback/kakao'
  },
  google: { /* ... */ },
  facebook: { /* ... */ }
};
```

**체크리스트:**
- [ ] 카카오 개발자 앱 등록
- [ ] 구글 Cloud Console 설정
- [ ] 페이스북 개발자 앱 등록
- [ ] Supabase Auth 연동
- [ ] 로그인/로그아웃 플로우 테스트

**담당자:** Full-stack Developer
**예상 시간:** 16시간

**Week 1 산출물:**
- ✅ 작동하는 데이터베이스
- ✅ 소셜 로그인 3개
- ✅ 기본 사용자 프로필

---

### 💪 Week 2: Core Features (9/26-10/2)

#### Day 8-10: Q&A CRUD API
```typescript
// API 엔드포인트
POST   /api/questions     // 질문 작성
GET    /api/questions     // 질문 목록
GET    /api/questions/:id // 질문 상세
PUT    /api/questions/:id // 질문 수정
DELETE /api/questions/:id // 질문 삭제

POST   /api/answers       // 답변 작성
PUT    /api/answers/:id   // 답변 수정
POST   /api/answers/:id/best // 베스트 답변
```

**체크리스트:**
- [ ] API 라우트 구현
- [ ] 유효성 검증 미들웨어
- [ ] 에러 처리
- [ ] 페이지네이션
- [ ] API 문서 작성

**담당자:** Backend Developer
**예상 시간:** 20시간

#### Day 11-12: AI 분류 시스템
```typescript
// OpenAI Integration
async function classifyQuestion(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: "Classify this question into categories..."
    }, {
      role: "user",
      content: text
    }],
    functions: [categorizeFunction, tagFunction]
  });
  return response;
}
```

**체크리스트:**
- [ ] OpenAI API 키 발급
- [ ] 프롬프트 엔지니어링
- [ ] 카테고리 분류 함수
- [ ] 태그 생성 함수
- [ ] 비용 최적화 (캐싱)

**담당자:** AI Engineer
**예상 시간:** 12시간

#### Day 13-14: 전문가 매칭 알고리즘
```typescript
// 매칭 점수 계산
function calculateExpertScore(expert: User, question: Question) {
  const scores = {
    answerRate: expert.stats.answerRate * 0.3,
    acceptRate: expert.stats.acceptRate * 0.3,
    activityScore: expert.stats.activityScore * 0.2,
    categoryMatch: calculateCategoryMatch(expert, question) * 0.2
  };
  return Object.values(scores).reduce((a, b) => a + b, 0);
}
```

**체크리스트:**
- [ ] 점수 계산 알고리즘
- [ ] 전문가 풀 관리
- [ ] 실시간 매칭 큐
- [ ] 알림 발송 시스템
- [ ] A/B 테스트 설정

**담당자:** Backend Developer
**예상 시간:** 12시간

**Week 2 산출물:**
- ✅ 완전한 Q&A 시스템
- ✅ AI 자동 분류
- ✅ 스마트 매칭

---

### 🔔 Week 3: Notifications & Mobile (10/3-10/9)

#### Day 15-16: 실시간 알림 시스템
```typescript
// WebSocket Setup
import { createClient } from '@supabase/supabase-js';

const subscription = supabase
  .from('notifications')
  .on('INSERT', payload => {
    // 실시간 알림 처리
    showNotification(payload.new);
  })
  .subscribe();
```

**체크리스트:**
- [ ] Supabase Realtime 설정
- [ ] 알림 타입 정의
- [ ] 프론트엔드 알림 UI
- [ ] 알림 설정 관리
- [ ] 읽음 처리

**담당자:** Full-stack Developer
**예상 시간:** 12시간

#### Day 17-18: 카카오톡 연동
```typescript
// Kakao SDK Integration
Kakao.Share.sendDefault({
  objectType: 'feed',
  content: {
    title: question.title,
    description: question.content.slice(0, 100),
    imageUrl: 'https://viet-kconnect.com/og-image.png',
    link: {
      mobileWebUrl: `https://viet-kconnect.com/q/${question.id}`,
      webUrl: `https://viet-kconnect.com/q/${question.id}`
    }
  }
});
```

**체크리스트:**
- [ ] Kakao SDK 설치
- [ ] 공유 템플릿 설정
- [ ] 알림톡 템플릿 등록
- [ ] 발송 API 구현
- [ ] 테스트 및 승인

**담당자:** Frontend Developer
**예상 시간:** 10시간

#### Day 19-21: PWA 최적화
```json
// manifest.json
{
  "name": "Viet K-Connect",
  "short_name": "VKC",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#EA4335",
  "background_color": "#ffffff",
  "icons": [...]
}
```

**체크리스트:**
- [ ] Service Worker 구현
- [ ] Manifest 파일 생성
- [ ] 오프라인 지원
- [ ] 설치 프롬프트
- [ ] Lighthouse 최적화

**담당자:** Frontend Developer
**예상 시간:** 14시간

**Week 3 산출물:**
- ✅ 실시간 알림
- ✅ 카카오톡 공유
- ✅ PWA 설치 가능

---

### 🧪 Week 4: Testing & Optimization (10/10-10/16)

#### Day 22-24: 통합 테스트
```typescript
// 테스트 시나리오
describe('User Journey', () => {
  it('회원가입 → 질문 → 답변 → 채택', async () => {
    // 1. 소셜 로그인
    // 2. 질문 작성
    // 3. AI 분류 확인
    // 4. 전문가 매칭
    // 5. 답변 수신
    // 6. 베스트 답변 선택
  });
});
```

**체크리스트:**
- [ ] E2E 테스트 시나리오
- [ ] Unit 테스트 (80% coverage)
- [ ] Integration 테스트
- [ ] Performance 테스트
- [ ] Security 테스트

**담당자:** QA Engineer
**예상 시간:** 20시간

#### Day 25-26: 성능 최적화
```typescript
// 최적화 목록
1. Image optimization (next/image)
2. Code splitting
3. Bundle size reduction
4. Database query optimization
5. Caching strategy (Redis)
```

**체크리스트:**
- [ ] Lighthouse 점수 > 90
- [ ] Bundle size < 200KB
- [ ] FCP < 1.5s
- [ ] TTI < 3.5s
- [ ] API response < 500ms

**담당자:** Full-stack Developer
**예상 시간:** 12시간

#### Day 27-28: 버그 수정
**우선순위별 버그 처리:**
- P0: 크리티컬 (로그인 불가, 데이터 손실)
- P1: Major (기능 오류)
- P2: Minor (UI 깨짐)
- P3: Trivial (오타, 스타일)

**담당자:** 전체 팀
**예상 시간:** 16시간

**Week 4 산출물:**
- ✅ 테스트 커버리지 80%
- ✅ 성능 점수 90+
- ✅ 버그 < 10개

---

### 🚀 Week 5-6: Launch Preparation (10/17-10/30)

#### Week 5: 베타 테스트
```markdown
## 베타 테스터 모집
- Facebook 그룹: 30명
- 대학 동아리: 30명
- 회사 커뮤니티: 20명
- 인플루언서: 20명
```

**활동:**
- [ ] 테스터 모집 및 온보딩
- [ ] 피드백 수집 시스템
- [ ] Daily 버그 리포트
- [ ] 개선사항 구현
- [ ] 스트레스 테스트

**담당자:** PM + Marketing
**예상 시간:** 40시간

#### Week 6: 정식 출시
```markdown
## Launch Checklist
- [ ] Production 환경 설정
- [ ] 도메인 연결
- [ ] SSL 인증서
- [ ] 모니터링 도구
- [ ] 백업 시스템
- [ ] 고객지원 채널
- [ ] 마케팅 캠페인
```

**담당자:** 전체 팀
**예상 시간:** 40시간

---

## 📊 리소스 할당

### 인력 계획
| 역할 | Week 1 | Week 2 | Week 3 | Week 4 | Week 5-6 |
|------|--------|--------|--------|--------|----------|
| PM | 20% | 20% | 20% | 30% | 40% |
| Frontend | 30% | 40% | 50% | 30% | 20% |
| Backend | 50% | 40% | 30% | 30% | 20% |
| QA | 0% | 0% | 0% | 40% | 20% |

### 예산 계획
| 항목 | 월 비용 | 설명 |
|------|---------|------|
| Supabase | $25 | Pro plan |
| OpenAI | $50 | ~10,000 requests |
| Vercel | $20 | Pro plan |
| Domain | $1 | .com 도메인 |
| Kakao API | Free | 무료 한도 내 |
| **Total** | **$96/month** | 약 12만원 |

---

## ⚠️ 리스크 관리

### 기술적 리스크
1. **AI API 비용 초과**
   - 대응: Rate limiting, 캐싱 전략
   - 책임: Backend Developer

2. **성능 저하**
   - 대응: CDN, 이미지 최적화
   - 책임: Frontend Developer

3. **보안 취약점**
   - 대응: Security audit, Penetration test
   - 책임: Security Engineer

### 비즈니스 리스크
1. **사용자 부족**
   - 대응: 시드 콘텐츠, 인플루언서 마케팅
   - 책임: Marketing Team

2. **콘텐츠 품질**
   - 대응: AI 필터링, 모더레이션
   - 책임: Community Manager

---

## ✅ 완료 기준 (Definition of Done)

### 기능별 DoD
- [ ] 코드 리뷰 완료
- [ ] 테스트 작성 (Unit + Integration)
- [ ] 문서 업데이트
- [ ] 성능 테스트 통과
- [ ] 보안 검증 완료

### 스프린트 DoD
- [ ] 모든 이슈 해결
- [ ] 데모 준비 완료
- [ ] 배포 가능 상태
- [ ] 회고 미팅 완료

### 프로젝트 DoD
- [ ] 100명 베타 사용자
- [ ] 핵심 기능 100% 작동
- [ ] 버그 < 10개
- [ ] NPS > 40

---

## 🔄 일일 작업 루틴

### Daily Standup (10:00 AM)
```markdown
1. 어제 한 일
2. 오늘 할 일
3. 블로커
4. 도움 필요 사항
```

### Daily Checklist
- [ ] GitHub 이슈 업데이트
- [ ] PR 리뷰
- [ ] 테스트 실행
- [ ] 문서 업데이트
- [ ] 팀 커뮤니케이션

### Weekly Review (금요일 4:00 PM)
```markdown
1. 주간 목표 달성률
2. 주요 성과
3. 개선 필요 사항
4. 다음 주 계획
```

---

## 🎯 핵심 성공 요인

1. **속도**: 빠른 MVP 출시로 시장 검증
2. **품질**: 안정적인 서비스로 신뢰 구축
3. **사용자 중심**: 지속적인 피드백 반영
4. **데이터 기반**: 측정 가능한 지표로 의사결정
5. **팀워크**: 명확한 역할과 소통

---

## 📝 다음 단계

### 즉시 실행 (Today)
1. Supabase 계정 생성
2. GitHub 리포지토리 설정
3. 개발 환경 구성
4. 첫 번째 이슈 생성

### 이번 주 (This Week)
1. 데이터베이스 스키마 완성
2. OAuth 앱 등록
3. 기본 API 구현

### 이번 달 (This Month)
1. MVP 기능 완성
2. 베타 테스트 시작
3. 피드백 반영

---

*이 실행 계획은 매주 업데이트되며, 실제 진행 상황에 따라 조정됩니다.*