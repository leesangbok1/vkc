-- ============================================================================
-- Migration: 004_experience_based_verification
-- Purpose: 경험 기반 인증 시스템 추가 (시니어 멘토, 선경험자 유입 극대화)
-- Date: 2025-10-15
-- ============================================================================

-- 1. profiles 테이블: verification_type 확장
-- ============================================================================
-- 기존: student, work, family, resident, other (문서 기반)
-- 추가: mentor, experienced, community_leader, specialist (경험 기반)

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_verification_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_verification_type_check
CHECK (verification_type IN (
  -- 문서 기반 인증 (Document-based)
  'student',          -- 학생 (재학증명서)
  'work',             -- 재직자 (재직증명서)
  'family',           -- 가족 (가족관계증명서)
  'resident',         -- 거주자 (외국인등록증)
  'business',         -- 사업자 (사업자등록증)

  -- 경험 기반 인증 (Experience-based) 🌟 NEW
  'mentor',           -- 멘토/강사 (한국어 교육, 상담 경력)
  'experienced',      -- 선경험자 (한국 거주 후 귀국, 실무 경험)
  'community_leader', -- 커뮤니티 리더 (온라인 활동, 답변 기여도)
  'specialist',       -- 전문가 (특정 분야 전문성, 포트폴리오)

  'other'             -- 기타
));

-- 2. profiles 테이블: 인증 방식 및 경험 포트폴리오 필드 추가
-- ============================================================================

-- 인증 방식 구분 필드
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) DEFAULT 'document'
CHECK (verification_method IN ('document', 'experience', 'hybrid'));

COMMENT ON COLUMN profiles.verification_method IS '인증 방식: document(문서), experience(경험), hybrid(혼합)';

-- 경험 증명 포트폴리오 (JSON 구조)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS experience_portfolio JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.experience_portfolio IS '경험 증명 자료: [{type, title, url, description, date}]';

-- 멘토링 경력 요약
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mentoring_experience TEXT;

COMMENT ON COLUMN profiles.mentoring_experience IS '멘토링 경력 요약 (한국어 교육, 상담 등)';

-- 커뮤니티 활동 통계
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS community_stats JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.community_stats IS '커뮤니티 활동 통계: {answers: N, accepted: N, helpful_votes: N}';


-- 3. certification_requests 테이블: 동일하게 확장
-- ============================================================================

-- verification_type 확장
ALTER TABLE certification_requests
DROP CONSTRAINT IF EXISTS certification_requests_verification_type_check;

ALTER TABLE certification_requests
ADD CONSTRAINT certification_requests_verification_type_check
CHECK (verification_type IN (
  'student', 'work', 'family', 'resident', 'business',
  'mentor', 'experienced', 'community_leader', 'specialist',
  'other'
));

-- 인증 방식 필드 추가
ALTER TABLE certification_requests
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) DEFAULT 'document'
CHECK (verification_method IN ('document', 'experience', 'hybrid'));

-- 경험 포트폴리오 필드 추가
ALTER TABLE certification_requests
ADD COLUMN IF NOT EXISTS experience_portfolio JSONB DEFAULT '[]'::jsonb;

-- 심사 소요 시간 (경험 기반은 48-72시간)
ALTER TABLE certification_requests
ADD COLUMN IF NOT EXISTS estimated_review_hours INTEGER DEFAULT 24;

COMMENT ON COLUMN certification_requests.estimated_review_hours IS '예상 심사 시간(시간): 문서 24h, 경험 48-72h';


-- 4. 인덱스 추가 (성능 최적화)
-- ============================================================================

-- verification_method별 검색 최적화
CREATE INDEX IF NOT EXISTS idx_profiles_verification_method
ON profiles(verification_method)
WHERE verification_method IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cert_requests_verification_method
ON certification_requests(verification_method)
WHERE verification_method IS NOT NULL;

-- experience_portfolio JSON 검색 최적화
CREATE INDEX IF NOT EXISTS idx_profiles_experience_portfolio
ON profiles USING GIN (experience_portfolio);

