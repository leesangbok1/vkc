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

## 🚨 **Agent 1 지시사항 (2025-09-30)**

### **대기 상태**: Agent 3 Supabase 설정 완료 후 시작

### **독립적 작업 영역**
- **폴더**: `/lib/database/`, `/scripts/db/`
- **파일**: `schema.sql`, `migrations/`, `seed.sql`
- **충돌 방지**: Agent 3, 5와 완전 분리된 영역

### **구체적 작업 지시**
1. **ERD 설계**: Agent 7의 600개 목업 데이터 구조 분석
2. **SQL 스키마**: PostgreSQL 테이블 생성 스크립트
3. **RLS 정책**: Row Level Security 보안 설정
4. **인덱스 최적화**: 검색 성능을 위한 인덱스 설계

### **🎉 Agent 3 완료 신호 수신됨**
- ✅ Supabase 클라이언트 구조 완성
- ✅ Database Types 정의 완료 (users, questions, answers)
- ✅ Mock 환경변수 설정 완료

### **🚀 즉시 작업 시작 가능**
**현재 시간**: 2025-09-30 오후
**병렬 작업**: Agent 5와 독립적으로 동시 진행
**예상 완료**: 2-3시간 이내

---

## 📋 **Agent 4 작업 완료 보고 양식**

**완료 시 이 파일에 추가할 내용:**
```
## ✅ Agent 4 작업 완료 보고 (날짜/시간)

### 생성한 파일들
- [ ] lib/database/schema.sql
- [ ] lib/database/migrations/001_initial.sql
- [ ] scripts/db/seed.sql
- [ ] scripts/db/setup.sql

### 구현한 테이블들
- [ ] users (사용자)
- [ ] categories (카테고리)
- [ ] questions (질문)
- [ ] answers (답변)
- [ ] votes (투표)
- [ ] comments (댓글)

### RLS 정책 설정
- [ ] 사용자별 데이터 접근 제한
- [ ] 공개/비공개 게시글 정책
- [ ] 관리자 권한 설정

### 테스트 결과
- [ ] 스키마 생성 성공
- [ ] Agent 7 목업 데이터 삽입 성공
- [ ] 쿼리 성능 테스트 통과

### 다음 Agent 준비 완료
- [ ] Agent 5 인증 시스템에서 DB 사용 가능
- [ ] Agent 7 CRUD API와 DB 연결 가능
```

**담당자**: Agent 4