-- Gate M3.1.0.2: Create user_profiles with role and company linkage.
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client_admin', 'client_user')),
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_profiles_role_company_consistency CHECK (
    (role = 'admin' AND company_id IS NULL)
    OR (role IN ('client_admin', 'client_user') AND company_id IS NOT NULL)
  )
);

CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- Seed existing platform admin.
INSERT INTO user_profiles (
  user_id,
  company_id,
  role,
  full_name,
  is_active,
  invited_by
)
SELECT
  u.id,
  NULL,
  'admin',
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    NULLIF(u.raw_user_meta_data->>'name', ''),
    SPLIT_PART(u.email, '@', 1)
  ),
  TRUE,
  NULL
FROM auth.users u
WHERE u.email = 'mali@edata.ae'
ON CONFLICT (user_id) DO UPDATE
SET
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  invited_by = EXCLUDED.invited_by,
  updated_at = NOW();
