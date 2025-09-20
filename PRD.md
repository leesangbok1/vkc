# Product Requirements Document (PRD)
# Viet K-Connect - 베트남인 한국 거주자 Q&A 플랫폼

## 📌 Document Information
- **Version**: 1.0.0
- **Last Updated**: 2025-09-19
- **Status**: Active Development
- **Author**: Product Management Team
- **Project Path**: `/Users/bk/Desktop/viet-kconnect`

---

## 1. Executive Summary

### 1.1 Product Vision
**"베트남인 한국 거주자들이 서로 돕고 성장하는 신뢰 기반 커뮤니티 플랫폼"**

한국에 거주하는 30만 베트남인들이 일상의 궁금증을 해결하고, 검증된 선배들로부터 실질적인 도움을 받을 수 있는 Q&A 플랫폼을 구축합니다.

### 1.2 Mission Statement
- **연결**: 같은 처지의 베트남인들을 연결
- **신뢰**: 실명 인증과 경험 기반 답변으로 신뢰 구축
- **성장**: 커뮤니티의 집단 지성으로 함께 성장

### 1.3 Target Market
- **Primary**: 한국 거주 베트남인 30만명
  - 유학생 (40%)
  - 근로자 (35%)
  - 결혼이민자 (25%)
- **Secondary**: 한국 진출 예정 베트남인
- **Tertiary**: 베트남 관심 한국인

### 1.4 Core Value Proposition
1. **24시간 답변 보장**: AI 매칭으로 적합한 답변자 자동 추천
2. **검증된 정보**: 실명 인증과 경험 기반 답변
3. **언어 장벽 해소**: 한국어/베트남어 자동 번역 지원
4. **모바일 최적화**: 언제 어디서나 쉽게 접근

---

## 2. User Research & Analysis

### 2.1 User Personas

#### Persona 1: "유학생 민" (22세, 여)
- **배경**: 서울 대학교 2학년, 월 100만원 생활비
- **Pain Points**:
  - 행정 처리 방법 모름 (외국인등록증, 통장개설)
  - 아르바이트 정보 부족
  - 한국어 실력 부족으로 정보 검색 어려움
- **Needs**: 빠른 답변, 쉬운 설명, 비자 관련 정확한 정보

#### Persona 2: "근로자 탄" (28세, 남)
- **배경**: E-9 비자, 제조업 근무, 월 250만원 수입
- **Pain Points**:
  - 노동법 관련 정보 부족
  - 송금 방법과 세금 문제
  - 주거지 계약 어려움
- **Needs**: 실무적 조언, 법적 보호 정보, 경제적 팁

#### Persona 3: "결혼이민자 란" (32세, 여)
- **배경**: F-6 비자, 주부, 자녀 1명
- **Pain Points**:
  - 자녀 교육 시스템 이해 부족
  - 시댁 문화 적응 어려움
  - 취업 기회 정보 부족
- **Needs**: 육아 정보, 문화 이해, 커리어 재시작

#### Persona 4: "사업가 훙" (35세, 남)
- **배경**: D-8 비자, 무역업, 연 1억 매출
- **Pain Points**:
  - 사업 관련 법규 복잡
  - 네트워킹 기회 부족
  - 세무/회계 처리 어려움
- **Needs**: 전문가 조언, 비즈니스 네트워킹, 법률 컨설팅

#### Persona 5: "신규입국 안" (20세, 여)
- **배경**: 한국 입국 예정, 어학연수 준비
- **Pain Points**:
  - 한국 생활 정보 전무
  - 준비물과 절차 모름
  - 초기 정착 불안감
- **Needs**: 체크리스트, 단계별 가이드, 멘토링

### 2.2 User Journey Map

```
발견 → 가입 → 질문 → 답변 → 해결 → 기여
│
├─ 발견: SNS, 구글 검색, 지인 추천
├─ 가입: 소셜 로그인 (30초)
├─ 질문: AI 도움으로 쉽게 작성
├─ 답변: 24시간 내 전문가 매칭
├─ 해결: 베스트 답변 선택
└─ 기여: 본인도 답변자로 활동
```

