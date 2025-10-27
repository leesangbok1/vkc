-- 온보딩 관련 필드 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS residence VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS age VARCHAR(20),
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- 기존 사용자는 온보딩 완료된 것으로 간주 (마이그레이션 시점)
UPDATE users SET onboarding_completed = true WHERE onboarding_completed IS NULL;
