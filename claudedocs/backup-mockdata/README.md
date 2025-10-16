# 📦 Mock 데이터 백업 가이드

**목적**: Mock 데이터를 JSON 파일로 백업하여 DB 마이그레이션 시 참조 및 복원 가능하도록 보존

---

## 📁 백업 파일 구조

```
/claudedocs/backup-mockdata/
├── README.md (본 파일)
├── users-full.json (전체 사용자 목업)
├── questions-full.json (전체 질문 목업)
├── answers-full.json (전체 답변 목업)
├── posts-full.json (전체 정보글 목업)
├── banners-full.json (배너 목업)
└── mapping-guide.md (Mock ID → DB UUID 매핑 가이드)
```

---

## 🎯 백업 대상 데이터

### 1. users-full.json
**출처**: `lib/data/mockData.ts`
**포함 데이터**:
- VIETNAMESE_EXPERTS (베트남인 전문가, 약 70%)
- KOREAN_EXPERTS (한국인 전문가)
- REGULAR_USERS (일반 사용자)
- ADMIN_USER (관리자)

**DB 매핑**:
```typescript
// Mock 데이터 예시
{
  id: "expert-001",
  email: "nguyen@example.com",
  name: "Nguyễn Văn A",
  role: "verified"
}

// DB 변환 필요
{
  id: "UUID로 변환",  // gen_random_uuid()
  email: "nguyen@example.com",
  name: "Nguyễn Văn A",
  role: "verified",
  verification_status: "approved"
}
```

**선정 기준** (Phase 1.1):
- VIETNAMESE_EXPERTS: 5-7명 대표 선정
- KOREAN_EXPERTS: 2-3명 선정
- REGULAR_USERS: 2-3명 선정
- ADMIN_USER: 1명 필수

**총 목표**: 10-15명

---

### 2. questions-full.json
**출처**: `lib/data/mockData.ts` → `MOCK_QUESTIONS`
**포함 데이터**:
- 질문 ID (예: 'q1', 'q2', 'q3'...)
- 제목, 내용
- 작성자 ID
- 카테고리 (기존 Mock 카테고리)
- 태그, 조회수, 답변수 등

**DB 매핑**:
```typescript
// Mock 데이터 예시
{
  id: "q1",
  title: "E-9 비자 연장은 어디서 하나요?",
  authorId: "expert-001",
  category: "visa",  // Mock 카테고리명
  tags: ["E-9", "비자연장"]
}

// DB 변환 필요
{
  id: "UUID로 변환",
  title: "E-9 비자 연장은 어디서 하나요?",
  author_id: "users 테이블 UUID 매핑",
  category_id: 17,  // "비자/법률" 카테고리 (DB ID)
  tags: ["E-9", "비자연장"]
}
```

**카테고리 매핑** (Mock → DB):
```
visa → 17 (비자/법률)
employment → 18 (취업/창업)
housing → 19 (주거/부동산)
education → 20 (교육/학업)
medical → 21 (의료/건강)
finance → 22 (금융/세금)
culture → 23 (문화/생활)
transportation → 24 (교통/통신)
```

**선정 기준** (Phase 1.2):
- 카테고리별 2-3개 질문 선정
- 총 16-24개 질문
- 다양한 urgency 레벨 포함 (high, normal, low)
- 조회수가 높은 질문 우선

---

### 3. answers-full.json
**출처**: `lib/data/mockData.ts` → `MOCK_ANSWERS`
**포함 데이터**:
- 답변 ID
- 답변 내용
- 질문 ID (외래키)
- 작성자 ID
- 채택 여부, 도움됨 수 등

**DB 매핑**:
```typescript
// Mock 데이터 예시
{
  id: "a1",
  content: "E-9 비자 연장은...",
  questionId: "q1",
  authorId: "expert-001",
  isAccepted: true,
  helpfulCount: 15
}

// DB 변환 필요
{
  id: "UUID로 변환",
  content: "E-9 비자 연장은...",
  question_id: "questions 테이블 UUID 매핑",
  author_id: "users 테이블 UUID 매핑",
  is_accepted: true,
  helpful_count: 15
}
```

**선정 기준** (Phase 1.3):
- 선정된 질문(1.2)에 대한 답변만 포함
- 질문당 2-4개 답변
- 총 32-96개 답변 예상
- Certified User(verified) 답변 우선 포함

---

### 4. posts-full.json
**출처**: `lib/data/mockData.ts` → `MOCK_POSTS`
**포함 데이터**:
- 정보글 ID
- 제목, 내용
- 작성자 ID
- 카테고리

**DB 매핑**:
```typescript
// Option A: questions 테이블 사용 (type='post' 추가)
{
  id: "UUID",
  title: "한국 생활 정보",
  content: "...",
  author_id: "UUID",
  category_id: 23,  // 문화/생활
  type: "post"  // 질문과 구분
}

// Option B: 별도 posts 테이블 생성
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  content TEXT,
  ...
)
```

**선정 기준** (Phase 3.1):
- 최신 정보글 5-8개 선정
- Sidebar 뉴스용 데이터 3개 포함
- 다양한 주제 분포

---

### 5. banners-full.json
**출처**: `lib/data/mockData.ts` → `MOCK_BANNERS`
**포함 데이터**:
- 배너 제목, 설명
- 이미지 URL
- 링크 URL
- 배경색

**DB 매핑**:
```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  background_color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**선정 기준** (Phase 4.1):
- 현재 MOCK_BANNERS 전체 포함 (3-5개)
- 우선순위: 최저 (선택사항)

---

## 🔄 백업 파일 생성 방법

### 방법 1: Node.js 스크립트 생성
```javascript
// scripts/backup-mock-data.js
import fs from 'fs';
import {
  VIETNAMESE_EXPERTS,
  KOREAN_EXPERTS,
  MOCK_QUESTIONS,
  MOCK_ANSWERS
} from '../lib/data/mockData';

