# 🔗 Mock ID → DB UUID 매핑 가이드

**작성일**: 2025-01-16
**목적**: Mock 데이터 ID와 실제 DB UUID 간의 매핑 관계 문서화

---

## 📊 사용자 매핑 (Phase 1.1)

### 🇻🇳 베트남인 전문가 (6명)

| Mock ID | 이름 | DB UUID | Role | Visa | Years | Specialty |
|---------|------|---------|------|------|-------|-----------|
| ve1 | Nguyễn Văn Hùng | `00000000-0000-0000-0000-000000000001` | verified | E-9 | 7 | 비자 연장 전문 |
| ve2 | Trần Minh Đức | `00000000-0000-0000-0000-000000000002` | verified | F-5 | 9 | 영주권 신청 전문 |
| ve3 | Lê Văn Toàn | `00000000-0000-0000-0000-000000000003` | verified | E-7 | 6 | E-9→E-7 전환 전문 |
| ve6 | Võ Thị Mai | `00000000-0000-0000-0000-000000000004` | verified | F-6 | 6 | F-6 비자 전문 |
| ve10 | Ngô Thị Linh | `00000000-0000-0000-0000-000000000005` | verified | D-4 | 3 | D-4 어학연수 전문 |
| ve12 | Nguyễn Thị Lan | `00000000-0000-0000-0000-000000000006` | verified | E-7 | 6 | 통역·번역 전문 |

---

### 🇰🇷 한국인 전문가 (3명)

| Mock ID | 이름 | DB UUID | Role | Specialty |
|---------|------|---------|------|-----------|
| ke1 | 이민수 변호사 | `00000000-0000-0000-0000-000000000007` | verified | 이민법 전문 |
| ke2 | 김태희 노무사 | `00000000-0000-0000-0000-000000000008` | verified | 노동법 전문 |
| ke3 | 박성준 행정사 | `00000000-0000-0000-0000-000000000009` | verified | 비자 행정 전문 |

---

### 👤 일반 사용자 (3명)

| Mock ID | 이름 | DB UUID | Role | Visa | Years |
|---------|------|---------|------|------|-------|
| u1 | 베트남노동자 | `00000000-0000-0000-0000-000000000010` | user | E-9 | 2 |
| u5 | 장기체류자 | `00000000-0000-0000-0000-000000000011` | user | F-2 | 5 |
| u8 | 베트남유학생 | `00000000-0000-0000-0000-000000000012` | user | D-2 | 1 |

---

### 👑 관리자 (1명)

| Mock ID | 이름 | DB UUID | Role |
|---------|------|---------|------|
| admin1 | VietKConnect 관리자 | `00000000-0000-0000-0000-000000000099` | admin |

---

## 🔢 UUID 생성 규칙

### 패턴
```
일반 사용자: 00000000-0000-0000-0000-0000000000XX (01~20)
관리자: 00000000-0000-0000-0000-000000000099
```

### 다음 Phase 예약 UUID
```
Phase 1.2 질문 데이터: 10000000-0000-0000-0000-0000000000XX
Phase 1.3 답변 데이터: 20000000-0000-0000-0000-0000000000XX
Phase 3.1 정보글 데이터: 30000000-0000-0000-0000-0000000000XX
```

---

## 🗂️ 카테고리 매핑

Mock 카테고리명과 DB category_id 매핑:

| Mock Category | 한국어 이름 | DB ID | Slug |
|---------------|------------|-------|------|
| visa | 비자/법률 | 17 | visa |
| employment | 취업/창업 | 18 | employment |
| housing | 주거/부동산 | 19 | housing |
| education | 교육/학업 | 20 | education |
| medical | 의료/건강 | 21 | medical |
| finance | 금융/세금 | 22 | finance |
| culture | 문화/생활 | 23 | culture |
| transportation | 교통/통신 | 24 | transportation |

---

## 📝 매핑 사용 예시

### SQL에서 사용자 참조
```sql
-- Mock ve1 → DB UUID
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Mock ke1 → DB UUID
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000007';
```

### Phase 1.2 질문 데이터 작성 시
```sql
-- Mock 질문 q1의 author가 ve1이라면
INSERT INTO questions (
  id,
  title,
  content,
  author_id,  -- ve1 → 00000000-0000-0000-0000-000000000001
  category_id, -- 'visa' → 17
  ...
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '질문 제목',
  '질문 내용',
  '00000000-0000-0000-0000-000000000001',  -- ve1 매핑
  17,  -- visa 카테고리 매핑
  ...
);
```

---

## ⚠️ 주의 사항

### UUID 형식
- ✅ 올바른 형식: `'00000000-0000-0000-0000-000000000001'`
- ❌ 잘못된 형식: `'ve1'`, `'user-1'`, `'test-user'`

### Category ID
- ✅ DB ID 사용: `17`, `18`, `19`...
- ❌ Mock 이름 사용 금지: `'visa'`, `'employment'`

### Foreign Key 참조
- `author_id`는 반드시 **users 테이블에 존재하는 UUID** 참조
- `category_id`는 반드시 **categories 테이블에 존재하는 ID** 참조 (17~24)
- `question_id`는 반드시 **questions 테이블에 존재하는 UUID** 참조

---

## 🔄 다음 Phase 매핑 작업

### Phase 1.2: 질문 데이터
- [ ] Mock MOCK_QUESTIONS에서 대표 질문 16-24개 선정
- [ ] Mock question ID → DB UUID 매핑 (10000000-0000-0000-0000-XXXX)
- [ ] Mock author ID → users 테이블 UUID 매핑
- [ ] Mock category → categories 테이블 ID 매핑 (17-24)
- [ ] mapping-guide.md 업데이트

### Phase 1.3: 답변 데이터
- [ ] Mock MOCK_ANSWERS에서 선정된 질문의 답변 선택
- [ ] Mock answer ID → DB UUID 매핑 (20000000-0000-0000-0000-XXXX)
- [ ] Mock question_id → questions 테이블 UUID 매핑
- [ ] Mock author_id → users 테이블 UUID 매핑
- [ ] mapping-guide.md 업데이트

---

## 📚 참고 문서

- [마스터 플랜](../DB_MIGRATION_MASTER_PLAN.md)
- [진행 상황](../DB_MIGRATION_PROGRESS.md)
- [세션 로그](../DB_MIGRATION_SESSION_LOG.md)
- [백업 가이드](./README.md)
