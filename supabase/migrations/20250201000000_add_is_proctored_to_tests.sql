-- Migration: Add is_proctored column to tests table
-- Purpose: Master setting to enable/disable all proctoring features
-- Date: 2025-02-01

-- Add the is_proctored column with default FALSE (existing tests remain non-proctored)
ALTER TABLE public.tests
ADD COLUMN IF NOT EXISTS is_proctored BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN public.tests.is_proctored IS 'If TRUE, enables all proctoring features (fullscreen lock, violation detection, back button blocking). If FALSE, test runs in relaxed mode with no security restrictions.';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tests_is_proctored ON public.tests USING btree (is_proctored);

