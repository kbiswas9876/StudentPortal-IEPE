/**
 * Analytics Helper Functions
 * 
 * Utility functions for calculating analytics data and logging student activity.
 * These functions enable the event sourcing pattern for comprehensive analytics.
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface AnswerLog {
  question_id: string
  status: 'correct' | 'incorrect' | 'skipped'
  time_taken?: number
}

export interface QuestionData {
  id: number
  chapter_name: string
  difficulty?: string | null
}

export interface ChapterPerformance {
  [chapter: string]: {
    correct: number
    total: number
    accuracy: number
  }
}

export interface ActivityLogEntry {
  user_id: string
  activity_type: 
    | 'PRACTICE_SESSION_COMPLETED'
    | 'MOCK_TEST_COMPLETED'
    | 'QUESTION_BOOKMARKED'
    | 'QUESTION_UNBOOKMARKED'
    | 'REVIEW_SESSION_COMPLETED'
  related_entity_id?: number | null
  metadata: Record<string, any>
}

// ============================================================================
// CHAPTER PERFORMANCE CALCULATION
// ============================================================================

/**
 * Calculates per-chapter performance metrics from answers and questions data.
 * 
 * @param answers - Array of student answers with question IDs and status
 * @param questions - Map of question IDs to question metadata
 * @returns Object mapping chapter names to performance metrics
 * 
 * @example
 * Input:
 * answers = [{ question_id: 'Q1', status: 'correct' }, { question_id: 'Q2', status: 'incorrect' }]
 * questions = { 'Q1': { chapter_name: 'Algebra' }, 'Q2': { chapter_name: 'Geometry' } }
 * 
 * Output:
 * { 'Algebra': { correct: 1, total: 1, accuracy: 100.0 } }
 */
export async function calculateChapterPerformance(
  answers: AnswerLog[],
  questions: QuestionData[]
): Promise<ChapterPerformance> {
  // Create a map for quick lookups
  const questionMap = new Map(
    questions.map(q => [q.id.toString(), q])
  )

  // Aggregate results by chapter
  const chapterStats: Record<string, { correct: number; total: number }> = {}

  for (const answer of answers) {
    const question = questionMap.get(answer.question_id.toString())
    
    // Skip if question not found (shouldn't happen, but defensive)
    if (!question) {
      console.warn(`Question ${answer.question_id} not found in lookup map`)
      continue
    }

    const chapter = question.chapter_name

    // Initialize chapter stats if needed
    if (!chapterStats[chapter]) {
      chapterStats[chapter] = { correct: 0, total: 0 }
    }

    // Increment total count
    chapterStats[chapter].total++

    // Increment correct count if answered correctly
    if (answer.status === 'correct') {
      chapterStats[chapter].correct++
    }
  }

  // Calculate accuracy for each chapter
  const result: ChapterPerformance = {}
  for (const [chapter, stats] of Object.entries(chapterStats)) {
    result[chapter] = {
      correct: stats.correct,
      total: stats.total,
      accuracy: (stats.correct / stats.total) * 100
    }
  }

  return result
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

/**
 * Logs a student activity event to the student_activity_log table.
 * 
 * This function is designed to be non-blocking and will not fail the primary
 * operation if logging fails. Errors are logged but do not propagate.
 * 
 * @param supabaseAdmin - Supabase admin client with service role permissions
 * @param logEntry - The activity log entry to insert
 * 
 * @example
 * await logStudentActivity(supabaseAdmin, {
 *   user_id: 'user-uuid',
 *   activity_type: 'PRACTICE_SESSION_COMPLETED',
 *   related_entity_id: 123,
 *   metadata: { score: 85.0, total_questions: 10 }
 * })
 */
export async function logStudentActivity(
  supabaseAdmin: SupabaseClient,
  logEntry: ActivityLogEntry
): Promise<void> {
  try {
    // Validate required fields
    if (!logEntry.user_id || !logEntry.activity_type || !logEntry.metadata) {
      console.error('Invalid activity log entry:', logEntry)
      return
    }

    // Insert into the activity log
    const { error } = await supabaseAdmin
      .from('student_activity_log')
      .insert({
        user_id: logEntry.user_id,
        activity_type: logEntry.activity_type,
        related_entity_id: logEntry.related_entity_id,
        metadata: logEntry.metadata,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Log error but don't throw - activity logging should never break primary operations
      console.error('Failed to log student activity:', error)
      console.error('Activity type:', logEntry.activity_type)
      console.error('User ID:', logEntry.user_id)
    } else {
      console.log(`✅ Successfully logged ${logEntry.activity_type} for user ${logEntry.user_id}`)
    }
  } catch (error) {
    // Catch all errors and log, but don't propagate
    console.error('Unexpected error logging student activity:', error)
  }
}