### 2.3 Key Pain Points
1. **정보 신뢰성**: 카페/블로그 정보 신뢰 어려움
2. **언어 장벽**: 공식 문서 이해 어려움
3. **문화 차이**: 한국 특유 시스템 이해 부족
4. **긴급 대응**: 급한 문제 해결 채널 부재
5. **네트워킹**: 같은 처지 사람들과 연결 어려움

---

## 3. Functional Requirements

### 3.1 User Authentication & Profile

#### 3.1.1 Social Login (P0)
- **Providers**: Kakao, Google, Facebook
- **Process**: OAuth 2.0, 30초 내 완료
- **Data Collection**: 최소 정보 (이름, 이메일, 프로필 사진)

#### 3.1.2 Profile Management (P0)
- **Required**: 이름, 거주 지역
- **Optional**: 비자 타입, 체류 기간, 관심 분야
- **Badges**: 자동 부여 (Senior, Expert, Verified, Helper)

#### 3.1.3 Guest Access (P0)
- **Read**: 모든 콘텐츠 열람 가능
- **Limit**: 답변 작성 불가, 투표 불가

### 3.2 Q&A System

#### 3.2.1 Question Creation (P0)
```typescript
interface Question {
  title: string;          // 제목 (필수)
  content: string;        // 내용 (필수)
  category: Category;     // AI 자동 선택
  tags: Tag[];           // AI 자동 추천
  urgency: 'normal' | 'urgent';
  visibility: 'public' | 'verified_only';
}
```

#### 3.2.2 AI Classification (P0)
- **Model**: OpenAI GPT-3.5-turbo
- **Functions**:
  - 카테고리 자동 분류 (10개 카테고리)
  - 태그 자동 생성 (최대 5개)
  - 중복 질문 감지
  - 부적절 콘텐츠 필터링

#### 3.2.3 Smart Matching (P0)
- **Algorithm**: 전문가 점수 계산
  ```
  Score = (답변률 × 0.3) + (채택률 × 0.3) +
          (활동점수 × 0.2) + (전문분야 × 0.2)
  ```
- **Output**: Top 5 전문가 자동 알림

#### 3.2.4 Answer System (P0)
- **Format**: Markdown 지원
- **Media**: 이미지 업로드 (최대 5MB)
- **Edit**: 30분 내 수정 가능
- **Vote**: 도움됨/도움안됨 투표

#### 3.2.5 Best Answer (P0)
- **Selection**: 질문자가 선택
- **Reward**: 포인트 지급, 채택률 상승
- **Display**: 상단 고정 표시

### 3.3 Notification System

#### 3.3.1 In-App Notifications (P0)
- **Real-time**: WebSocket 기반
- **Types**: 답변 알림, 댓글 알림, 채택 알림

#### 3.3.2 Push Notifications (P0)
- **Service**: FCM (Firebase Cloud Messaging)
- **Opt-in**: 사용자 동의 필수
- **Frequency**: 스마트 조절 (피로도 방지)

#### 3.3.3 Kakao Integration (P0)
- **Share**: 카카오톡 공유 버튼
- **AlimTalk**: 중요 알림 (채택, 긴급 답변)

### 3.4 Search & Discovery

#### 3.4.1 Search Engine (P1)
- **Full-text Search**: PostgreSQL FTS
- **Filters**: 카테고리, 태그, 기간, 해결 상태
- **Sort**: 관련도, 최신순, 인기순

#### 3.4.2 Trending (P1)
- **Algorithm**: 조회수 + 답변수 + 시간가중치
- **Display**: 홈페이지 상단 5개

#### 3.4.3 Related Questions (P1)
- **AI Recommendation**: 유사 질문 3개
- **Display**: 질문 하단 표시

### 3.5 Gamification & Rewards

#### 3.5.1 Point System (P1)
- **Earn**: 질문(10), 답변(20), 채택(50)
- **Spend**: 긴급 질문, 전문가 지정
- **Display**: 프로필 레벨 표시

#### 3.5.2 Badge System (P0)
| Badge | Criteria | Color | Benefits |
|-------|----------|-------|----------|
| 🎖️ Senior | 3년+ 체류 | Orange | 신뢰도 부스트 |
| 🏅 Expert | 채택률 70%+ | Gold | 우선 매칭 |
| ✅ Verified | 실명 인증 | Green | 인증 마크 |
| ❤️ Helper | 답변 50개+ | Blue | 커뮤니티 인정 |

