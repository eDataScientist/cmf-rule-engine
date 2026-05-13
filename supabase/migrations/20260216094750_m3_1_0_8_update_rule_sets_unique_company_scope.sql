-- Gate M3.1.0.8: Move rule_sets uniqueness to dataset/company scope.
ALTER TABLE rule_sets
  DROP CONSTRAINT IF EXISTS rule_sets_dataset_id_user_id_key;

ALTER TABLE rule_sets
  DROP CONSTRAINT IF EXISTS rule_sets_dataset_id_company_id_key;

DROP INDEX IF EXISTS rule_sets_dataset_id_user_id_key;
DROP INDEX IF EXISTS rule_sets_dataset_id_company_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_rule_sets_dataset_company
  ON rule_sets(dataset_id, company_id);
