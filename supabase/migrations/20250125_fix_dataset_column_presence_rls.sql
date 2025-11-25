-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert column presence for own datasets" ON dataset_column_presence;
DROP POLICY IF EXISTS "Users can view column presence for own datasets" ON dataset_column_presence;
DROP POLICY IF EXISTS "Users can delete column presence for own datasets" ON dataset_column_presence;

-- Policy: Allow service role to insert (for Edge Functions)
CREATE POLICY "Service role can insert column presence"
ON dataset_column_presence
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Users can insert column presence records for their own datasets
CREATE POLICY "Users can insert column presence for own datasets"
ON dataset_column_presence
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM datasets
    WHERE datasets.id = dataset_column_presence.dataset_id
    AND datasets.user_id = auth.uid()
  )
);

-- Policy: Users can view column presence records for their own datasets
CREATE POLICY "Users can view column presence for own datasets"
ON dataset_column_presence
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM datasets
    WHERE datasets.id = dataset_column_presence.dataset_id
    AND datasets.user_id = auth.uid()
  )
);

-- Policy: Users can delete column presence records for their own datasets
CREATE POLICY "Users can delete column presence for own datasets"
ON dataset_column_presence
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM datasets
    WHERE datasets.id = dataset_column_presence.dataset_id
    AND datasets.user_id = auth.uid()
  )
);