#### 3.5.3 Leaderboard (P2)
- **Weekly**: 주간 최다 답변자
- **Monthly**: 월간 베스트 답변자
- **All-time**: 명예의 전당

### 3.6 Admin & Moderation

#### 3.6.1 Admin Dashboard (P1)
- **Metrics**: DAU, MAU, 답변률, 평균 응답 시간
- **User Management**: 정지, 경고, 뱃지 부여
- **Content Moderation**: 신고 처리, 삭제

#### 3.6.2 Community Guidelines (P0)
- **Rules**: 커뮤니티 규칙 명시
- **Report**: 신고 기능 (스팸, 부적절, 중복)
- **Action**: 경고 → 정지 → 영구정지

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Page Load**: < 2초 (3G 네트워크)
- **API Response**: < 500ms (95 percentile)
- **Concurrent Users**: 10,000명 동시 접속
- **Uptime**: 99.9% SLA

### 4.2 Security
- **Authentication**: OAuth 2.0, JWT
- **Encryption**: HTTPS only, AES-256
- **Data Protection**: GDPR/PIPA 준수
- **Backup**: 일일 자동 백업

### 4.3 Accessibility
- **Standards**: WCAG 2.1 Level AA
- **Screen Reader**: 완벽 지원
- **Keyboard Navigation**: 100% 가능
- **Color Contrast**: 4.5:1 minimum

### 4.4 Mobile Optimization
- **Responsive**: 360px ~ 1920px
- **PWA**: Installable, Offline support
- **Touch**: 44px minimum target
- **Performance**: Lighthouse score > 90

### 4.5 Internationalization
- **Languages**: Korean, Vietnamese, English
- **Translation**: UI only (구글 번역 안내)
- **Date/Time**: 현지 시간대
- **Currency**: KRW, VND

---

## 5. Success Metrics (KPIs)

### 5.1 Acquisition
- **Target**: 100명 베타 사용자 (Week 1)
- **Channels**: SNS 50%, 검색 30%, 추천 20%
- **CAC**: < 5,000원/user

### 5.2 Activation
- **First Question**: 50% (D1)
- **Profile Complete**: 70% (D7)
- **Push Opt-in**: 60%

### 5.3 Retention
- **D1**: 60%
- **D7**: 40%
- **D30**: 25%

### 5.4 Engagement
- **DAU/MAU**: 40%
- **Questions/User**: 2.5/month
- **Answers/Question**: 3.2
- **Response Time**: < 12 hours

### 5.5 Quality
- **Answer Rate**: > 70%
- **Best Answer Rate**: > 50%
- **NPS**: > 40
- **User Satisfaction**: > 4.0/5.0

---

## 6. Technical Architecture

### 6.1 Tech Stack
```yaml
Frontend:
  - Framework: Next.js 14 (App Router)
  - Language: TypeScript
  - UI: shadcn/ui + Tailwind CSS
  - State: Zustand

Backend:
  - Platform: Supabase
  - Database: PostgreSQL
  - Auth: Supabase Auth
  - Storage: Supabase Storage

AI/ML:
  - OpenAI GPT-3.5-turbo
  - Embedding: text-embedding-ada-002

Infrastructure:
  - Hosting: Vercel
  - CDN: CloudFlare
  - Analytics: Google Analytics 4
  - Monitoring: Sentry
```

### 6.2 Data Model
```sql
-- Simplified Core Tables
users -> questions -> answers -> votes
      -> categories -> tags
      -> notifications -> activities
```

### 6.3 API Design
- **REST API**: CRUD operations
- **GraphQL**: Complex queries (optional)
- **WebSocket**: Real-time updates

---

## 7. Risks & Mitigations

### 7.1 Business Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | 시드 콘텐츠 30개, 인플루언서 협업 |
| Content quality | Medium | High | AI 필터링, 커뮤니티 모더레이션 |
| Competition | Low | Medium | 차별화된 AI 매칭, 24시간 답변 |

