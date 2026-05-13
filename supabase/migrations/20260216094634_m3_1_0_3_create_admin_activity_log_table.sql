-- Gate M3.1.0.3: Create append-only admin activity audit table.
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_log_action_created_at
  ON admin_activity_log(action, created_at DESC);
CREATE INDEX idx_admin_activity_log_user_id
  ON admin_activity_log(user_id);
