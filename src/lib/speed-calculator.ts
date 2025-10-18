// Advanced 5-Tier Difficulty Model - Part 2 Implementation
// This provides a more nuanced and accurate speed analysis based on question complexity
const ADVANCED_TIME_THRESHOLDS = {
  'Easy': 20,           // Instant-recall questions
  'Easy-Moderate': 30,  // Single-step calculations
  'Moderate': 45,       // Standard multi-step problems
  'Moderate-Hard': 60,  // Complex problems requiring careful thought
  'Hard': 90,           // Most challenging questions requiring deep understanding
  'default': 36,        // Baseline (100 questions in 60 minutes = 36 seconds/question)
};

// Legacy 3-tier model (kept for backward compatibility)
const TIME_THRESHOLDS = {
  Easy: 15,
  Medium: 25,
  Hard: 45,
  default: 30,
};

// Advanced 5-tier difficulty type
type AdvancedDifficulty = 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null | undefined;

// Legacy 3-tier difficulty type (for backward compatibility)
type Difficulty = 'Easy' | 'Medium' | 'Hard' | null | undefined;

type SpeedCategory = 'Fast' | 'Slow';
type AdvancedSpeedCategory = 'Fast' | 'Average' | 'Slow';

/**
 * ADVANCED 5-TIER ALGORITHM (Part 2 Implementation)
 * Determines if the time taken is Fast or Slow based on a five-tier difficulty model.
 * This is the PRIMARY algorithm and should be used for all new implementations.
 * 
 * @param timeTakenInSeconds - The time the user took to answer.
 * @param difficulty - The difficulty level from the five-tier model.
 * @returns 'Fast' or 'Slow'.
 */
export function getAdvancedSpeedCategory(timeTakenInSeconds: number, difficulty: AdvancedDifficulty): SpeedCategory {
  let threshold: number;

  switch (difficulty) {
    case 'Easy':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy'];
      break;
    case 'Easy-Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy-Moderate'];
      break;
    case 'Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate'];
      break;
    case 'Moderate-Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate-Hard'];
      break;
    case 'Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Hard'];
      break;
    default:
      threshold = ADVANCED_TIME_THRESHOLDS['default'];
      break;
  }

  return timeTakenInSeconds < threshold ? 'Fast' : 'Slow';
}

/**
 * ADVANCED 3-TIER ALGORITHM (Part 3 Implementation)
 * Determines if the time taken is Fast, Average, or Slow based on a five-tier difficulty model.
 * This provides more nuanced feedback for correct answers.
 *
 * @param timeTakenInSeconds - The time the user took to answer.
 * @param difficulty - The difficulty level from the five-tier model.
 * @returns 'Fast', 'Average', or 'Slow'.
 */
export function getAdvancedThreeTierSpeedCategory(timeTakenInSeconds: number, difficulty: AdvancedDifficulty): AdvancedSpeedCategory {
  let threshold: number;

  switch (difficulty) {
    case 'Easy':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy'];
      break;
    case 'Easy-Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy-Moderate'];
      break;
    case 'Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate'];
      break;
    case 'Moderate-Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate-Hard'];
      break;
    case 'Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Hard'];
      break;
    default:
      threshold = ADVANCED_TIME_THRESHOLDS['default'];
      break;
  }

  // Three-tier system: Fast (< 75%), Average (75-125%), Slow (> 125%)
  const fastThreshold = threshold * 0.75;
  const slowThreshold = threshold * 1.25;

  if (timeTakenInSeconds < fastThreshold) {
    return 'Fast';
  } else if (timeTakenInSeconds <= slowThreshold) {
    return 'Average';
  } else {
    return 'Slow';
  }
}

/**
 * NEW NUANCED SPEED & ACCURACY ALGORITHM
 * Hierarchical algorithm that provides sophisticated feedback based on speed and accuracy.
 * Priority: Slow > Accuracy > Speed analysis
 *
 * @param timeTakenInSeconds - The time the user took to answer.
 * @param difficulty - The difficulty level from the five-tier model.
 * @param answerStatus - The correctness of the answer ('correct', 'incorrect', 'skipped').
 * @returns 'Slow', 'Superfast', 'OnTime', or 'OnTimeButNotCorrect'.
 */
export function getNuancedPerformanceState(
  timeTakenInSeconds: number, 
  difficulty: AdvancedDifficulty, 
  answerStatus: 'correct' | 'incorrect' | 'skipped'
): 'Slow' | 'Superfast' | 'OnTime' | 'OnTimeButNotCorrect' {
  // Step 1: Get the base parameters for this question
  let threshold: number;

  switch (difficulty) {
    case 'Easy':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy'];
      break;
    case 'Easy-Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Easy-Moderate'];
      break;
    case 'Moderate':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate'];
      break;
    case 'Moderate-Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Moderate-Hard'];
      break;
    case 'Hard':
      threshold = ADVANCED_TIME_THRESHOLDS['Hard'];
      break;
    default:
      threshold = ADVANCED_TIME_THRESHOLDS['default'];
      break;
  }

  const slowThreshold = threshold * 1.10; // 110% of target time
  const superfastThreshold = threshold * 0.80; // 80% of target time

  // PRIORITY 1: The "Slow" Check. This overrides everything else.
  if (timeTakenInSeconds > slowThreshold) {
    return 'Slow';
  }

  // PRIORITY 2: The "Accuracy" Check (only runs if the user was NOT slow).
  if (answerStatus === 'correct') {
    // If Correct, check for exceptional speed.
    if (timeTakenInSeconds < superfastThreshold) {
      return 'Superfast';
    } else {
      // Correct and within the normal time range.
      return 'OnTime';
    }
  } else {
    // This block handles both 'incorrect' and 'skipped' statuses.
    // Since the "Slow" check failed, we know they were within the time limit.
    return 'OnTimeButNotCorrect';
  }
}

/**
 * LEGACY 3-TIER ALGORITHM (Deprecated - kept for backward compatibility)
 * Use getAdvancedSpeedCategory() for new implementations.
 * 
 * @param timeTakenInSeconds - The time the user took to answer the question.
 * @param difficulty - The difficulty level of the question.
 * @returns 'Fast' or 'Slow'.
 */
export function getSpeedCategory(timeTakenInSeconds: number, difficulty: Difficulty): SpeedCategory {
  let threshold: number;

  switch (difficulty) {
    case 'Easy':
      threshold = TIME_THRESHOLDS.Easy;
      break;
    case 'Medium':
      threshold = TIME_THRESHOLDS.Medium;
      break;
    case 'Hard':
      threshold = TIME_THRESHOLDS.Hard;
      break;
    default:
      threshold = TIME_THRESHOLDS.default;
      break;
  }

  return timeTakenInSeconds < threshold ? 'Fast' : 'Slow';
}

export { TIME_THRESHOLDS, ADVANCED_TIME_THRESHOLDS };
export type { Difficulty, AdvancedDifficulty, SpeedCategory, AdvancedSpeedCategory };