### 7.2 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| AI API cost | Medium | Medium | Rate limiting, 캐싱 |
| Scalability | Low | High | Serverless, Auto-scaling |
| Data breach | Low | Critical | Security audit, Encryption |

### 7.3 Legal Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Privacy violation | Low | High | PIPA 준수, 투명한 정책 |
| Content liability | Medium | Medium | 면책 조항, 신고 시스템 |
| IP infringement | Low | Medium | 콘텐츠 검수, DMCA 대응 |

---

## 8. Timeline & Milestones

### 8.1 Phase 1: Foundation (Week 1-2)
- ✅ UI Prototype Complete
- 🔄 Backend Integration
- 🔄 Authentication System

### 8.2 Phase 2: Core Features (Week 3-4)
- Q&A CRUD
- AI Classification
- Smart Matching

### 8.3 Phase 3: Launch (Week 5-6)
- Beta Testing (100 users)
- Performance Optimization
- Marketing Campaign

### 8.4 Phase 4: Growth (Month 2-3)
- Feature Expansion
- Community Building
- Monetization

---

## 9. Dependencies

### 9.1 External Services
- **Supabase**: Database, Auth, Storage
- **OpenAI**: GPT-3.5, Embeddings
- **Kakao**: OAuth, AlimTalk, Share
- **Google**: OAuth, Analytics, Translate
- **Facebook**: OAuth, Pixel

### 9.2 Internal Resources
- **Team**: PM(1), Frontend(1), Backend(1), Designer(1)
- **Budget**: 월 100만원 (서버, API)
- **Timeline**: 6주 MVP, 3개월 정식 출시

---

## 10. User Flow & Page Design

### 10.1 Page Access by User Role

| Page | URL Path | Guest | User | Verified | Admin | Main Features | Notes |
|------|----------|-------|------|----------|-------|---------------|-------|
| 홈페이지 | / | ✅ | ✅ | ✅ | ✅ | 최근 질문, 인기 질문, 카테고리 | 로그인 없이 열람 |
| 질문 목록 | /questions | ✅ | ✅ | ✅ | ✅ | 전체 질문 목록, 필터, 검색 | 로그인 없이 열람 |
| 질문 상세 | /questions/[id] | ✅ | ✅ | ✅ | ✅ | 질문과 답변 열람 | 로그인 없이 열람 |
| 카테고리 | /categories | ✅ | ✅ | ✅ | ✅ | 카테고리별 질문 보기 | 로그인 없이 열람 |
| 검색 | /search | ✅ | ✅ | ✅ | ✅ | 키워드 검색 | 로그인 없이 열람 |
| 질문 작성 | /questions/new | ❌ | ✅ | ✅ | ✅ | 새 질문 등록 | 로그인 필요 |
| 답변 작성 | /questions/[id]#answer | ❌ | ✅ | ✅ | ✅ | 답변 작성 및 수정 | 로그인 필요 |
| 내 프로필 | /profile | ❌ | ✅ | ✅ | ✅ | 프로필 수정, 활동 내역 | 로그인 필요 |
| 알림 센터 | /notifications | ❌ | ✅ | ✅ | ✅ | 알림 확인 및 관리 | 로그인 필요 |
| 관리자 대시보드 | /admin | ❌ | ❌ | ❌ | ✅ | 통계, 사용자 관리, 콘텐츠 관리 | 관리자만 |

### 10.2 User Journey Detail

#### 첫 방문자 → 질문 작성 Flow
| Step | User Action | System Response | Screen/Page | Auth Required |
|------|-------------|-----------------|-------------|---------------|
| 1 | 홈페이지 방문 | 질문 목록 표시 | Homepage | No |
| 2 | 질문 목록 탐색 | 카테고리별 필터링 | Questions List | No |
| 3 | 질문 상세 보기 | 질문과 답변 표시 | Question Detail | No |
| 4 | 질문하기 버튼 클릭 | 로그인 모달 표시 | Login Modal | No |
| 5 | 소셜 로그인 선택 | OAuth 프로세스 | OAuth Provider | Yes |
| 6 | 자동 회원가입 | 프로필 생성 | Profile Setup | Yes |
| 7 | 질문 작성 | AI 분류 및 매칭 | Question Form | Yes |
| 8 | 전문가 5명 추천 | 스와이프 선택 | Expert Selection | Yes |
| 9 | 질문 발행 | 알림 발송 | Success | Yes |

