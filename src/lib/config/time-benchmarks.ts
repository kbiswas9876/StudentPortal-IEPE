/**
 * Time benchmarks for speed categorization based on question difficulty.
 * Tiered logic:
 *  - Tier 1: Use difficulty-specific benchmark seconds when difficulty is present
 *  - Tier 2: Fallback to generic benchmark (36 seconds) when difficulty is missing
 */

export type DifficultyKey =
  | 'Easy'
  | 'Easy-Moderate'
  | 'Moderate'
  | 'Moderate-Hard'
  | 'Hard'

/**
 * Generic benchmark used when no difficulty tag is available
 */
export const DEFAULT_GENERIC_BENCHMARK_SECONDS = 36

/**
 * Difficulty-specific benchmarks in seconds.
 * These can be tuned based on empirical data over time.
 */
export const difficultyBenchmarks: Record<DifficultyKey, number> = {
  Easy: 24,
  'Easy-Moderate': 30,
  Moderate: 36,
  'Moderate-Hard': 42,
  Hard: 48
}

/**
 * Returns the benchmark seconds to use for a given difficulty.
 * If difficulty is undefined or null, returns the generic fallback.
 */
export function getBenchmarkSecondsForDifficulty(
  difficulty: DifficultyKey | null | undefined
): number {
  if (!difficulty) {
    return DEFAULT_GENERIC_BENCHMARK_SECONDS
  }
  return difficultyBenchmarks[difficulty]
}

/**
 * Determines whether a question attempt was "Fast" based on tiered logic:
 * - If difficulty is present: compare timeTakenSeconds against difficulty benchmark
 * - If difficulty is missing: compare against DEFAULT_GENERIC_BENCHMARK_SECONDS
 *
 * Returns the decision and the benchmark used.
 */
export function isFastBasedOnDifficultyOrGeneric(
  timeTakenSeconds: number,
  difficulty: DifficultyKey | null | undefined
): { isFast: boolean; benchmarkSeconds: number } {
  const benchmarkSeconds = getBenchmarkSecondsForDifficulty(difficulty)
  const isFast = timeTakenSeconds <= benchmarkSeconds
  return { isFast, benchmarkSeconds }
}

/**
 * Convenience helper for "Slow" determination.
 */
export function isSlowBasedOnDifficultyOrGeneric(
  timeTakenSeconds: number,
  difficulty: DifficultyKey | null | undefined
): { isSlow: boolean; benchmarkSeconds: number } {
  const { isFast, benchmarkSeconds } = isFastBasedOnDifficultyOrGeneric(
    timeTakenSeconds,
    difficulty
  )
  return { isSlow: !isFast, benchmarkSeconds }
}