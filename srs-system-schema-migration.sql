-- ============================================================================
-- INTELLIGENT REVISION HUB - PART 1: DATABASE SCHEMA MIGRATION
-- ============================================================================
-- This migration file implements the foundational database schema for the
-- Spaced Repetition System (SRS) and Notification System.
-- 
-- All commands are idempotent (safe to run multiple times).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A. ENHANCE bookmarked_questions TABLE
-- ----------------------------------------------------------------------------
-- Adds columns necessary for the SRS algorithm and custom user reminders.

ALTER TABLE bookmarked_questions
ADD COLUMN IF NOT EXISTS srs_repetitions INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS srs_ease_factor DECIMAL(4, 2) NOT NULL DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS srs_interval INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_review_date DATE,
ADD COLUMN IF NOT EXISTS is_custom_reminder_active BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_next_review_date DATE;

-- Column Descriptions:
-- srs_repetitions (n): Count of consecutive successful recalls (resets to 0 on failure)
-- srs_ease_factor (EF): How "easy" the question is (starts at 2.5, min 1.3)
-- srs_interval (I): Days until next scheduled review (grows exponentially)
-- next_review_date: SRS-calculated date for next review
-- is_custom_reminder_active: If TRUE, system uses custom_next_review_date instead of SRS
-- custom_next_review_date: User-defined manual reminder date

-- Create index for efficient due question queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_next_review 
ON bookmarked_questions(user_id, next_review_date) 
WHERE is_custom_reminder_active = FALSE;

CREATE INDEX IF NOT EXISTS idx_bookmarks_custom_review 
ON bookmarked_questions(user_id, custom_next_review_date) 
WHERE is_custom_reminder_active = TRUE;

-- ----------------------------------------------------------------------------
-- B. CREATE user_notification_preferences TABLE
-- ----------------------------------------------------------------------------
-- Stores user preferences for reminder notifications.

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enable_email_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    enable_in_app_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_time VARCHAR(5) NOT NULL DEFAULT '09:00',
    user_timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Column Descriptions:
-- user_id: Links to auth.users
-- enable_email_reminders: Whether user wants email notifications
-- enable_in_app_reminders: Whether user wants in-app notifications
-- reminder_time: Preferred time for daily reminders (HH:MM format, 24-hour)
-- user_timezone: User's timezone for accurate reminder scheduling (defaults to IST)

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- C. CREATE student_notifications TABLE
-- ----------------------------------------------------------------------------
-- Dedicated table for student-facing notifications (separate from admin panel).

CREATE TABLE IF NOT EXISTS student_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Column Descriptions:
-- id: Unique notification identifier
-- user_id: Links to auth.users
-- message: Notification content
-- link: Optional deep link to relevant page
-- is_read: Whether user has viewed the notification
-- created_at: When the notification was created

-- Create indexes for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_student_notifications_user 
ON student_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_notifications_unread 
ON student_notifications(user_id, is_read) 
WHERE is_read = FALSE;

-- ----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------------------
-- Next steps:
-- 1. Implement core SRS algorithm
-- 2. Create API endpoints for due-questions and log-review
-- 3. Build user interface for the system
-- ----------------------------------------------------------------------------

