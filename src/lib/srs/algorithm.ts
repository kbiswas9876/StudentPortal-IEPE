/**
 * ============================================================================
 * CORE SRS ALGORITHM: Modified SM-2 (SuperMemo 2)
 * ============================================================================
 * This implements the spaced repetition algorithm that calculates when
 * a user should next review a bookmarked question based on their performance.
 * 
 * Algorithm Overview:
 * - Tracks consecutive successful recalls (n)
 * - Adjusts ease factor (EF) based on performance (min: 1.3, default: 2.5)
 * - Calculates intervals that grow exponentially with success
 * - Resets on failure to ensure difficult questions are reviewed more often
 * 
 * Performance Ratings:
 * 1 = Again (forgot/incorrect)
 * 2 = Hard (correct but difficult)
 * 3 = Good (correct with some effort)
 * 4 = Easy (instant recall)
 */

import type { PerformanceRating, SrsData, SrsUpdateResult } from './types';

/**
 * Minimum allowed ease factor to prevent intervals from becoming too short.
 */
const MIN_EASE_FACTOR = 1.3;

/**
 * Default ease factor for new questions.
 */
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Default values for a newly bookmarked question.
 */
export const DEFAULT_SRS_DATA: SrsData = {
  srs_repetitions: 0,
  srs_ease_factor: DEFAULT_EASE_FACTOR,
  srs_interval: 0,
  next_review_date: null,
};

/**
 * Calculates the next review date based on the current date and interval.
 * @param intervalDays - Number of days until next review
 * @returns ISO formatted date string (YYYY-MM-DD)
 */
function calculateNextReviewDate(intervalDays: number): string {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

/**
 * Core SRS algorithm implementation.
 * 
 * @param currentSrsData - Current SRS state from database
 * @param performanceRating - User's performance rating (1-4)
 * @returns Updated SRS data to save to database
 * 
 * @example
 * ```typescript
 * const bookmark = await getBookmark(bookmarkId);
 * const updated = updateSrsData({
 *   srs_repetitions: bookmark.srs_repetitions,
 *   srs_ease_factor: bookmark.srs_ease_factor,
 *   srs_interval: bookmark.srs_interval,
 *   next_review_date: bookmark.next_review_date,
 * }, 3); // User rated it as "Good"
 * 
 * await updateBookmark(bookmarkId, updated);
 * ```
 */
export function updateSrsData(
  currentSrsData: SrsData,
  performanceRating: PerformanceRating
): SrsUpdateResult {
  let n = currentSrsData.srs_repetitions;
  let ef = currentSrsData.srs_ease_factor;
  let i = currentSrsData.srs_interval;

  // ============================================================================
  // STEP 1: Handle Performance - Lapse vs Success
  // ============================================================================
  
  if (performanceRating < 3) {
    // --- User is struggling (Again or Hard) ---
    n = 0; // Reset consecutive success counter
    ef = Math.max(MIN_EASE_FACTOR, ef - 0.20); // Decrease ease factor (harder)
    i = 1; // Schedule for review tomorrow
  } else {
    // --- Successful recall (Good or Easy) ---
    n = n + 1; // Increment success counter
    
    // Update Ease Factor using SM-2 formula
    // We offset the performanceRating (1-4) to fit the formula's 0-5 scale
    const q = performanceRating + 1;
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    
    // Enforce minimum ease factor
    if (ef < MIN_EASE_FACTOR) {
      ef = MIN_EASE_FACTOR;
    }
    
    // ============================================================================
    // STEP 2: Calculate New Interval
    // ============================================================================
    
    if (n === 1) {
      // First successful recall -> review tomorrow
      i = 1;
    } else if (n === 2) {
      // Second successful recall -> review in 6 days
      i = 6;
    } else {
      // Subsequent recalls -> exponential growth
      i = Math.ceil(i * ef);
    }
  }

  // ============================================================================
  // STEP 3: Calculate Next Review Date
  // ============================================================================
  
  const nextReviewDate = calculateNextReviewDate(i);

  // ============================================================================
  // STEP 4: Return Complete Updated State
  // ============================================================================
  
  return {
    srs_repetitions: n,
    srs_ease_factor: parseFloat(ef.toFixed(2)), // Round to 2 decimal places
    srs_interval: i,
    next_review_date: nextReviewDate,
  };
}

/**
 * Helper function to check if a question is due for review today.
 * 
 * @param nextReviewDate - The scheduled review date (YYYY-MM-DD format)
 * @param isCustomReminderActive - Whether custom reminder overrides SRS
 * @param customNextReviewDate - Custom reminder date if active
 * @returns true if the question should be reviewed today or earlier
 */
export function isQuestionDue(
  nextReviewDate: string | null,
  isCustomReminderActive: boolean,
  customNextReviewDate: string | null
): boolean {
  const today = new Date().toISOString().split('T')[0];
  
  if (isCustomReminderActive && customNextReviewDate) {
    return customNextReviewDate <= today;
  }
  
  if (!nextReviewDate) {
    // Never been reviewed - due immediately
    return true;
  }
  
  return nextReviewDate <= today;
}

/**
 * Initializes SRS data for a newly bookmarked question.
 * Sets the next review date to today (immediate review available).
 * 
 * @returns Initial SRS data for a new bookmark
 */
export function initializeSrsData(): SrsUpdateResult {
  return {
    srs_repetitions: 0,
    srs_ease_factor: DEFAULT_EASE_FACTOR,
    srs_interval: 0,
    next_review_date: new Date().toISOString().split('T')[0], // Due today
  };
}

