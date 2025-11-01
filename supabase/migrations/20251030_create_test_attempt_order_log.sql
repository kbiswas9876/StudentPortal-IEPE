-- Create table to log per-attempt question and option order
CREATE TABLE IF NOT EXISTS public.test_attempt_order_log (
  id BIGSERIAL PRIMARY KEY,
  test_result_id BIGINT NOT NULL REFERENCES public.test_results(id) ON DELETE CASCADE,
  question_order_json JSONB NOT NULL,
  option_order_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_result_id)
);

CREATE INDEX IF NOT EXISTS idx_taol_test_result_id
  ON public.test_attempt_order_log(test_result_id);

COMMENT ON TABLE public.test_attempt_order_log IS 'Source of truth for per-attempt question and option order.';
COMMENT ON COLUMN public.test_attempt_order_log.question_order_json IS 'Ordered array of question IDs as shown to the student.';
COMMENT ON COLUMN public.test_attempt_order_log.option_order_json IS 'Map of question_id -> ordered option keys array (e.g., ["D","A","C","B"]).';

