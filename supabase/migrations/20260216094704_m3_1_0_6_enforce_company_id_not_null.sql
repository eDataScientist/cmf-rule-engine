-- Gate M3.1.0.6: Legacy data reset + enforce company ownership constraints.
-- Product decision for M3.1: existing tenant data can be cleared before company rollout.
TRUNCATE TABLE
  dataset_column_presence,
  dataset_tree_associations,
  dataset_upload_status,
  rule_sets,
  datasets,
  trees
RESTART IDENTITY CASCADE;

ALTER TABLE trees
  ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE datasets
  ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE rule_sets
  ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE dataset_tree_associations
  ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE dataset_upload_status
  ALTER COLUMN company_id SET NOT NULL;
