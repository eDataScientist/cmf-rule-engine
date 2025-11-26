-- Add alignment_mapping column to store the full alignment JSON
-- This maps original column names to matched dimensions
-- Example: {"original_col1": "DimensionName1", "original_col2": "", ...}

ALTER TABLE datasets
ADD COLUMN alignment_mapping JSONB;

-- Add index for querying alignment mappings
CREATE INDEX idx_datasets_alignment_mapping ON datasets USING gin (alignment_mapping);

-- Add comment for documentation
COMMENT ON COLUMN datasets.alignment_mapping IS 'JSON mapping of original CSV column names to matched dimension names. Empty string means unmapped.';
