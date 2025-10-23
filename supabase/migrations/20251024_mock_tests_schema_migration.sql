-- Migration: Mock Tests Schema Enhancement
-- Purpose: Add missing columns, rename fields, and establish proper constraints
-- Date: 2024-10-24
-- Phase: 1 - Stabilization

-- ============================================================================
-- STEP 1: Add new columns with safe defaults
-- ============================================================================

-- Add negative_marks_per_incorrect column
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS negative_marks_per_incorrect NUMERIC DEFAULT 0;

-- Add total_questions column (computed field, will be kept in sync)
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;

-- Ensure status column exists with proper enum values
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tests' AND column_name = 'status') THEN
    ALTER TABLE tests ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

-- Ensure time-related columns exist
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Ensure result policy columns exist
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS result_policy TEXT DEFAULT 'instant',
ADD COLUMN IF NOT EXISTS result_release_at TIMESTAMPTZ;

-- ============================================================================
-- STEP 2: Migrate existing data safely
-- ============================================================================

-- Set default value for negative_marks_per_incorrect
-- (No existing marks_per_incorrect column to migrate from)
UPDATE tests 
SET negative_marks_per_incorrect = 0
WHERE negative_marks_per_incorrect IS NULL OR negative_marks_per_incorrect = 0;

-- Calculate and set total_questions from test_questions join table
UPDATE tests t
SET total_questions = (
  SELECT COUNT(*)
  FROM test_questions tq
  WHERE tq.test_id = t.id
)
WHERE total_questions = 0;

-- Set default status for existing tests based on time
UPDATE tests
SET status = CASE
  WHEN end_time IS NOT NULL AND end_time < NOW() THEN 'completed'
  WHEN start_time IS NOT NULL AND start_time <= NOW() AND (end_time IS NULL OR end_time > NOW()) THEN 'live'
  WHEN start_time IS NOT NULL AND start_time > NOW() THEN 'scheduled'
  ELSE 'draft'
END
WHERE status = 'draft' OR status IS NULL;

-- ============================================================================
-- STEP 3: Apply NOT NULL constraints
-- ============================================================================

-- Make negative_marks_per_incorrect NOT NULL after setting defaults
ALTER TABLE tests 
ALTER COLUMN negative_marks_per_incorrect SET NOT NULL;

-- Make total_questions NOT NULL after setting defaults
ALTER TABLE tests 
ALTER COLUMN total_questions SET NOT NULL;

-- ============================================================================
-- STEP 4: Add CHECK constraints
-- ============================================================================

-- Ensure negative marks are actually negative or zero
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_negative_marks_per_incorrect;

ALTER TABLE tests 
ADD CONSTRAINT check_negative_marks_per_incorrect 
CHECK (negative_marks_per_incorrect <= 0);

-- Ensure positive marks are positive
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_marks_per_correct_positive;

ALTER TABLE tests 
ADD CONSTRAINT check_marks_per_correct_positive 
CHECK (marks_per_correct > 0);

-- Ensure total_questions is non-negative
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_total_questions_non_negative;

ALTER TABLE tests 
ADD CONSTRAINT check_total_questions_non_negative 
CHECK (total_questions >= 0);

-- Ensure valid status values
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_status_valid;

ALTER TABLE tests 
ADD CONSTRAINT check_status_valid 
CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'archived'));

-- Ensure valid result_policy values
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_result_policy_valid;

ALTER TABLE tests 
ADD CONSTRAINT check_result_policy_valid 
CHECK (result_policy IN ('instant', 'scheduled', 'manual'));

-- Ensure end_time is after start_time
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS check_end_time_after_start_time;

ALTER TABLE tests 
ADD CONSTRAINT check_end_time_after_start_time 
CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

-- Index for status-based queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_tests_status 
ON tests(status);

-- Index for time-based queries (used by CRON job)
CREATE INDEX IF NOT EXISTS idx_tests_start_time 
ON tests(start_time) 
WHERE start_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tests_end_time 
ON tests(end_time) 
WHERE end_time IS NOT NULL;

-- Composite index for status transitions
CREATE INDEX IF NOT EXISTS idx_tests_status_start_time 
ON tests(status, start_time) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_tests_status_end_time 
ON tests(status, end_time) 
WHERE status = 'live';

-- Index for result policy queries
CREATE INDEX IF NOT EXISTS idx_tests_result_policy 
ON tests(result_policy, result_release_at) 
WHERE result_policy = 'scheduled';

-- ============================================================================
-- STEP 6: Create trigger to auto-update total_questions
-- ============================================================================

-- Function to update total_questions when test_questions changes
CREATE OR REPLACE FUNCTION update_test_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE tests 
    SET total_questions = (
      SELECT COUNT(*) 
      FROM test_questions 
      WHERE test_id = OLD.test_id
    )
    WHERE id = OLD.test_id;
    RETURN OLD;
  ELSE
    UPDATE tests 
    SET total_questions = (
      SELECT COUNT(*) 
      FROM test_questions 
      WHERE test_id = NEW.test_id
    )
    WHERE id = NEW.test_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on test_questions table
DROP TRIGGER IF EXISTS trigger_update_test_question_count ON test_questions;

CREATE TRIGGER trigger_update_test_question_count
AFTER INSERT OR DELETE ON test_questions
FOR EACH ROW
EXECUTE FUNCTION update_test_question_count();

-- ============================================================================
-- STEP 7: Add column comments for documentation
-- ============================================================================

COMMENT ON COLUMN tests.negative_marks_per_incorrect IS 
'Marks deducted for incorrect answers. Must be <= 0 (e.g., -0.25, -0.5, -1). Zero means no negative marking.';

COMMENT ON COLUMN tests.total_questions IS 
'Total number of questions in this test. Auto-updated via trigger when test_questions changes.';

COMMENT ON COLUMN tests.status IS 
'Current status: draft (not published), scheduled (future), live (active), completed (past), archived (hidden)';

COMMENT ON COLUMN tests.result_policy IS 
'When results are shown: instant (immediately after submission), scheduled (at specific time), manual (admin-controlled)';

COMMENT ON COLUMN tests.result_release_at IS 
'Timestamp when results become visible (only used when result_policy = scheduled)';

-- ============================================================================
-- STEP 8: Verification
-- ============================================================================

DO $$ 
DECLARE
  missing_columns TEXT[];
BEGIN
  -- Check all required columns exist
  SELECT ARRAY_AGG(column_name) INTO missing_columns
  FROM (
    VALUES 
      ('negative_marks_per_incorrect'),
      ('total_questions'),
      ('status'),
      ('start_time'),
      ('end_time'),
      ('result_policy')
  ) AS required_cols(column_name)
  WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = required_cols.column_name
  );

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed! Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;

  RAISE NOTICE 'Migration completed successfully! All columns verified.';
  RAISE NOTICE 'Total tests migrated: %', (SELECT COUNT(*) FROM tests);
  RAISE NOTICE 'Tests with questions: %', (SELECT COUNT(*) FROM tests WHERE total_questions > 0);
END $$;

