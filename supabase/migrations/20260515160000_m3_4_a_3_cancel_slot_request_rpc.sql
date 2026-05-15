-- M3-4.A.3: Add cancel_slot_request RPC
-- Allows the original requester OR admin to cancel a pending slot request
-- Verifies status is 'pending', updates to 'cancelled', writes audit log

CREATE OR REPLACE FUNCTION public.cancel_slot_request(
  p_request_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_request public.slot_requests%ROWTYPE;
  v_caller_user_id UUID;
  v_caller_role TEXT;
BEGIN
  -- Get current caller info
  v_caller_user_id := auth.uid();

  SELECT role
  INTO v_caller_role
  FROM public.user_profiles
  WHERE user_id = v_caller_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caller profile not found';
  END IF;

  -- Load the slot request for update
  SELECT *
  INTO v_request
  FROM public.slot_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request not found';
  END IF;

  -- Check authorization: original requester OR admin
  IF NOT (v_caller_user_id = v_request.requested_by OR v_caller_role = 'admin') THEN
    RAISE EXCEPTION 'Insufficient privilege' USING ERRCODE = '42501';
  END IF;

  -- Verify status is pending
  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  -- Update status to cancelled
  UPDATE public.slot_requests
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot request already processed';
  END IF;

  -- Write audit log
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    v_caller_user_id,
    'cancel_slot_request',
    'slot_request',
    p_request_id,
    jsonb_build_object(
      'company_id', v_request.company_id,
      'requested_slots', v_request.requested_slots
    )
  );
END;
$$;

-- Grant permissions to authenticated users
REVOKE ALL ON FUNCTION public.cancel_slot_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_slot_request(UUID) TO authenticated;
