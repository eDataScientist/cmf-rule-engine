-- Gate M3.1.0.7: Rewrite RLS from user scope to company scope.

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT up.company_id
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid()
    AND up.is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
      AND up.is_active = TRUE
  );
$$;

DO $$
DECLARE
  t TEXT;
  p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies',
    'user_profiles',
    'trees',
    'datasets',
    'rule_sets',
    'dataset_tree_associations',
    'dataset_upload_status',
    'dataset_column_presence',
    'admin_activity_log',
    'slot_requests'
  ]
  LOOP
    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_tree_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_upload_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_column_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_requests ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY companies_select_scoped ON companies
  FOR SELECT TO authenticated
  USING (public.is_admin() OR id = public.get_user_company_id());

CREATE POLICY companies_insert_admin ON companies
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY companies_update_admin ON companies
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY companies_delete_admin ON companies
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- User profiles
CREATE POLICY user_profiles_select_scoped ON user_profiles
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR company_id = public.get_user_company_id()
  );

CREATE POLICY user_profiles_insert_admin ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY user_profiles_update_admin ON user_profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY user_profiles_delete_admin ON user_profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Trees: admin inserts/manages, company users can read scoped records.
CREATE POLICY trees_select_scoped ON trees
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY trees_insert_admin_only ON trees
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY trees_update_admin_only ON trees
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY trees_delete_admin_only ON trees
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Datasets
CREATE POLICY datasets_select_scoped ON datasets
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY datasets_insert_scoped ON datasets
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY datasets_update_scoped ON datasets
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id())
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY datasets_delete_scoped ON datasets
  FOR DELETE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

-- Rule sets
CREATE POLICY rule_sets_select_scoped ON rule_sets
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY rule_sets_insert_scoped ON rule_sets
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY rule_sets_update_scoped ON rule_sets
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id())
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY rule_sets_delete_scoped ON rule_sets
  FOR DELETE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

-- Dataset-tree associations
CREATE POLICY dta_select_scoped ON dataset_tree_associations
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dta_insert_scoped ON dataset_tree_associations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dta_update_scoped ON dataset_tree_associations
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id())
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dta_delete_scoped ON dataset_tree_associations
  FOR DELETE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

-- Dataset upload status
CREATE POLICY dus_select_scoped ON dataset_upload_status
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dus_insert_scoped ON dataset_upload_status
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dus_update_scoped ON dataset_upload_status
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id())
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY dus_delete_scoped ON dataset_upload_status
  FOR DELETE TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

-- Dataset column presence inherits scoping through dataset ownership.
CREATE POLICY dcp_select_scoped ON dataset_column_presence
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM datasets d
      WHERE d.id = dataset_column_presence.dataset_id
        AND d.company_id = public.get_user_company_id()
    )
  );

CREATE POLICY dcp_insert_scoped ON dataset_column_presence
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM datasets d
      WHERE d.id = dataset_column_presence.dataset_id
        AND d.company_id = public.get_user_company_id()
    )
  );

CREATE POLICY dcp_delete_scoped ON dataset_column_presence
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM datasets d
      WHERE d.id = dataset_column_presence.dataset_id
        AND d.company_id = public.get_user_company_id()
    )
  );

CREATE POLICY dcp_insert_service_role ON dataset_column_presence
  FOR INSERT TO service_role
  WITH CHECK (TRUE);

-- Admin activity log
CREATE POLICY admin_activity_log_select_admin ON admin_activity_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY admin_activity_log_insert_admin ON admin_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY admin_activity_log_insert_service_role ON admin_activity_log
  FOR INSERT TO service_role
  WITH CHECK (TRUE);

-- Slot requests
CREATE POLICY slot_requests_select_scoped ON slot_requests
  FOR SELECT TO authenticated
  USING (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY slot_requests_insert_scoped ON slot_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR company_id = public.get_user_company_id());

CREATE POLICY slot_requests_update_admin ON slot_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY slot_requests_delete_admin ON slot_requests
  FOR DELETE TO authenticated
  USING (public.is_admin());
