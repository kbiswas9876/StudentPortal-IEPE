-- Update existing bookmarks with NULL or 0 ratings to 1-star default
-- This ensures all bookmarks conform to the new rule of having at least a 1-star rating

UPDATE public.bookmarked_questions 
SET user_difficulty_rating = 1 
WHERE user_difficulty_rating IS NULL OR user_difficulty_rating = 0;

-- Verify the update
SELECT 
    COUNT(*) as total_bookmarks,
    COUNT(CASE WHEN user_difficulty_rating = 1 THEN 1 END) as one_star_bookmarks,
    COUNT(CASE WHEN user_difficulty_rating IS NULL THEN 1 END) as null_ratings,
    COUNT(CASE WHEN user_difficulty_rating = 0 THEN 1 END) as zero_ratings
FROM public.bookmarked_questions;
