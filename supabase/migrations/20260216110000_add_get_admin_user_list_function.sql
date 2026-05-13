-- Provides admin user listing with email from auth.users.
-- SECURITY DEFINER allows client-side RPC to access auth.users safely.
CREATE OR REPLACE FUNCTION get_admin_user_list()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT
    up.user_id,
    au.email::TEXT,
    up.full_name,
    up.role,
    up.company_id,
    c.name AS company_name,
    up.is_active,
    up.created_at
  FROM user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN companies c ON c.id = up.company_id
  ORDER BY up.created_at DESC;
$$;
