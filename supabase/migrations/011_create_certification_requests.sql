-- Certification Requests core table (if missing)
CREATE TABLE IF NOT EXISTS certification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  verification_type VARCHAR(20),
  documents JSONB DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE certification_requests ENABLE ROW LEVEL SECURITY;

-- Policies: users can view own requests; insert own; admins update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certification_requests' AND policyname = 'Users can view own cert requests'
  ) THEN
    CREATE POLICY "Users can view own cert requests" ON certification_requests
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certification_requests' AND policyname = 'Users can create cert requests'
  ) THEN
    CREATE POLICY "Users can create cert requests" ON certification_requests
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certification_requests' AND policyname = 'Admins can update cert requests'
  ) THEN
    CREATE POLICY "Admins can update cert requests" ON certification_requests
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND lower(role) = 'admin')
      );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cert_requests_user ON certification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_requests_status ON certification_requests(status);
CREATE INDEX IF NOT EXISTS idx_cert_requests_created ON certification_requests(created_at DESC);

