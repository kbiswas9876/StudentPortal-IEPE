-- User Uploaded Questions Schema
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

-- Create function to get user's custom books
CREATE OR REPLACE FUNCTION get_user_custom_books(user_uuid UUID)
RETURNS TABLE(book_name TEXT, question_count BIGINT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uuq.book_name,
    COUNT(*) as question_count,
    MIN(uuq.created_at) as created_at
  FROM public.user_uploaded_questions uuq
  WHERE uuq.user_id = user_uuid
  GROUP BY uuq.book_name
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get questions from a custom book
CREATE OR REPLACE FUNCTION get_custom_book_questions(user_uuid UUID, book_name_param TEXT)
RETURNS TABLE(
  id UUID,
  question_text TEXT,
  options JSONB,
  correct_option TEXT,
  solution_text TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uuq.id,
    uuq.question_text,
    uuq.options,
    uuq.correct_option,
    uuq.solution_text,
    uuq.created_at
  FROM public.user_uploaded_questions uuq
  WHERE uuq.user_id = user_uuid 
    AND uuq.book_name = book_name_param
  ORDER BY uuq.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
