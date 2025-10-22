/**
 * ============================================================================
 * NON-LINEAR SRS PACING ALGORITHM
 * ============================================================================
 * 
 * Design Philosophy:
 * - Use a sigmoid-inspired curve for smooth, non-linear stretching
 * - Effect is more pronounced on short intervals (1-30 days)
 * - Effect tapers off on long intervals (60+ days) to prevent absurd schedules
 * - Negative pacing (intensive) compresses more aggressively than positive pacing stretches
 * 
 * Mathematical Approach:
 * 1. Map user's pacing setting (-1.00 to +1.00) to a compression/stretch factor
 * 2. Apply a non-linear transformation based on the baseline interval
 * 3. Use different curves for compression vs stretching
 */

export interface PacingConfig {
  mode: number // -1.00 to +1.00
}

/**
 * Applies the user's pacing preference to a calculated SRS interval.
 * 
 * @param baselineInterval - The interval calculated by core SM-2 algorithm
 * @param pacingMode - User's pacing setting (-1.00 to +1.00)
 * @returns Adjusted interval in days
 */
export function applyPacingToInterval(
  baselineInterval: number,
  pacingMode: number
): number {
  // No adjustment for standard mode
  if (pacingMode === 0) return baselineInterval
  
  // Clamp pacing mode to valid range
  const clampedMode = Math.max(-1, Math.min(1, pacingMode))
  
  if (clampedMode < 0) {
    // INTENSIVE MODE (compression)
    return compressInterval(baselineInterval, Math.abs(clampedMode))
  } else {
    // RELAXED MODE (stretching)
    return stretchInterval(baselineInterval, clampedMode)
  }
}

/**
 * Compresses intervals for intensive learning.
 * Uses aggressive compression on short intervals, gentle on long ones.
 */
function compressInterval(baseline: number, intensity: number): number {
  // intensity: 0.0 to 1.0, where 1.0 = maximum compression
  
  // For very short intervals (1-3 days), minimum compression to avoid same-day reviews
  if (baseline <= 3) {
    const factor = 1 - (intensity * 0.3) // Max 30% compression
    return Math.max(1, Math.ceil(baseline * factor))
  }
  
  // For short intervals (4-14 days), moderate compression
  if (baseline <= 14) {
    const factor = 1 - (intensity * 0.4) // Max 40% compression
    return Math.ceil(baseline * factor)
  }
  
  // For medium intervals (15-30 days), standard compression
  if (baseline <= 30) {
    const factor = 1 - (intensity * 0.5) // Max 50% compression
    return Math.ceil(baseline * factor)
  }
  
  // For long intervals (30+ days), gentle compression with diminishing returns
  const compressionFactor = 0.5 + (0.3 * Math.exp(-baseline / 50))
  const factor = 1 - (intensity * compressionFactor)
  return Math.ceil(baseline * factor)
}

/**
 * Stretches intervals for relaxed learning.
 * Uses moderate stretching on short intervals, gentle on long ones.
 */
function stretchInterval(baseline: number, relaxation: number): number {
  // relaxation: 0.0 to 1.0, where 1.0 = maximum stretch
  
  // For very short intervals (1-3 days), moderate stretch
  if (baseline <= 3) {
    const factor = 1 + (relaxation * 0.5) // Max 50% stretch (e.g., 2 days → 3 days)
    return Math.ceil(baseline * factor)
  }
  
  // For short intervals (4-14 days), standard stretch
  if (baseline <= 14) {
    const factor = 1 + (relaxation * 0.6) // Max 60% stretch (e.g., 10 days → 16 days)
    return Math.ceil(baseline * factor)
  }
  
  // For medium intervals (15-30 days), moderate stretch
  if (baseline <= 30) {
    const factor = 1 + (relaxation * 0.5) // Max 50% stretch (e.g., 20 days → 30 days)
    return Math.ceil(baseline * factor)
  }
  
  // For long intervals (30-60 days), gentle stretch with diminishing returns
  if (baseline <= 60) {
    const stretchFactor = 0.4 + (0.3 * Math.exp(-baseline / 40))
    const factor = 1 + (relaxation * stretchFactor)
    return Math.ceil(baseline * factor)
  }
  
  // For very long intervals (60+ days), minimal stretch to prevent absurd schedules
  const stretchFactor = 0.3 * Math.exp(-baseline / 60)
  const factor = 1 + (relaxation * stretchFactor)
  return Math.ceil(baseline * factor)
}

/**
 * Recalculates next review date after applying pacing.
 * Handles edge case: if new date is in the past, returns today.
 */
export function calculatePacedReviewDate(
  adjustedInterval: number,
  currentDate: Date = new Date()
): string {
  const nextDate = new Date(currentDate)
  nextDate.setDate(nextDate.getDate() + adjustedInterval)
  
  const today = new Date().toISOString().split('T')[0]
  const calculated = nextDate.toISOString().split('T')[0]
  
  // If calculated date is in the past, make it due today
  return calculated < today ? today : calculated
}

