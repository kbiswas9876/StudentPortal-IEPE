-- Create table to log security violations during mock tests
CREATE TABLE IF NOT EXISTS public.security_violations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_result_id BIGINT REFERENCES public.test_results(id) ON DELETE SET NULL,
  mock_test_id INTEGER REFERENCES public.tests(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('cancelled', 'submitted')),
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  user_agent_string TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for this table since it's only accessed via service role key
-- Admin operations bypass RLS, and this table doesn't need user-level access
ALTER TABLE public.security_violations DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_security_violations_user_id
  ON public.security_violations(user_id);

CREATE INDEX IF NOT EXISTS idx_security_violations_test_result_id
  ON public.security_violations(test_result_id);

CREATE INDEX IF NOT EXISTS idx_security_violations_mock_test_id
  ON public.security_violations(mock_test_id);

CREATE INDEX IF NOT EXISTS idx_security_violations_created_at
  ON public.security_violations(created_at DESC);

COMMENT ON TABLE public.security_violations IS 'Logs security violations detected during mock test sessions.';
COMMENT ON COLUMN public.security_violations.violation_type IS 'Type of violation: fullscreen_exit, visibility_change, window_blur, refresh_attempt_f5, refresh_attempt_ctrl_r, etc.';
COMMENT ON COLUMN public.security_violations.outcome IS 'Whether the violation was cancelled (user returned to test) or submitted (test was submitted).';
COMMENT ON COLUMN public.security_violations.device_type IS 'Device type: desktop, mobile, tablet, etc.';
COMMENT ON COLUMN public.security_violations.browser_name IS 'Browser name: Chrome, Firefox, Safari, etc.';
COMMENT ON COLUMN public.security_violations.os_name IS 'Operating system: Windows, macOS, Linux, etc.';
COMMENT ON COLUMN public.security_violations.user_agent_string IS 'Full user agent string for detailed analysis.';

