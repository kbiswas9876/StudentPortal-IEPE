-- Migration: Add srs_feedback_log column to test_results table
-- Purpose: Enable database-backed session persistence for SRS feedback
-- Date: 2025-10-22

-- Add JSONB column to store SRS feedback log
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS srs_feedback_log JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_test_results_srs_feedback 
ON test_results USING gin (srs_feedback_log);

-- Add column comment for documentation
COMMENT ON COLUMN test_results.srs_feedback_log IS 
'Stores SRS feedback given during solution review session. Maps question_id (string) to feedback entry with rating, timestamp, and originalSrsState for undo functionality.';

-- Verify the column was added
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'test_results' 
        AND column_name = 'srs_feedback_log'
    ) THEN
        RAISE NOTICE 'Successfully added srs_feedback_log column to test_results table';
    ELSE
        RAISE EXCEPTION 'Failed to add srs_feedback_log column';
    END IF;
END $$;

