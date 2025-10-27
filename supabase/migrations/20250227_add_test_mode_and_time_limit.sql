-- ============================================================================
-- MIGRATION: Add test_mode and time_limit_minutes to test_results table
-- Purpose: Store practice session mode (practice vs timed) and time limits
-- Date: 2025-02-27
-- ============================================================================

-- Add test_mode column
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS test_mode TEXT DEFAULT 'practice' 
CHECK (test_mode IN ('practice', 'timed'));

-- Add time_limit_minutes column  
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN test_results.test_mode IS 
'Practice session mode: "practice" (forward-counting timer) or "timed" (countdown timer)';

COMMENT ON COLUMN test_results.time_limit_minutes IS 
'Time limit in minutes for timed mode sessions (NULL for practice mode)';

-- Create index for querying by test mode
CREATE INDEX IF NOT EXISTS idx_test_results_test_mode 
ON test_results(test_mode);

