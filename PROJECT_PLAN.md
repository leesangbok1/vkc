# Viet K-Connect 프로젝트 계획 (통합본)

📋 **프로젝트 상태**: Active Development (2025 Q1)
🚀 **실제 프로젝트 경로**: `/Users/bk/Desktop/viet-kconnect`

## 📑 관련 문서
- **[PRD.md](./PRD.md)**: 제품 요구사항 정의서
- **[EXECUTION_PLAN.md](./EXECUTION_PLAN.md)**: 상세 실행 계획
- **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)**: 장기 로드맵
- **[SPRINT_BACKLOG.md](./SPRINT_BACKLOG.md)**: 현재 스프린트 작업

---

## 📊 프로젝트 개요

### 프로젝트 정보
- **프로젝트명**: Viet K-Connect
- **기간**: 6주 MVP + 3개월 정식 출시
- **목표**: 베트남인 한국 거주자 Q&A 플랫폼 구축
- **팀 구성**: PM(1), Frontend(1), Backend(1), Designer(1), QA(1)
- **현재 상태**: Sprint 1 - Backend Foundation (2025-09-19~)

### 핵심 목표
- ✅ 100명 베타 사용자 확보
- ✅ 30개 시드 콘텐츠 준비
- ✅ 70% 이상 답변률 달성
- ✅ 모바일 최적화 완료

---

## 🎯 기능명세 및 우선순위

### 1. 인증 시스템 (간소화)
| 기능ID | 기능명 | 상세설명 | 우선순위 | 구현 방식 |
|--------|--------|---------|----------|-----------|
| AUTH-001 | 카카오 로그인 | OAuth 2.0 간편 로그인 | P0 | Supabase Auth |
| AUTH-002 | 구글 로그인 | OAuth 2.0 간편 로그인 | P0 | Supabase Auth |
| AUTH-003 | 페이스북 로그인 | OAuth 2.0 간편 로그인 | P0 | Supabase Auth |
| AUTH-004 | 게스트 열람 | 로그인 없이 콘텐츠 열람 | P0 | Public Access |
| AUTH-005 | 프로필 설정 | 이름, 선택 정보 입력 | P0 | Simple Form |

### 2. Q&A 시스템 (핵심)
| 기능ID | 기능명 | 상세설명 | 우선순위 | 기술 스택 |
|--------|--------|---------|----------|-----------|
| QNA-001 | 질문 작성 | 제목, 내용, 카테고리 | P0 | PostgreSQL |
| QNA-002 | AI 자동 분류 | GPT-3.5 카테고리/태그 | **P0** | OpenAI API |
| QNA-003 | 답변 작성 | 마크다운 지원 | P0 | PostgreSQL |
| QNA-004 | 스마트 매칭 | Top 5 전문가 추천 | **P0** | Algorithm |
| QNA-005 | 답변 채택 | 베스트 답변 선택 | P0 | PostgreSQL |

### 3. 번역 시스템
| 기능ID | 기능명 | 상세설명 | 우선순위 | 구현 방식 |
|--------|--------|---------|----------|-----------|
| TRANS-001 | 구글 번역 안내 | 사용 가이드 제공 | P0 | 안내 문구 |
| TRANS-002 | 언어 전환 버튼 | UI 텍스트만 번역 | P1 | i18n |
| TRANS-003 | 커스텀 용어집 | 한-베 특화 용어 | P2 | Dictionary |

### 4. 모바일 최적화
| 기능ID | 기능명 | 상세설명 | 우선순위 | 기술 스택 |
|--------|--------|---------|----------|-----------|
| MOB-001 | 반응형 디자인 | 360px 기준 | **P0** | Tailwind |
| MOB-002 | Bottom Sheet | 모바일 인터랙션 | **P0** | Framer Motion |
| MOB-003 | PWA | 앱 같은 경험 | **P0** | next-pwa |
| MOB-004 | 터치 최적화 | 44px 터치 영역 | **P0** | CSS |