// 사용자 데이터 백업
const users = [
  ...VIETNAMESE_EXPERTS,
  ...KOREAN_EXPERTS,
  ...REGULAR_USERS,
  ADMIN_USER
];

fs.writeFileSync(
  'claudedocs/backup-mockdata/users-full.json',
  JSON.stringify(users, null, 2),
  'utf-8'
);

// 질문 데이터 백업
fs.writeFileSync(
  'claudedocs/backup-mockdata/questions-full.json',
  JSON.stringify(MOCK_QUESTIONS, null, 2),
  'utf-8'
);

console.log('✅ Mock 데이터 백업 완료');
```

**실행**:
```bash
node scripts/backup-mock-data.js
```

---

### 방법 2: 수동 복사
1. `lib/data/mockData.ts` 파일 열기
2. 각 Mock 데이터 배열 복사
3. JSON 파일로 저장

---

## 📋 mapping-guide.md 구조

```markdown
# Mock ID → DB UUID 매핑 가이드

## 사용자 매핑
| Mock ID | 이름 | DB UUID | Role |
|---------|------|---------|------|
| expert-001 | Nguyễn Văn A | 00000000-0000-0000-0000-000000000001 | verified |
| expert-002 | Trần Thị B | 00000000-0000-0000-0000-000000000002 | verified |
| admin-001 | 관리자 | 00000000-0000-0000-0000-000000000099 | admin |

## 질문 매핑
| Mock ID | 제목 | DB UUID | Category |
|---------|------|---------|----------|
| q1 | E-9 비자 연장 | 10000000-0000-0000-0000-000000000001 | 17 |
| q2 | 취업 비자 변경 | 10000000-0000-0000-0000-000000000002 | 18 |
```

---

## 🔨 SQL 스크립트 생성 예시

### scripts/1-seed-users.sql
```sql
-- Phase 1.1: 사용자 데이터 INSERT
INSERT INTO users (
  id, email, name, avatar_url, bio,
  role, verification_status, verification_type,
  visa_type, company, years_in_korea, region,
  specialty_areas, is_verified, trust_score,
  question_count, answer_count, helpful_answer_count
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'nguyen@example.com',
  'Nguyễn Văn A',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen',
  'E-9 비자 전문가입니다.',
  'verified',
  'approved',
  'work',
  'E-9',
  '삼성전자',
  5,
  '경기',
  ARRAY['visa', 'employment'],
  true,
  95,
  0,
  42,
  38
),
(...다음 사용자);
```

---

## ✅ 백업 체크리스트

### Phase 1 준비
- [ ] users-full.json 생성 (전체 사용자 목업)
- [ ] 대표 사용자 10-15명 선정
- [ ] mapping-guide.md 사용자 섹션 작성
- [ ] scripts/1-seed-users.sql 작성

### Phase 1.2 준비
- [ ] questions-full.json 생성
- [ ] 카테고리별 질문 2-3개 선정 (총 16-24개)
- [ ] Mock 카테고리 → DB category_id 매핑
- [ ] mapping-guide.md 질문 섹션 작성
- [ ] scripts/2-seed-questions.sql 작성

### Phase 1.3 준비
- [ ] answers-full.json 생성
- [ ] 선정된 질문에 대한 답변 선택 (질문당 2-4개)
- [ ] mapping-guide.md 답변 섹션 작성
- [ ] scripts/3-seed-answers.sql 작성

### Phase 3 준비
- [ ] posts-full.json 생성
- [ ] 정보글 5-8개 선정
- [ ] scripts/7-seed-posts.sql 작성

### Phase 4 준비
- [ ] banners-full.json 생성
- [ ] scripts/10-seed-banners.sql 작성

---

## 🔗 관련 문서

- [마스터 플랜](../DB_MIGRATION_MASTER_PLAN.md) - 전체 4 Phase 계획
- [진행 상황](../DB_MIGRATION_PROGRESS.md) - 95개 작업 체크리스트
- [세션 로그](../DB_MIGRATION_SESSION_LOG.md) - 시간순 작업 기록

---

## 📌 주의 사항

### UUID 형식
- ✅ 올바른 형식: `'00000000-0000-0000-0000-000000000001'`
- ❌ 잘못된 형식: `'test-user-001'`, `'user-1'`

### Category ID
- ✅ 실제 DB ID 사용: 17-24
- ❌ Mock 이름 사용 금지: 'visa', 'employment'

### Author ID / Question ID
- 반드시 users 테이블에 존재하는 UUID 참조
- 반드시 questions 테이블에 존재하는 UUID 참조
- Foreign Key 제약 위반 주의

### 한국어 텍스트
- UTF-8 인코딩 필수
- SQL 파일 저장 시 인코딩 확인
- Supabase SQL Editor에서는 한글 입력 정상 동작

---

## 🚀 다음 단계

1. **백업 파일 생성**: 위 체크리스트 따라 JSON 파일 생성
2. **데이터 선정**: Phase 1에 필요한 대표 데이터 선정
3. **SQL 스크립트 작성**: INSERT 문 작성 및 검증
4. **DB 실행**: Supabase SQL Editor에서 실행
5. **검증**: SELECT 쿼리로 데이터 확인
6. **페이지 테스트**: 실제 페이지에서 정상 표시 확인

**시작**: Phase 1.1 사용자 데이터부터 시작하세요! 🎯
