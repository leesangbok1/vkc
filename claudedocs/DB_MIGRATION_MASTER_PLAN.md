# 🗄️ VietKConnect DB 연동 마스터 플랜

> 본 문서는 설계/레퍼런스 용도입니다. 진행 상황과 체크리스트는 `claudedocs/PROGRESS.md`에서 단일 관리합니다.

**작성일**: 2025-01-16
**버전**: 1.0
**상태**: 진행 중

---

## 📊 프로젝트 현황 분석

### ✅ 완료된 작업
1. **Supabase 연결 설정** - .env.local 설정 완료
2. **데이터베이스 스키마** - 7개 테이블 생성 완료
3. **카테고리 데이터** - 8개 카테고리 입력 완료 (ID: 17-24)
4. **Header 카테고리** - `/api/categories` 연동 완료
5. **한국어 검색** - 'simple' 텍스트 검색 설정 완료

### 📁 Mock 데이터 구조
- **파일**: `lib/data/mockData.ts` (4,661줄)
- **VIETNAMESE_EXPERTS**: 베트남인 전문가 사용자 (~70%)
- **KOREAN_EXPERTS**: 한국인 전문가 사용자
- **REGULAR_USERS**: 일반 사용자
- **ADMIN_USER**: 관리자
- **MOCK_QUESTIONS**: 질문 데이터 (id: 'q1', 'q2'...)
- **MOCK_ANSWERS**: 답변 데이터
- **MOCK_POSTS**: 정보글 데이터
- **MOCK_BANNERS**: 배너 데이터

### ⚠️ 발견된 문제점
1. 페이지마다 목업 데이터 중복 정의 (topics/[slug]/page.tsx)
2. 목업 데이터 타입과 DB 스키마 일부 불일치
3. Sidebar 뉴스 하드코딩

---

## 🔴 Phase 1: 핵심 데이터 (최고 우선순위)

### 1.1 사용자 데이터 (users 테이블)
**목표**: 테스트용 대표 사용자 10-15명

**작업**:
1. VIETNAMESE_EXPERTS에서 대표 5-7명 선정
2. KOREAN_EXPERTS에서 대표 2-3명 선정
3. REGULAR_USERS에서 일반 사용자 2-3명 선정
4. ADMIN_USER 1명 추가
5. SQL 스크립트 생성: `scripts/1-seed-users.sql`

**백업**: `claudedocs/backup-mockdata/users-full.json`

**영향 범위**:
- Header 사용자 정보
- 프로필 페이지 (app/profile/page.tsx)
- 질문/답변 작성자 정보
- 팔로우/인증 시스템

---

### 1.2 질문 데이터 (questions 테이블)
**목표**: 카테고리별 대표 질문 2-3개씩 (총 16-24개)

**작업**:
1. MOCK_QUESTIONS에서 카테고리별 대표 질문 선정
2. 각 카테고리(17-24)에 매칭
3. author_id를 1.1에서 생성한 사용자 UUID로 매핑
4. SQL 스크립트 생성: `scripts/2-seed-questions.sql`

**백업**: `claudedocs/backup-mockdata/questions-full.json`

**영향 범위**:
- 메인 페이지 (app/page.tsx) - MOCK_FEED
- 질문 목록 (app/questions/page.tsx)
- 질문 상세 (app/questions/[id]/page.tsx)
- 토픽 페이지 (app/topics/[slug]/page.tsx)
- 사용자 프로필
- 검색 결과
- 팔로잉 피드

---

### 1.3 답변 데이터 (answers 테이블)
**목표**: 주요 질문당 2-4개 답변 (총 32-96개)

**작업**:
1. MOCK_ANSWERS에서 1.2 질문에 해당하는 답변 선정
2. question_id, author_id 매핑
3. Certified User 답변 우선 포함
4. SQL 스크립트 생성: `scripts/3-seed-answers.sql`

**백업**: `claudedocs/backup-mockdata/answers-full.json`

**영향 범위**:
- 질문 상세 페이지 답변 리스트
- 사용자 프로필 - 작성 답변 목록
- Certified User 답변 표시

---

## 🟡 Phase 2: 인터랙션 데이터 (중요)

### 2.1 투표 데이터 (votes 테이블)
**작업**:
```sql
-- scripts/4-seed-votes.sql
-- 질문/답변에 대한 초기 투표 데이터
```

**API 연동 필요**:
- `/api/questions/[id]/vote` → votes 테이블 INSERT
- `/api/answers/[id]/helpful` → votes 테이블 INSERT

**영향 범위**:
- ActionBar - 도움됨 버튼
- 질문/답변 upvote_count
- 통계 계산

---

### 2.2 알림 데이터 (notifications 테이블)
**작업**:
```sql
-- scripts/5-seed-notifications.sql
-- 사용자별 초기 알림 5-10개
```

**영향 범위**:
- Header NotificationCenter 컴포넌트
- 알림 페이지 (app/notifications/page.tsx)
- 실시간 알림 구독

---

### 2.3 북마크 시스템 (신규 테이블)
**스키마**:
```sql
-- scripts/6-create-bookmarks-table.sql
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('question', 'post', 'answer')),
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, target_id, target_type)
);
```

**API 추가 필요**:
- `GET /api/bookmarks` - 사용자 북마크 목록
- `POST /api/bookmarks` - 북마크 추가
- `DELETE /api/bookmarks/[id]` - 북마크 삭제

---

## 🟢 Phase 3: 콘텐츠 데이터 (중간 우선순위)

### 3.1 정보글 데이터
**작업 옵션**:
- Option A: questions 테이블에 type='post' 추가
- Option B: 별도 posts 테이블 생성

