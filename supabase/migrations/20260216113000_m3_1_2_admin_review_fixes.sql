-- Stream B review remediation:
-- 1) Persist user email snapshot on user_profiles for reliable admin listings/search.
-- 2) Harden get_admin_user_list() to admin-only execution.
-- 3) Add atomic slot request approval/denial RPCs.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE au.id = up.user_id
  AND (up.email IS NULL OR up.email <> au.email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique
ON public.user_profiles (email)
WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_admin_user_list()
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
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can list users';
  END IF;

  RETURN QUERY
  SELECT
    up.user_id,
    COALESCE(up.email, au.email)::TEXT,
    up.full_name,
    up.role,
    up.company_id,
    c.name AS company_name,
    up.is_active,
    up.created_at
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN public.companies c ON c.id = up.company_id
  ORDER BY up.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_user_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_user_list() TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_slot_request_admin(p_request_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_request public.slot_requests%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve slot requests';
  END IF;

  SELECT *
  INTO v_request
  FROM public.slot_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request not found';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  UPDATE public.companies
  SET max_user_slots = max_user_slots + v_request.requested_slots
  WHERE id = v_request.company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  UPDATE public.slot_requests
  SET
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_request.id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    'approve_slot_request',
    'slot_request',
    v_request.id,
    jsonb_build_object(
      'company_id', v_request.company_id,
      'requested_slots', v_request.requested_slots
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.deny_slot_request_admin(p_request_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_request public.slot_requests%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can deny slot requests';
  END IF;

  SELECT *
  INTO v_request
  FROM public.slot_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request not found';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  UPDATE public.slot_requests
  SET
    status = 'denied',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_request.id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    'deny_slot_request',
    'slot_request',
    v_request.id,
    jsonb_build_object(
      'company_id', v_request.company_id,
      'requested_slots', v_request.requested_slots
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.approve_slot_request_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deny_slot_request_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_slot_request_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deny_slot_request_admin(UUID) TO authenticated;

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
  v_role TEXT;
  v_action TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update user status';
  END IF;

  SELECT role
  INTO v_role
  FROM public.user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_role = 'admin' THEN
    RAISE EXCEPTION 'Admin users cannot be deactivated';
  END IF;

  UPDATE public.user_profiles
  SET
    is_active = p_is_active,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  v_action := CASE WHEN p_is_active THEN 'reactivate_user' ELSE 'deactivate_user' END;

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
    jsonb_build_object('is_active', p_is_active)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_user_active_admin(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_user_active_admin(UUID, BOOLEAN) TO authenticated;
