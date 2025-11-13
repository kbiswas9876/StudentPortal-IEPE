/**
 * Analysis Data Caching Utility
 * Manages caching of static test result data for instant loading
 */

import { Database } from '@/types/database';

type AnswerLogRow = Database['public']['Tables']['answer_log']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type TestResultRow = Database['public']['Tables']['test_results']['Row'];

export interface StaticAnalysisData {
  // Core test result data (static)
  testResult: {
    id: number;
    user_id: string;
    mock_test_id: number | null;
    submitted_at: string;
    total_correct: number | null;
    total_incorrect: number | null;
    total_skipped: number | null;
    total_time_taken: number | null;
    accuracy: number | null;
    score_percentage: number | null;
    total_questions: number | null;
  };
  
  // Answer log and questions (static)
  answerLog: AnswerLogRow[];
  questions: QuestionRow[];
  
  // Calculated static metrics
  staticMetrics: {
    score: number;
    totalMarks: number;
    accuracy: number;
    timeTaken: number;
    correct: number;
    incorrect: number;
    skipped: number;
    attemptRate: number;
    totalQuestions: number;
  };
  
  // Timestamp for cache validation
  cachedAt: string;
}

export interface DynamicAnalysisData {
  // Dynamic competitive data
  rank: number;
  percentile: number;
  totalTestTakers: number;
  
  // Topper comparison (can change as more users submit)
  topperResult?: {
    testResult: any;
    answerLog: AnswerLogRow[];
  };
}

const CACHE_PREFIX = 'analysis_static_';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_DAYS = 30; // Cache expires after 30 days

/**
 * Generate cache key for a specific result
 */
function getCacheKey(resultId: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${resultId}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cachedAt: string): boolean {
  const cacheDate = new Date(cachedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff < CACHE_EXPIRY_DAYS;
}

/**
 * Save static analysis data to cache
 */
export function cacheStaticData(resultId: string, data: StaticAnalysisData): void {
  try {
    const cacheKey = getCacheKey(resultId);
    const dataWithTimestamp = {
      ...data,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(dataWithTimestamp));
    console.log('✅ Static analysis data cached successfully');
  } catch (error) {
    console.warn('Failed to cache static data:', error);
    // Non-critical error, continue without caching
  }
}

/**
 * Retrieve static analysis data from cache
 */
export function getCachedStaticData(resultId: string): StaticAnalysisData | null {
  try {
    const cacheKey = getCacheKey(resultId);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log('📭 No cached data found');
      return null;
    }
    
    const data: StaticAnalysisData = JSON.parse(cached);
    
    // Validate cache expiry
    if (!isCacheValid(data.cachedAt)) {
      console.log('⏰ Cached data expired, clearing...');
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    console.log('✅ Loaded static data from cache');
    return data;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Clear cached data for a specific result
 */
export function clearCachedData(resultId: string): void {
  try {
    const cacheKey = getCacheKey(resultId);
    localStorage.removeItem(cacheKey);
    console.log('🗑️ Cached data cleared');
  } catch (error) {
    console.warn('Failed to clear cached data:', error);
  }
}

/**
 * Clear all cached analysis data
 */
export function clearAllCachedData(): void {
  try {
    const keys = Object.keys(localStorage);
    const analysisKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    analysisKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`🗑️ Cleared ${analysisKeys.length} cached analysis entries`);
  } catch (error) {
    console.warn('Failed to clear all cached data:', error);
  }
}

/**
 * Extract static data from full API response
 */
export function extractStaticData(apiResponse: any): StaticAnalysisData {
  const { testResult, answerLog, questions } = apiResponse;
  
  // Calculate static metrics
  const totalCorrect = testResult.total_correct || 0;
  const totalIncorrect = testResult.total_incorrect || 0;
  const totalSkipped = testResult.total_skipped || 0;
  const totalQuestions = questions.length;
  const attempted = totalCorrect + totalIncorrect;
  
  const staticMetrics = {
    score: testResult.results?.marks_obtained || 0,
    totalMarks: testResult.results?.total_marks || 0,
    accuracy: testResult.accuracy || 0,
    timeTaken: testResult.total_time_taken || 0,
    correct: totalCorrect,
    incorrect: totalIncorrect,
    skipped: totalSkipped,
    attemptRate: totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0,
    totalQuestions
  };
  
  return {
    testResult: {
      id: testResult.id,
      user_id: testResult.user_id,
      mock_test_id: testResult.mock_test_id,
      submitted_at: testResult.submitted_at,
      total_correct: testResult.total_correct,
      total_incorrect: testResult.total_incorrect,
      total_skipped: testResult.total_skipped,
      total_time_taken: testResult.total_time_taken,
      accuracy: testResult.accuracy,
      score_percentage: testResult.score_percentage,
      total_questions: testResult.total_questions
    },
    answerLog,
    questions,
    staticMetrics,
    cachedAt: new Date().toISOString()
  };
}

/**
 * Extract dynamic data from full API response
 */
export function extractDynamicData(apiResponse: any): DynamicAnalysisData {
  const { testResult, topperResult } = apiResponse;
  
  return {
    rank: testResult.results?.rank || 0,
    percentile: testResult.results?.percentile || 0,
    totalTestTakers: testResult.results?.total_test_takers || 0,
    topperResult: topperResult || undefined
  };
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  totalEntries: number;
  cacheKeys: string[];
  estimatedSize: number;
} {
  try {
    const keys = Object.keys(localStorage);
    const analysisKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Estimate size in bytes
    let estimatedSize = 0;
    analysisKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        estimatedSize += key.length + value.length;
      }
    });
    
    return {
      totalEntries: analysisKeys.length,
      cacheKeys: analysisKeys,
      estimatedSize
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return {
      totalEntries: 0,
      cacheKeys: [],
      estimatedSize: 0
    };
  }
}
