-- Gate M3.1.0.1: Create companies table for company-scoped ownership.
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('motor', 'medical')),
  max_user_slots INTEGER NOT NULL DEFAULT 5 CHECK (max_user_slots > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_created_by ON companies(created_by);
CREATE INDEX idx_companies_is_active ON companies(is_active);