### 5. 알림/공유 시스템
| 기능ID | 기능명 | 상세설명 | 우선순위 | 기술 스택 |
|--------|--------|---------|----------|-----------|
| NOTIF-001 | 카카오톡 공유 | 질문/답변 공유 | **P0** | Kakao SDK |
| NOTIF-002 | 푸시 알림 | 브라우저 알림 | **P0** | FCM |
| NOTIF-003 | 카카오 알림톡 | 중요 알림 | **P0** | Kakao API |
| NOTIF-004 | 인앱 알림 | 실시간 알림 | **P0** | WebSocket |

---

## 📅 3주 개발 일정

### Week 1: Foundation (Day 1-7)

#### Day 1-2: 프로젝트 초기화
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| GitHub Repository 생성 | Backend | 1h | Repository |
| Next.js 14 프로젝트 생성 | Frontend | 2h | 프로젝트 구조 |
| Supabase 프로젝트 생성 | Backend | 1h | 프로젝트 URL |
| 데이터베이스 스키마 설계 | Backend | 4h | ERD 문서 |
| 컴포넌트 라이브러리 설정 | Frontend | 2h | shadcn/ui |

#### Day 3-4: 인증 시스템
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 카카오/구글/페이스북 앱 등록 | Backend | 6h | API Keys |
| Supabase Auth Provider 연동 | Backend | 3h | Auth 설정 |
| 로그인 페이지 레이아웃 | Frontend | 3h | /login 페이지 |
| Auth Context 구현 | Frontend | 3h | AuthContext.tsx |

#### Day 5-7: Q&A 기본 기능
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 질문 CRUD API | Backend | 9h | API 엔드포인트 |
| 질문 작성/목록/상세 UI | Frontend | 10h | Q&A 페이지 |
| 답변 기능 구현 | Backend | 4h | Answer API |
| 답변 UI 컴포넌트 | Frontend | 5h | AnswerForm.tsx |

### Week 2: Core Features (Day 8-14)

#### Day 8-9: AI 통합
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| OpenAI API 설정 | Backend | 2h | API 연동 |
| 질문 분류 프롬프트 작성 | Backend | 3h | Prompt 템플릿 |
| 자동 분류 구현 | Backend | 4h | Classification 함수 |
| 전문가 매칭 알고리즘 | Backend | 7h | Matching API |
| 매칭 결과 UI | Frontend | 3h | ExpertList.tsx |

#### Day 10-11: 모바일 최적화
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 모바일 레이아웃 설계 | Designer | 3h | 모바일 목업 |
| 반응형 디자인 구현 | Frontend | 7h | 모바일 UI |
| Bottom Sheet 컴포넌트 | Frontend | 4h | BottomSheet.tsx |
| PWA 설정 | Frontend | 3h | manifest.json |

#### Day 12-14: 알림 & 공유
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 알림 시스템 구현 | Backend | 6h | Notification API |
| 카카오톡 연동 | Backend | 6h | Kakao API |
| 푸시 알림 설정 | Frontend | 3h | FCM 연동 |
| 공유 기능 UI | Frontend | 2h | ShareButton.tsx |

### Week 3: Polish & Launch (Day 15-21)

#### Day 15-16: 뱃지 & 검색
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 뱃지 시스템 구현 | Backend | 6h | Badge 로직 |
| 검색 기능 구현 | Backend | 5h | Search API |
| 뱃지 표시 UI | Frontend | 4h | BadgeDisplay.tsx |
| 검색 UI 구현 | Frontend | 5h | SearchBar.tsx |

#### Day 17-18: 관리자 도구
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 관리자 권한 체크 | Backend | 2h | Middleware |
| 대시보드 구현 | Frontend | 6h | /admin 페이지 |
| 사용자 관리 UI | Frontend | 6h | UserManagement.tsx |
| 콘텐츠 모더레이션 | Backend | 4h | Moderation API |

