# Agent 4: DB 스키마 구현

**담당 이슈**: #42 (데이터베이스 스키마 구현)
**브랜치**: `feature/issue-42-database`
**우선순위**: 🟡 일반 (Agent 7의 의존성)

---

## 🎯 핵심 목표

### 완전한 DB 스키마 설계
- 사용자, 질문, 답변, 카테고리 테이블
- 관계 설정 및 제약 조건
- 인덱스 최적화
- Row Level Security (RLS) 정책

### 테이블 구조
```sql
-- 주요 테이블들
users (id, email, name, avatar_url, bio, created_at)
categories (id, name, slug, description, icon, color)
questions (id, title, content, user_id, category_id, tags, created_at)
answers (id, content, question_id, user_id, is_accepted, created_at)
votes (id, user_id, target_id, target_type, vote_type)
comments (id, content, target_id, target_type, user_id, created_at)
```

---

## 🔧 주요 작업

### 스키마 설계
- [ ] ERD 다이어그램 작성
- [ ] 테이블 구조 정의
- [ ] 관계 설정 (Foreign Keys)
- [ ] 제약 조건 및 검증 규칙

### Supabase 구현
- [ ] SQL 마이그레이션 스크립트
- [ ] RLS 보안 정책 설정
- [ ] 인덱스 생성 (검색 최적화)
- [ ] 트리거 함수 (자동 업데이트)

### 테스트 및 검증
- [ ] 스키마 유효성 검증
- [ ] 성능 테스트
- [ ] 보안 정책 테스트
- [ ] Agent 7의 목업 데이터 삽입 준비

**담당자**: Agent 4