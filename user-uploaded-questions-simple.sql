-- User Uploaded Questions Schema (Simplified)
-- This creates the user_uploaded_questions table for storing user's custom question sets

CREATE TABLE IF NOT EXISTS public.user_uploaded_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL,
  solution_text TEXT, -- Optional field for user uploads
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_uploaded_questions_user_id ON public.user_uploaded_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_questions_user_id_book_name ON public.user_uploaded_questions(user_id, book_name);
CREATE INDEX IF NOT EXISTS idx_user_uploaded_questions_created_at ON public.user_uploaded_questions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_uploaded_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own uploaded questions" ON public.user_uploaded_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploaded questions" ON public.user_uploaded_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded questions" ON public.user_uploaded_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded questions" ON public.user_uploaded_questions
  FOR DELETE USING (auth.uid() = user_id);