#### Day 19-21: 테스트 & 출시
| 작업 | 담당 | 시간 | 산출물 |
|------|------|------|---------|
| 테스트 작성 및 실행 | All | 8h | Test Suite |
| 시드 콘텐츠 작성 | PM | 10h | FAQ 30개 |
| Vercel 배포 | Backend | 6h | 프로덕션 배포 |
| 베타 테스터 모집 | PM | 6h | 50명 모집 |

---

## 📊 리소스 할당

### 팀원별 작업 시간 분배
| 역할 | Week 1 | Week 2 | Week 3 | 총 시간 | 비율 |
|------|--------|--------|--------|---------|------|
| **PM** | 10h | 8h | 22h | 40h | 16.7% |
| **Frontend** | 28h | 32h | 20h | 80h | 33.3% |
| **Backend** | 32h | 28h | 20h | 80h | 33.3% |
| **Designer** | 12h | 10h | 18h | 40h | 16.7% |
| **Total** | 82h | 78h | 80h | 240h | 100% |

### 주요 마일스톤
| 마일스톤 | 날짜 | 완료 조건 | 검증 방법 |
|----------|------|-----------|-----------|
| **M1: 기본 기능** | Day 7 | 로그인 + Q&A CRUD 작동 | 기능 테스트 |
| **M2: AI 통합** | Day 14 | AI 분류 및 모바일 최적화 | 정확도 80%, 모바일 100% |
| **M3: MVP 완성** | Day 18 | 모든 P0 기능 완료 | 체크리스트 |
| **M4: 베타 출시** | Day 21 | 50명 베타 사용자 | 가입 확인 |

---

## ⚠️ 리스크 관리

### 주요 리스크 및 대응 방안
| 리스크 | 확률 | 영향 | 위험도 | 대응 전략 |
|--------|------|------|--------|----------|
| **초기 사용자 부족** | 높음 | 심각 | 🔴 높음 | 시드 콘텐츠 30개, 베타 테스터 사전 모집 |
| **AI API 비용 초과** | 중간 | 중간 | 🟡 중간 | Rate limiting, 캐싱 적용 |
| **모바일 호환성** | 중간 | 높음 | 🟠 중상 | 다양한 디바이스 테스트, PWA 우선 |
| **OAuth 설정 지연** | 중간 | 높음 | 🟠 중상 | 이메일 로그인 백업 준비 |
| **서버 과부하** | 낮음 | 높음 | 🟡 중간 | Vercel auto-scaling, CDN 활용 |

---

## 🎯 성공 지표 (KPI)

### 기술 지표
- ✅ 페이지 로딩: < 2초
- ✅ AI 분류 정확도: > 80%
- ✅ 모바일 반응형: 100%
- ✅ 에러율: < 1%

### 사용자 지표
- ✅ 주간 활성 사용자: > 100명 (Week 4)
- ✅ 답변률: > 70%
- ✅ 평균 답변 시간: < 12시간
- ✅ NPS: > 40

### 콘텐츠 지표
- ✅ 시드 콘텐츠: 30개
- ✅ 일일 질문: > 10개 (Week 4)
- ✅ 답변 품질: > 4.0/5.0

### 전환율 퍼널 (Conversion Funnel)

#### 사용자 획득 퍼널
```
방문자 (100%)
  ↓ 30% (목표)
회원가입 (30%)
  ↓ 50% (목표)
첫 질문 작성 (15%)
  ↓ 70% (목표)
답변 받음 (10.5%)
  ↓ 60% (목표)
활성 사용자 (6.3%)
```

#### 참여도 퍼널
```
질문 페이지 방문 (100%)
  ↓ 40%
질문 작성 시작 (40%)
  ↓ 70%
질문 작성 완료 (28%)
  ↓ 80%
답변 받음 (22.4%)
  ↓ 60%
베스트 답변 채택 (13.4%)
```

### A/B 테스트 계획

