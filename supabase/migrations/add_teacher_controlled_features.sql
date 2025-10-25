-- ============================================================================
-- MIGRATION: Add Teacher-Controlled Test Features
-- Purpose: Add allow_pausing and show_in_question_timer columns to tests table
-- Date: 2024-01-XX
-- ============================================================================

-- Add teacher-controlled feature columns to tests table
ALTER TABLE public.tests 
ADD COLUMN IF NOT EXISTS allow_pausing BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_in_question_timer BOOLEAN NOT NULL DEFAULT false;

-- Add column comments for documentation
COMMENT ON COLUMN public.tests.allow_pausing IS 
'Whether students can pause the test during the session. Controlled by teacher in Admin Panel.';

COMMENT ON COLUMN public.tests.show_in_question_timer IS 
'Whether to show per-question timer to students. Controlled by teacher in Admin Panel.';

-- Update existing tests to have conservative defaults (strict mode)
-- Teachers can enable features through Admin Panel as needed
UPDATE public.tests 
SET 
  allow_pausing = false,
  show_in_question_timer = false
WHERE allow_pausing IS NULL OR show_in_question_timer IS NULL;

-- Verify the migration
DO $$
BEGIN
  -- Check if columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'allow_pausing'
    AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Column allow_pausing was not created successfully';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'show_in_question_timer'
    AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Column show_in_question_timer was not created successfully';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully: Teacher-controlled features added to tests table';
END $$;
