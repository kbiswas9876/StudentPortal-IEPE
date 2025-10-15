/**
 * ============================================================================
 * SRS (Spaced Repetition System) Type Definitions
 * ============================================================================
 * Type definitions for the Modified SM-2 algorithm implementation.
 */

/**
 * User performance rating after reviewing a question.
 * This is the input that drives the SRS algorithm.
 */
export type PerformanceRating = 1 | 2 | 3 | 4;

/**
 * User-friendly labels for performance ratings.
 */
export const PerformanceRatingLabels: Record<PerformanceRating, string> = {
  1: 'Again',      // Incorrect answer / Forgot
  2: 'Hard',       // Correct, but with significant difficulty
  3: 'Good',       // Correct, with some hesitation
  4: 'Easy',       // Correct, recalled instantly
};

/**
 * Current state of a question in the SRS system.
 * This represents all the data needed to calculate the next review.
 */
export interface SrsData {
  /** Number of consecutive successful recalls (resets to 0 on failure) */
  srs_repetitions: number;
  
  /** Ease factor - how "easy" the question is (min: 1.3, default: 2.5) */
  srs_ease_factor: number;
  
  /** Interval in days until next review */
  srs_interval: number;
  
  /** Calculated next review date (ISO format: YYYY-MM-DD) */
  next_review_date: string | null;
}

/**
 * The result returned by the SRS algorithm after processing a review.
 * Contains all updated SRS data to be saved to the database.
 */
export interface SrsUpdateResult {
  srs_repetitions: number;
  srs_ease_factor: number;
  srs_interval: number;
  next_review_date: string;
}

/**
 * Input for logging a review session.
 */
export interface ReviewLogInput {
  bookmarkId: string;
  performanceRating: PerformanceRating;
}

/**
 * A question that's due for review.
 */
export interface DueQuestion {
  id: string;
  question_id: string;
  /** Whether this is due via custom reminder or SRS */
  is_custom_reminder: boolean;
}

