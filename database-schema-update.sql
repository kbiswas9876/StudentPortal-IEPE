-- Enhancement for bookmarked_questions table
-- Add personal_note and custom_tags columns to support user customization

ALTER TABLE public.bookmarked_questions
ADD COLUMN IF NOT EXISTS personal_note TEXT,
ADD COLUMN IF NOT EXISTS custom_tags TEXT[];

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_user_id ON public.bookmarked_questions(user_id);

-- Add index for question_id lookups
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_question_id ON public.bookmarked_questions(question_id);
