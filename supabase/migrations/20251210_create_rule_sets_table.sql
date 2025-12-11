-- Create rule_sets table for storing fraud detection rules
CREATE TABLE rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '[]',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by dataset
CREATE INDEX idx_rule_sets_dataset_id ON rule_sets(dataset_id);
CREATE INDEX idx_rule_sets_user_id ON rule_sets(user_id);

-- Enable RLS
ALTER TABLE rule_sets ENABLE ROW LEVEL SECURITY;

-- Users can view their own rule sets
CREATE POLICY "Users can view own rule sets" ON rule_sets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own rule sets
CREATE POLICY "Users can insert own rule sets" ON rule_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rule sets
CREATE POLICY "Users can update own rule sets" ON rule_sets
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own rule sets
CREATE POLICY "Users can delete own rule sets" ON rule_sets
  FOR DELETE USING (auth.uid() = user_id);