#### Test 1: 홈페이지 레이아웃
| Version | Design | Hypothesis | Metrics | Duration |
|---------|--------|------------|---------|----------|
| A (Control) | 질문 우선형 | 직접 질문이 더 효과적 | 질문 작성률 | 2 weeks |
| B (Variant) | 검색 우선형 | 정보 탐색이 더 중요 | 검색 사용률 | 2 weeks |

**Success Criteria**: 질문 작성률 15% 이상 차이

#### Test 2: 가입 플로우
| Version | Flow | Hypothesis | Metrics | Duration |
|---------|------|------------|---------|----------|
| A | 즉시 가입 | 빠른 가입이 좋음 | 가입 완료율 | 1 week |
| B | 프로필 설정 포함 | 초기 정보가 중요 | 7일 리텐션 | 1 week |

**Success Criteria**: 7일 리텐션 10% 이상 개선

#### Test 3: AI 매칭 표시
| Version | Display | Hypothesis | Metrics | Duration |
|---------|---------|------------|---------|----------|
| A | 자동 매칭 | 편의성 우선 | 답변률 | 2 weeks |
| B | 선택형 매칭 | 통제감 제공 | 답변 품질 | 2 weeks |

**Success Criteria**: 답변률 또는 품질 점수 20% 개선

---

## ✅ MVP 체크리스트

### 개발 완료 기준
- [ ] **인증**: 3개 소셜 로그인 작동
- [ ] **Q&A**: CRUD 완벽 작동
- [ ] **AI**: 분류 정확도 80% 달성
- [ ] **모바일**: 5개 디바이스 테스트 통과
- [ ] **알림**: 카카오톡 공유 작동
- [ ] **번역**: 안내 문구 표시

### 콘텐츠 준비
- [ ] FAQ 30개 작성
- [ ] 카테고리별 3개씩 시드 질문
- [ ] 베타 테스터 50명 모집
- [ ] 사용 가이드 작성

### 운영 준비
- [ ] 이용약관/개인정보처리방침
- [ ] Google Analytics 설정
- [ ] Sentry 에러 트래킹
- [ ] 백업 시스템 구축

---

## 📈 확장 계획

### Phase 1: 백엔드 통합 (Week 4-6)
- Supabase 데이터베이스 연동
- 실제 사용자 인증 시스템
- Real-time 알림 구현

### Phase 2: 기능 완성 (Month 2-3)
- AI 기반 질문 분류 고도화
- 전문가 매칭 알고리즘 개선
- 답변 보장 시스템 구축

### Phase 3: 고도화 (Month 4+)
- PWA 고급 기능
- 다국어 자동 번역
- 고급 분석 도구
- 커뮤니티 기능 확장

---

## 💡 번역 전략 상세

### Phase 1 (MVP): 구글 번역 활용
```typescript
const TranslationGuide = () => (
  <div className="bg-blue-50 p-3 rounded-lg mb-4">
    <p className="text-sm">
      🌐 Tiếng Việt: Nhấp vào biểu tượng dịch trên Chrome
      <br />
      💡 한국어: Chrome 번역 기능을 사용하세요
    </p>
  </div>
);
```

### Phase 2 (3개월+): 선택적 API 번역
```typescript
const TRANSLATION_PRIORITY = {
  high: [
    "UI 텍스트",      // 버튼, 메뉴
    "카테고리",       // 10개 카테고리명
    "시스템 메시지"   // 알림, 에러
  ],
  medium: [
    "질문 제목",      // 검색/목록용
    "인기 FAQ"        // 자주 찾는 질문
  ],
  low: [
    "사용자 콘텐츠", // 구글 번역 의존
    "답변 내용"       // 구글 번역 의존
  ]
};
```

---

## 🔧 유용한 명령어

### 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 테스트 실행
npm run test

# 린트 검사
npm run lint

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 삽입
npm run db:seed

# Vercel 배포
npm run deploy
```

### Git 워크플로우
```bash
# 이슈별 브랜치 생성
git checkout -b feature/issue-42-login

# 커밋 메시지 규칙
git commit -m "feat: Add social login functionality"

