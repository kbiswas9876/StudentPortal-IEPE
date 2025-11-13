import { Database } from '@/types/database';

// --- Type Definitions ---

type AnswerLogRow = Database['public']['Tables']['answer_log']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];

export interface ChapterPerformance {
  name: string;
  totalQuestions: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number; // in seconds
}

export interface DifficultyBreakdown {
  easy: { correct: number; incorrect: number; skipped: number };
  medium: { correct: number; incorrect: number; skipped: number };
  hard: { correct: number; incorrect: number; skipped: number };
}

export interface ComparisonData {
  labels: string[]; // Chapter names + 'Overall'
  userScores: number[]; // Accuracy percentages
  topperScores: number[]; // Accuracy percentages
}

// --- Chapter Performance Calculator ---

/**
 * Calculate chapter-wise performance metrics from answer log and questions
 * @param answerLog - Array of answer log entries
 * @param questions - Array of question data
 * @returns Array of chapter performance metrics
 */
export function calculateChapterPerformance(
  answerLog: AnswerLogRow[],
  questions: QuestionRow[]
): ChapterPerformance[] {
  // Create a map for quick question lookup
  const questionMap = new Map<number, QuestionRow>();
  questions.forEach(q => {
    questionMap.set(q.id, q);
  });

  // Group answer log by chapter
  const chapterMap = new Map<string, {
    correct: number;
    incorrect: number;
    skipped: number;
    totalTime: number;
  }>();

  answerLog.forEach(answer => {
    const question = questionMap.get(answer.question_id);
    if (!question || !question.chapter_name) return;

    const chapter = question.chapter_name;
    if (!chapterMap.has(chapter)) {
      chapterMap.set(chapter, { correct: 0, incorrect: 0, skipped: 0, totalTime: 0 });
    }

    const stats = chapterMap.get(chapter)!;
    if (answer.status === 'correct') stats.correct++;
    else if (answer.status === 'incorrect') stats.incorrect++;
    else stats.skipped++;
    stats.totalTime += answer.time_taken || 0;
  });

  // Convert to ChapterPerformance array
  const chapters: ChapterPerformance[] = Array.from(chapterMap.entries()).map(([name, stats]) => {
    const attempted = stats.correct + stats.incorrect;
    const accuracy = attempted > 0 ? (stats.correct / attempted) * 100 : 0;
    const avgTime = attempted > 0 ? stats.totalTime / attempted : 0;

    return {
      name,
      totalQuestions: stats.correct + stats.incorrect + stats.skipped,
      accuracy,
      correct: stats.correct,
      incorrect: stats.incorrect,
      avgTimePerQuestion: avgTime
    };
  });

  // Sort by chapter name for consistent display
  return chapters.sort((a, b) => a.name.localeCompare(b.name));
}

// --- Difficulty Breakdown Calculator ---

/**
 * Calculate difficulty-wise performance breakdown from answer log and questions
 * @param answerLog - Array of answer log entries
 * @param questions - Array of question data
 * @returns Difficulty breakdown object with easy/medium/hard stats
 */
export function calculateDifficultyBreakdown(
  answerLog: AnswerLogRow[],
  questions: QuestionRow[]
): DifficultyBreakdown {
  const breakdown: DifficultyBreakdown = {
    easy: { correct: 0, incorrect: 0, skipped: 0 },
    medium: { correct: 0, incorrect: 0, skipped: 0 },
    hard: { correct: 0, incorrect: 0, skipped: 0 }
  };

  // Create a map for quick question lookup
  const questionMap = new Map<number, QuestionRow>();
  questions.forEach(q => {
    questionMap.set(q.id, q);
  });

  answerLog.forEach(answer => {
    const question = questionMap.get(answer.question_id);
    if (!question || !question.difficulty) return;

    // Map difficulty levels to easy/medium/hard
    let level: 'easy' | 'medium' | 'hard';
    const diff = question.difficulty.toLowerCase();
    
    if (diff === 'easy' || diff.includes('easy')) {
      level = 'easy';
    } else if (diff === 'moderate' || diff.includes('moderate') || diff === 'medium') {
      level = 'medium';
    } else {
      level = 'hard';
    }

    // Count by status
    if (answer.status === 'correct') {
      breakdown[level].correct++;
    } else if (answer.status === 'incorrect') {
      breakdown[level].incorrect++;
    } else {
      breakdown[level].skipped++;
    }
  });

  return breakdown;
}

// --- Topper Comparison Calculator ---

/**
 * Calculate chapter-wise comparison between user and topper performance
 * @param userAnswerLog - User's answer log entries
 * @param topperAnswerLog - Topper's answer log entries
 * @param questions - Array of question data
 * @param userOverallAccuracy - User's overall accuracy percentage
 * @param topperOverallAccuracy - Topper's overall accuracy percentage
 * @returns Comparison data with labels and scores, or null if topper data unavailable
 */