CREATE INDEX IF NOT EXISTS idx_cert_requests_experience_portfolio
ON certification_requests USING GIN (experience_portfolio);


-- 5. 뷰 생성: 경험 기반 인증 대시보드
-- ============================================================================

CREATE OR REPLACE VIEW experience_verification_stats AS
SELECT
  verification_method,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600)::numeric(10,2) as avg_review_hours
FROM certification_requests
WHERE verification_method IS NOT NULL
GROUP BY verification_method;

COMMENT ON VIEW experience_verification_stats IS '인증 방식별 통계 (문서 vs 경험)';


-- 6. 샘플 데이터: 경험 포트폴리오 예시
-- ============================================================================

-- 경험 포트폴리오 JSON 구조 예시
/*
{
  "type": "teaching",           // teaching, blog, sns, community, consulting
  "title": "한국어 교육 3년 경력",
  "url": "https://example.com/portfolio",
  "description": "베트남에서 한국어 교육 기관 강사로 3년 근무, 100명+ 학생 지도",
  "files": ["certificate.pdf", "testimonials.pdf"],
  "date": "2022-01-01",
  "metadata": {
    "students_count": 100,
    "rating": 4.8,
    "duration_months": 36
  }
}
*/

-- 샘플 멘토 데이터 삽입 (Mock)
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- 시니어 멘토 샘플
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    verification_status,
    verification_type,
    verification_method,
    visa_type,
    years_in_korea,
    specialty_areas,
    experience_portfolio,
    mentoring_experience,
    trust_score,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'senior.mentor@example.com',
    '호아 프엉 린',
    'VERIFIED',
    'approved',
    'mentor',
    'experience',
    'F-4 비자',
    7,
    ARRAY['한국어 교육', '취업 상담', '문화 적응'],
    '[
      {
        "type": "teaching",
        "title": "한국어 강사 경력 3년",
        "description": "베트남 한국어 교육 기관에서 100명+ 학생 지도",
        "date": "2020-2023",
        "metadata": {"students": 120, "rating": 4.9}
      },
      {
        "type": "consulting",
        "title": "취업 멘토링 경력",
        "description": "한국 취업 준비생 50명+ 멘토링",
        "date": "2021-present",
        "metadata": {"mentees": 52, "success_rate": 0.85}
      }
    ]'::jsonb,
    '베트남에서 한국어 교육 3년, 취업 상담 멘토링 2년 경력. 한국 거주 7년 경험을 바탕으로 문화 적응, 취업, 생활 전반에 대한 실질적인 조언 제공.',
    820,
    NOW()
  ) RETURNING id INTO sample_user_id;

  RAISE NOTICE '샘플 멘토 사용자 생성 완료: %', sample_user_id;
END $$;


-- 7. 트리거: 경험 기반 인증 자동 심사 시간 설정
-- ============================================================================

CREATE OR REPLACE FUNCTION set_review_estimation()
RETURNS TRIGGER AS $$
BEGIN
  -- 인증 방식에 따라 예상 심사 시간 자동 설정
  IF NEW.verification_method = 'document' THEN
    NEW.estimated_review_hours := 24;
  ELSIF NEW.verification_method = 'experience' THEN
    NEW.estimated_review_hours := 60; -- 48-72시간 평균
  ELSIF NEW.verification_method = 'hybrid' THEN
    NEW.estimated_review_hours := 48;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_review_estimation
BEFORE INSERT OR UPDATE ON certification_requests
FOR EACH ROW
EXECUTE FUNCTION set_review_estimation();


-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================

-- 변경 사항 확인
SELECT
  'Migration 004 Complete' as status,
  COUNT(*) FILTER (WHERE verification_type IN ('mentor', 'experienced', 'community_leader', 'specialist')) as experience_based_users,
  COUNT(*) FILTER (WHERE verification_method = 'experience') as experience_verifications
FROM profiles;

-- 새로운 인증 타입 확인
SELECT
  'Available Verification Types' as info,
  unnest(enum_range(NULL::verification_type)) as type;