# PR 생성
gh pr create --title "Add social login" --body "Implements OAuth login"
```

---

## 📞 커뮤니케이션 계획

### 협업 도구
- **GitHub**: 코드 관리, 이슈 트래킹
- **Slack**: 실시간 커뮤니케이션
- **Notion**: 문서 관리
- **Figma**: 디자인 협업

### 회의 일정
| 회의 | 시간 | 참석자 | 목적 |
|------|------|--------|------|
| **Daily Standup** | 매일 10:00 | 전체 | 진행 상황 공유 |
| **Sprint Planning** | 월요일 14:00 | 전체 | 주간 계획 |
| **Code Review** | 금요일 15:00 | Dev Team | 코드 품질 |
| **Retrospective** | 금요일 17:00 | 전체 | 회고 |

---

## 📝 결론

### 핵심 성공 요인
1. **단순함**: 복잡한 기능 제거, 핵심에 집중
2. **접근성**: 로그인 없이 시작, 구글 번역 활용
3. **AI 우선**: 사용자 경험 자동 개선
4. **모바일**: 완벽한 모바일 경험

### Next Steps (레거시 프로젝트 기준)
1. GitHub repo 생성
2. Supabase 프로젝트 생성
3. OAuth 앱 등록 (카카오, 구글, 페이스북)
4. Next.js 14 프로젝트 초기화
5. 팀 킥오프 미팅

---

## 🔗 관련 문서

- `PROJECT_OVERVIEW.md`: 프로젝트 개요
- `TECHNICAL_DOCS.md`: 기술 문서 및 아키텍처
- `METHODOLOGY.md`: 개발 방법론
- `create-designs.md`: 테마 시스템
- `WBS_SOLUTION.md`: WBS 오류 해결 방안 (신규 생성)

## 📋 WBS 기능 통합

### Excel WBS 참조 파일 (상위 디렉토리)
```
../Viet_K_Connect_Specification_WBS.xlsx    # 상세 WBS 스펙
../Viet_K_Connect_System_Architecture.xlsx  # 시스템 아키텍처
../Viet_K_Connect_User_Flow_Pages.xlsx      # 사용자 플로우
```

### 대체 문서 매핑
- `WBS_Execution_Plan.md` → **이 문서 (PROJECT_PLAN.md)**
- `WBS.md` → **이 문서의 "기능명세 및 우선순위" 섹션**
- 상세 작업 분해 → **METHODOLOGY.md 참조**

---

## 📊 프로젝트 추적

### GitHub Repository
- **Main**: github.com/viet-kconnect/app
- **Issues**: GitHub Issues로 작업 추적
- **Projects**: GitHub Projects 칸반 보드 사용

### 현재 Sprint (Sprint 1)
- **기간**: 2025-09-19 ~ 2025-10-02
- **목표**: Backend Foundation
- **진행률**: 10% (6/76 Story Points)
- **상세**: [SPRINT_BACKLOG.md](./SPRINT_BACKLOG.md) 참조

### 업데이트된 마일스톤 계획 (2025)
- **M1**: 프로젝트 정리 및 기초 정비 (01/24~02/07)
- **M2**: 백엔드 인프라 완성 (02/08~02/21)
- **M3**: 핵심 기능 구현 (02/22~03/14)
- **M4**: UI/UX 완성 및 모바일 최적화 (03/15~03/28)
- **M5**: 품질 보증 및 테스트 (03/29~04/11)
- **M6**: 베타 런칭 준비 (04/12~04/25)

**📋 상세 계획**: [MILESTONES.md](./MILESTONES.md) 참조  
**🔍 이슈 분석**: [ISSUE_ANALYSIS.md](./ISSUE_ANALYSIS.md) 참조

---

*이 문서는 Viet K-Connect 프로젝트의 마스터 계획 문서입니다.*
*실제 구현은 `/Users/bk/Desktop/viet-kconnect/`에서 진행합니다.*
*최종 업데이트: 2025-09-19 18:45*