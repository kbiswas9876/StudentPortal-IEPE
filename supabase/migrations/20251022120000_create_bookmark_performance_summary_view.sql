-- This view pre-calculates performance metrics for each bookmarked question
-- to optimize the Revision Hub page load times.
-- It aggregates data from the answer_log to avoid slow client-side calculations.

CREATE OR REPLACE VIEW public.bookmark_performance_summary AS
SELECT
  bq.id AS bookmark_id,
  bq.user_id,
  bq.question_id,
  -- Count all attempts for this bookmark
  COUNT(al.id) AS total_attempts,
  -- Count only the 'correct' attempts
  SUM(CASE WHEN al.status = 'correct' THEN 1 ELSE 0 END) AS correct_attempts,
  -- Calculate the average time taken for correct answers only
  AVG(al.time_taken) FILTER (WHERE al.status = 'correct') AS avg_correct_time
FROM
  public.bookmarked_questions bq
LEFT JOIN
  -- Join with the answer log on both question_id and user_id for accuracy
  public.answer_log al ON bq.question_id = CAST(al.question_id AS text) AND bq.user_id = al.user_id
GROUP BY
  bq.id, bq.user_id, bq.question_id;

