-- ============================================================================
-- SRS Preferences Migration
-- ============================================================================
-- Adds SRS pacing control to user preferences table
-- This enables users to customize their review frequency (intensive vs relaxed)

-- Add SRS pacing preference column
ALTER TABLE public.user_notification_preferences
ADD COLUMN IF NOT EXISTS srs_pacing_mode DECIMAL(3,2) NOT NULL DEFAULT 0.00;

-- Column description:
-- srs_pacing_mode: Continuous value from -1.00 (Intensive) to +1.00 (Relaxed)
-- 0.00 = Standard (current default behavior)
-- Negative values = more frequent reviews (compressed intervals)
-- Positive values = less frequent reviews (stretched intervals)

COMMENT ON COLUMN user_notification_preferences.srs_pacing_mode IS 
'User''s preferred SRS pacing: -1.00 (Intensive) to +1.00 (Relaxed), 0.00 = Standard';

