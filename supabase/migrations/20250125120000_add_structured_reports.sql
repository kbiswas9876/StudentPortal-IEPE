-- Add structured reporting to error_reports table
-- Migration: Add report_tag column and make description optional

-- Add a new column to store the predefined report category/tag
ALTER TABLE public.error_reports
ADD COLUMN report_tag TEXT;

-- Make the description optional, as it's not needed for every report type
ALTER TABLE public.error_reports
ALTER COLUMN report_description DROP NOT NULL;

-- Set a default tag for existing reports to avoid null values
UPDATE public.error_reports
SET report_tag = 'legacy_report'
WHERE report_tag IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.error_reports.report_tag IS 'Predefined category of the error report (e.g., wrong_question, wrong_answer).';

-- Add index for better performance on report_tag queries
CREATE INDEX IF NOT EXISTS idx_error_reports_report_tag ON public.error_reports(report_tag);