**작업**:
```sql
-- scripts/7-seed-posts.sql
-- 최신 정보글 5-8개
-- Sidebar 뉴스용 데이터 포함
```

**API 추가**:
- `GET /api/posts` - 정보글 목록
- `GET /api/posts/[id]` - 정보글 상세

**영향 범위**:
- 메인 페이지 통합 피드
- 정보글 상세 (app/posts/[id]/page.tsx)
- Sidebar 최신 뉴스 3개

---

### 3.2 팔로우 시스템 (신규 테이블)
**스키마**:
```sql
-- scripts/9-create-follows-table.sql
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, category_id)
);
```

---

## 🟣 Phase 4: 관리자 기능 (낮은 우선순위)

### 4.1 배너 데이터
```sql
-- scripts/10-create-banners-table.sql
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  background_color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

### 4.2 인증 관리
```sql
-- scripts/11-create-certifications-table.sql
CREATE TABLE IF NOT EXISTS certification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type VARCHAR(20) NOT NULL,
  document_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);
```

---

## 📦 백업 파일 구조

```
/claudedocs/backup-mockdata/
├── README.md (백업 가이드)
├── users-full.json (전체 사용자 목업)
├── questions-full.json (전체 질문 목업)
├── answers-full.json (전체 답변 목업)
├── posts-full.json (전체 정보글 목업)
├── banners-full.json (배너 목업)
└── mapping-guide.md (ID 매핑 가이드)
```

---

## 🔄 페이지별 DB 연동 상태

| 페이지 | Mock 데이터 | DB 연동 필요 | 우선순위 |
|--------|-------------|-------------|---------|
| app/page.tsx | MOCK_FEED | ✅ 질문+정보글 | 🔴 최고 |
| app/questions/page.tsx | - | ✅ 질문 목록 | 🔴 최고 |
| app/questions/[id]/page.tsx | MOCK_QUESTIONS + MOCK_ANSWERS | ✅ 질문+답변 | 🔴 최고 |
| app/topics/[slug]/page.tsx | 로컬 MOCK (중복!) | ✅ 질문 API | 🔴 최고 |
| app/posts/[id]/page.tsx | LOCAL_MOCK_POSTS | ✅ 정보글 | 🟢 낮음 |
| app/users/[id]/page.tsx | MOCK 데이터 | ✅ 사용자 프로필 | 🟡 중간 |
| app/profile/page.tsx | localStorage | ✅ 내 프로필 | 🟡 중간 |
| app/following/page.tsx | MOCK_QUESTIONS + MOCK_POSTS | ✅ 팔로잉 피드 | 🟡 중간 |
| app/search/page.tsx | /api/search | ⚠️ API 테스트 | 🟢 낮음 |
| app/bookmarks/page.tsx | localStorage | ✅ 북마크 | 🟡 중간 |
| app/notifications/page.tsx | localStorage + MOCK | ✅ 알림 | 🟡 중간 |

---

## 🚀 실행 순서

### Step 1: 백업 및 준비
1. Mock 데이터 JSON 백업 생성
2. ID 매핑 가이드 작성
3. Git 커밋 (백업 완료 시점)

### Step 2: Phase 1 (핵심 데이터)
```bash
psql < scripts/1-seed-users.sql
psql < scripts/2-seed-questions.sql
psql < scripts/3-seed-answers.sql
# 검증: 질문 상세 페이지에서 확인
```

### Step 3: Phase 2 (인터랙션)
```bash
psql < scripts/4-seed-votes.sql
psql < scripts/5-seed-notifications.sql
psql < scripts/6-create-bookmarks-table.sql
# API 개발 필요
```

### Step 4: Phase 3 (콘텐츠)
```bash
psql < scripts/7-seed-posts.sql
psql < scripts/9-create-follows-table.sql
```

### Step 5: Phase 4 (관리자 - 선택)
```bash
psql < scripts/10-create-banners-table.sql
psql < scripts/11-create-certifications-table.sql
```

---

## 🔧 추가 작업 필요 사항

### API 엔드포인트
1. ⚠️ GET /api/questions - 동작 확인 필요
2. GET /api/users/[id] - 사용자 프로필 조회 (신규)
3. GET /api/posts - 정보글 목록 (신규)
4. GET /api/posts/[id] - 정보글 상세 (신규)
5. POST /api/bookmarks - 북마크 추가 (신규)
6. GET /api/bookmarks - 북마크 목록 (신규)
7. DELETE /api/bookmarks/[id] - 북마크 삭제 (신규)
8. GET /api/following/feed - 팔로잉 피드 (신규)

### 컴포넌트 수정
1. Sidebar.tsx - 동적 뉴스 로딩
2. ActionBar.tsx - DB 기반 투표/북마크
3. Header.tsx - 사용자 정보 DB 연동
4. app/topics/[slug]/page.tsx - 로컬 Mock 제거

---

## ✅ 완료 후 예상 상태

### 데이터
- Users: 10-15명
- Questions: 16-24개
- Answers: 32-96개
- Votes: 질문/답변별 초기 투표
- Notifications: 사용자별 5-10개
- Posts: 5-8개
- Bookmarks/Follows: 테이블 생성

### 기능
- ✅ 메인 페이지 실제 데이터 표시
- ✅ 질문 목록/상세 DB 연동
- ✅ 답변 시스템 동작
- ✅ 알림 센터 실시간 동작
- ✅ 사용자 프로필 DB 연동
- ✅ Sidebar 동적 뉴스
- ✅ 검색 기능 동작
- ✅ 북마크 시스템
