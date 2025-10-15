-- Update existing error_reports table to match new requirements
-- This script updates your existing table structure

-- First, let's check if we need to add any missing columns
-- Add admin_notes column if it doesn't exist
ALTER TABLE public.error_reports 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.error_reports 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update the status column constraint if needed
ALTER TABLE public.error_reports 
DROP CONSTRAINT IF EXISTS error_reports_status_check;

ALTER TABLE public.error_reports 
ADD CONSTRAINT error_reports_status_check 
CHECK (status IN ('new', 'reviewed', 'resolved', 'dismissed'));

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_error_reports_question_id ON public.error_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON public.error_reports(reported_by_user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON public.error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON public.error_reports(created_at);

-- Add trigger to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_error_reports_updated_at ON public.error_reports;
CREATE TRIGGER update_error_reports_updated_at 
  BEFORE UPDATE ON public.error_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'error_reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;
