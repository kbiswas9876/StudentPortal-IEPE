-- Add user_difficulty_rating column to bookmarked_questions table
-- This allows users to rate the personal difficulty of bookmarked questions on a 1-5 scale

ALTER TABLE bookmarked_questions 
ADD COLUMN IF NOT EXISTS user_difficulty_rating INTEGER CHECK (user_difficulty_rating >= 1 AND user_difficulty_rating <= 5);

-- Add comment to explain the column
COMMENT ON COLUMN bookmarked_questions.user_difficulty_rating IS 'User personal difficulty rating (1-5 stars), nullable';

