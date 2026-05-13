-- Gate M3.1.0.5: Add nullable company_id to existing data tables.
ALTER TABLE trees
  ADD COLUMN IF NOT EXISTS company_id UUID;

ALTER TABLE datasets
  ADD COLUMN IF NOT EXISTS company_id UUID;

ALTER TABLE rule_sets
  ADD COLUMN IF NOT EXISTS company_id UUID;

ALTER TABLE dataset_tree_associations
  ADD COLUMN IF NOT EXISTS company_id UUID;

-- Existing table name in this codebase is dataset_upload_status
-- (phase doc references upload_status).
ALTER TABLE dataset_upload_status
  ADD COLUMN IF NOT EXISTS company_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trees_company_id_fkey'
  ) THEN
    ALTER TABLE trees
      ADD CONSTRAINT trees_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'datasets_company_id_fkey'
  ) THEN
    ALTER TABLE datasets
      ADD CONSTRAINT datasets_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rule_sets_company_id_fkey'
  ) THEN
    ALTER TABLE rule_sets
      ADD CONSTRAINT rule_sets_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dataset_tree_associations_company_id_fkey'
  ) THEN
    ALTER TABLE dataset_tree_associations
      ADD CONSTRAINT dataset_tree_associations_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dataset_upload_status_company_id_fkey'
  ) THEN
    ALTER TABLE dataset_upload_status
      ADD CONSTRAINT dataset_upload_status_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trees_company_id ON trees(company_id);
CREATE INDEX IF NOT EXISTS idx_datasets_company_id ON datasets(company_id);
CREATE INDEX IF NOT EXISTS idx_rule_sets_company_id ON rule_sets(company_id);
CREATE INDEX IF NOT EXISTS idx_dataset_tree_associations_company_id
  ON dataset_tree_associations(company_id);
CREATE INDEX IF NOT EXISTS idx_dataset_upload_status_company_id
  ON dataset_upload_status(company_id);