export function calculateTopperComparison(
  userAnswerLog: AnswerLogRow[],
  topperAnswerLog: AnswerLogRow[] | null | undefined,
  questions: QuestionRow[],
  userOverallAccuracy: number,
  topperOverallAccuracy: number
): ComparisonData | null {
  // Handle null case when topper data unavailable
  if (!topperAnswerLog || topperAnswerLog.length === 0) {
    return null;
  }

  // Create a map for quick question lookup
  const questionMap = new Map<number, QuestionRow>();
  questions.forEach(q => {
    questionMap.set(q.id, q);
  });

  // Get unique chapters
  const chapters = Array.from(new Set(
    questions.map(q => q.chapter_name).filter(Boolean)
  )) as string[];

  const userScores: number[] = [];
  const topperScores: number[] = [];

  chapters.forEach(chapter => {
    // Calculate user accuracy for chapter
    const userChapterAnswers = userAnswerLog.filter(a => {
      const q = questionMap.get(a.question_id);
      return q?.chapter_name === chapter;
    });
    const userCorrect = userChapterAnswers.filter(a => a.status === 'correct').length;
    const userAttempted = userChapterAnswers.filter(a => a.status !== 'skipped').length;
    const userAccuracy = userAttempted > 0 ? (userCorrect / userAttempted) * 100 : 0;
    userScores.push(userAccuracy);

    // Calculate topper accuracy for chapter
    const topperChapterAnswers = topperAnswerLog.filter(a => {
      const q = questionMap.get(a.question_id);
      return q?.chapter_name === chapter;
    });
    const topperCorrect = topperChapterAnswers.filter(a => a.status === 'correct').length;
    const topperAttempted = topperChapterAnswers.filter(a => a.status !== 'skipped').length;
    const topperAccuracy = topperAttempted > 0 ? (topperCorrect / topperAttempted) * 100 : 0;
    topperScores.push(topperAccuracy);
  });

  // Add overall accuracy
  userScores.push(userOverallAccuracy);
  topperScores.push(topperOverallAccuracy);

  return {
    labels: [...chapters, 'Overall'],
    userScores,
    topperScores
  };
}

// --- Time Formatting Utilities ---

/**
 * Format time in seconds to HH:MM format for KPI display
 * @param seconds - Time in seconds
 * @returns Formatted time string (HH:MM)
 */
export function formatTimeHHMM(seconds: number | null | undefined): string {
  // Handle null and zero cases gracefully
  if (!seconds || seconds === 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format time in seconds to HH:MM:SS format for leaderboard
 * @param seconds - Time in seconds
 * @returns Formatted time string (HH:MM:SS)
 */
export function formatTimeHHMMSS(seconds: number | null | undefined): string {
  // Handle null and zero cases gracefully
  if (!seconds || seconds === 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to display with 's' suffix for chapter average time
 * @param seconds - Time in seconds
 * @returns Formatted time string with 's' suffix
 */
export function formatSeconds(seconds: number | null | undefined): string {
  // Handle null and zero cases gracefully
  if (seconds === null || seconds === undefined) return '0s';
  if (seconds === 0) return '0s';
  
  // Round to 1 decimal place for better readability
  return `${seconds.toFixed(1)}s`;
}

// --- KPI Data Mapper ---

type TestResultRow = Database['public']['Tables']['test_results']['Row'];

export interface PerformanceMetrics {
  marks_obtained: number;
  total_marks: number;
  percentile: number;
  rank: number;
  total_test_takers: number;
}

export interface SessionResult {
  testResult: TestResultRow & { results: PerformanceMetrics };
  answerLog: AnswerLogRow[];
  questions: QuestionRow[];
  topperResult?: {
    testResult: TestResultRow & { results: PerformanceMetrics };
    answerLog: AnswerLogRow[];
  };
}

export interface KPIData {
  score: string;
  totalMarks: number;
  rank: number;
  totalTestTakers: string;
  percentile: string;
  accuracy: string;
  attemptedCount: number;
  timeTaken: string;
  totalTime: string;
  correct: number;
  incorrect: number;
  skipped: number;
  attemptRate: string;
  totalQuestions: number;
}

/**
 * Map SessionResult to KPI data for display
 * @param sessionResult - Complete session result data
 * @returns Formatted KPI data object
 */
export function mapSessionResultToKPIs(sessionResult: SessionResult): KPIData {
  const { testResult, questions } = sessionResult;
  const { results } = testResult;
  
  const totalCorrect = testResult.total_correct || 0;
  const totalIncorrect = testResult.total_incorrect || 0;
  const totalSkipped = testResult.total_skipped || 0;
  const totalQuestions = questions.length;
  const attempted = totalCorrect + totalIncorrect;
  
  // Calculate accuracy percentage from correct/incorrect
  const accuracy = attempted > 0 ? ((totalCorrect / attempted) * 100).toFixed(1) : '0.0';
  
  // Calculate attempt rate from attempted/total
  const attemptRate = totalQuestions > 0 ? ((attempted / totalQuestions) * 100).toFixed(1) : '0.0';
  
  // Format time taken using utility function
  const timeTaken = formatTimeHHMM(testResult.total_time_taken);
  
  // Default total time to 3 hours (as shown in design)
  const totalTime = '03:00';
  
  return {
    score: results.marks_obtained.toFixed(2),
    totalMarks: results.total_marks,
    rank: results.rank,
    totalTestTakers: results.total_test_takers.toLocaleString(),
    percentile: results.percentile.toFixed(1),
    accuracy,
    attemptedCount: attempted,
    timeTaken,
    totalTime,
    correct: totalCorrect,
    incorrect: totalIncorrect,
    skipped: totalSkipped,
    attemptRate,
    totalQuestions,
  };
}