### 10.3 Page Components Detail

#### Homepage Components
| Component | Type | Description | Props/State | Priority |
|-----------|------|-------------|-------------|----------|
| Header | Layout | 로고, 검색바, 로그인 버튼 | user, isAuth | P0 |
| Hero Banner | Component | 서비스 소개 (게스트용) | isGuest | P0 |
| QuestionInput | Interactive | 질문 입력 폼 | disabled for guest | P0 |
| CategoryGrid | Navigation | 10개 카테고리 | categories[] | P0 |
| RecentQuestions | List | 최근 질문 10개 | questions[] | P0 |
| PopularQuestions | List | 인기 질문 5개 | questions[] | P0 |
| TopHelpers | Widget | 이번 주 TOP 도우미 | users[] | P0 |
| TrustMetrics | Widget | 신뢰 지표 | stats{} | P0 |
| Footer | Layout | 서비스 정보, 링크 | static | P0 |

### 10.4 Modal & Interaction Design

| Modal/Interaction | Trigger | Purpose | Components | Actions | Priority |
|-------------------|---------|---------|------------|---------|----------|
| 로그인 모달 | 질문/답변 버튼 클릭 | 회원가입/로그인 유도 | 카카오/구글/페이스북 로그인 | OAuth 프로세스 | P0 |
| 인증 유도 박스 | 답변 작성 시 | 신뢰도 향상 유도 | 비자/거주년차/재직 인증 | 선택적 인증 | P1 |
| Bottom Sheet | 질문 작성 (모바일) | 모바일 UX | 질문 폼, 카테고리 선택, AI 태그 | 질문 등록 | P0 |
| 알림 센터 | 알림 아이콘 클릭 | 알림 확인 | 새 답변, 채택, 시스템 알림 | 읽음 처리 | P0 |
| 공유 메뉴 | 공유 버튼 클릭 | 콘텐츠 공유 | 카카오톡, 링크 복사, Facebook | 외부 공유 | P0 |
| A/B 테스트 토글 | 하단 중앙 버튼 | 버전 전환 | 질문 우선형/검색 우선형 | View 전환 | P2 |

### 10.5 Performance Metrics & Measurement

#### Conversion Funnel
| Category | Metric | Target | Measurement Tool | Frequency |
|----------|--------|--------|------------------|-----------|
| **진입 전환율** | | | | |
| | 방문 → 가입 | 30% | GA4 Conversion | Daily |
| | 게스트 → 회원 | 25% | User Analytics | Weekly |
| | 가입 → 첫 질문 | 50% | Database Query | Daily |
| **참여도** | | | | |
| | 질문 작성 완료율 | 70% | Form Analytics | Daily |
| | 답변률 | 70% 이상 | Database Query | Daily |
| | 채택률 | 60% 이상 | Database Query | Weekly |
| | 재방문율 (7일) | 40% 이상 | GA4 | Weekly |
| **품질** | | | | |
| | AI 분류 정확도 | 85% 이상 | Manual Review | Weekly |
| | 답변 품질 점수 | 4.0/5.0 이상 | User Rating | Daily |
| | 응답 시간 | < 12시간 | System Monitor | Real-time |

---

## 11. Appendix

### 11.1 Glossary
- **VKC**: Viet K-Connect
- **MAU**: Monthly Active Users
- **CAC**: Customer Acquisition Cost
- **NPS**: Net Promoter Score

### 11.2 References
- Market Research: "한국 거주 베트남인 현황" (법무부, 2024)
- Competitor Analysis: 네이버 카페, 페이스북 그룹
- User Interviews: 30명 심층 인터뷰 결과

### 11.3 Change Log
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-09-19 | Initial PRD | PM Team |
| 1.1.0 | 2025-09-19 | Added User Flow, Page Design, Metrics sections | PM Team |

---

*이 PRD는 지속적으로 업데이트되며, 모든 이해관계자의 피드백을 반영합니다.*