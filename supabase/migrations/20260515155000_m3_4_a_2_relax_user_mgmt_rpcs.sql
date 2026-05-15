-- M3-4.A.2: Relax user management RPCs for client_admin scope
-- Updates toggle_user_active_admin and adds update_user_profile_admin
-- Both now accept admin OR client_admin (same company scope)

-- Helper function to check if caller is admin or client_admin for a given company
CREATE OR REPLACE FUNCTION public.is_admin_or_client_admin_for_company(p_company_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_role TEXT;
  v_caller_company_id UUID;
BEGIN
  SELECT role, company_id
  INTO v_role, v_caller_company_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Admin can act on any company
  IF v_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Client_admin can only act on their own company
  IF v_role = 'client_admin' AND v_caller_company_id = p_company_id THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Updated toggle_user_active_admin to accept both admin and same-company client_admin
CREATE OR REPLACE FUNCTION public.toggle_user_active_admin(
  p_user_id UUID,
  p_is_active BOOLEAN
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_role TEXT;
  v_target_company_id UUID;
  v_caller_company_id UUID;
  v_action TEXT;
BEGIN
  -- Load target user profile
  SELECT role, company_id
  INTO v_target_role, v_target_company_id
  FROM public.user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Admin users cannot be deactivated
  IF v_target_role = 'admin' THEN
    RAISE EXCEPTION 'Admin users cannot be deactivated';
  END IF;

  -- Check authorization: admin OR client_admin for same company
  SELECT company_id
  INTO v_caller_company_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  IF NOT (public.is_admin() OR (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'client_admin'
    AND v_caller_company_id = v_target_company_id
  )) THEN
    RAISE EXCEPTION 'Insufficient privilege' USING ERRCODE = '42501';
  END IF;

  -- Update user status
  UPDATE public.user_profiles
  SET
    is_active = p_is_active,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Determine action label
  v_action := CASE WHEN p_is_active THEN 'reactivate_user' ELSE 'deactivate_user' END;

  -- Write audit log
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    v_action,
    'user',
    p_user_id,
    jsonb_build_object(
      'is_active', p_is_active,
      'target_company_id', v_target_company_id
    )
  );
END;
$$;

-- New RPC: update_user_profile_admin - allows editing name and role
-- Admin can edit any user; client_admin can edit users in their company only
CREATE OR REPLACE FUNCTION public.update_user_profile_admin(
  p_user_id UUID,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_role TEXT;
  v_target_company_id UUID;
  v_caller_company_id UUID;
  v_old_role TEXT;
BEGIN
  -- Load target user profile
  SELECT role, company_id
  INTO v_target_role, v_target_company_id
  FROM public.user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check authorization: admin OR client_admin for same company
  SELECT company_id, role
  INTO v_caller_company_id, v_old_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  IF NOT (public.is_admin() OR (
    v_old_role = 'client_admin'
    AND v_caller_company_id = v_target_company_id
  )) THEN
    RAISE EXCEPTION 'Insufficient privilege' USING ERRCODE = '42501';
  END IF;

  -- Prevent role escalation to admin
  IF p_role = 'admin' THEN
    RAISE EXCEPTION 'Insufficient privilege' USING ERRCODE = '42501';
  END IF;

  -- Update user profile
  UPDATE public.user_profiles
  SET
    full_name = p_full_name,
    role = p_role,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Write audit log
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    'update_user_profile',
    'user',
    p_user_id,
    jsonb_build_object(
      'full_name', p_full_name,
      'role', p_role,
      'target_company_id', v_target_company_id,
      'old_role', v_target_role
    )
  );
END;
$$;

-- Grant permissions to authenticated users
REVOKE ALL ON FUNCTION public.toggle_user_active_admin(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_user_active_admin(UUID, BOOLEAN) TO authenticated;

REVOKE ALL ON FUNCTION public.update_user_profile_admin(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_user_profile_admin(UUID, TEXT, TEXT) TO authenticated;
