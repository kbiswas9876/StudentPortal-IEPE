-- Error Reports Feature - Database Schema
-- Creates the error_reports table for user-submitted question issues

CREATE TABLE IF NOT EXISTS public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id INTEGER NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  reported_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_error_reports_question_id ON public.error_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON public.error_reports(reported_by_user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON public.error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON public.error_reports(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.error_reports
  FOR SELECT USING (auth.uid() = reported_by_user_id);

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert their own reports" ON public.error_reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by_user_id);

-- Policy: Users can update their own reports (limited fields)
CREATE POLICY "Users can update their own reports" ON public.error_reports
  FOR UPDATE USING (auth.uid() = reported_by_user_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_error_reports_updated_at 
  BEFORE UPDATE ON public.error_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
