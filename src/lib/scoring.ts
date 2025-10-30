'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Calculate the actual score for a test result using per-question marking scheme.
 * This is the authoritative scoring function that respects per-question marks from test_questions table.
 * 
 * Priority order:
 * 1. Per-question marking from test_questions + answer_log (preferred for mock tests)
 * 2. Pre-calculated marks from test_attempt_answers (if available)
 * 3. Legacy: global test-level marking with totals from test_results (fallback only)
 * 
 * @param supabase - Supabase client instance
 * @param attemptId - The test result ID (result_id)
 * @param testId - The mock test ID (test_id)
 * @returns The calculated actual score
 */
export async function calculateActualScore(
  supabase: SupabaseClient<Database>,
  attemptId: number,
  testId: number
): Promise<number> {
  // Fetch test-level marking for fallbacks
  let testMarksPerCorrect = 0
  let testPenaltyPerIncorrect = 0
  try {
    const { data: test } = await supabase
      .from('tests')
      .select('marks_per_correct, negative_marks_per_incorrect')
      .eq('id', testId)
      .single()
    testMarksPerCorrect = Number((test as any)?.marks_per_correct) || 0
    testPenaltyPerIncorrect = Math.abs(Number((test as any)?.negative_marks_per_incorrect) || 0)
  } catch {}

  // PRIMARY PATH: Per-question marking using answer_log + test_questions
  // This is the authoritative method for mock tests with per-question marking
  try {
    const [{ data: answers }, { data: tqRows }] = await Promise.all([
      supabase
        .from('answer_log')
        .select('question_id, status')
        .eq('result_id', attemptId),
      supabase
        .from('test_questions')
        .select('question_id, marks_per_correct, penalty_per_incorrect')
        .eq('test_id', testId)
    ])

    if (answers && answers.length > 0) {
      const markingMap = new Map<number, { mpc: number; ppi: number }>()
      for (const row of (tqRows || [])) {
        const mpc = (row as any)?.marks_per_correct
        const ppi = (row as any)?.penalty_per_incorrect
        markingMap.set(Number((row as any).question_id), {
          mpc: (mpc === null || mpc === undefined) ? testMarksPerCorrect : Number(mpc),
          ppi: (ppi === null || ppi === undefined) ? testPenaltyPerIncorrect : Math.abs(Number(ppi))
        })
      }

      let total = 0
      for (const a of answers) {
        const mm = markingMap.get(Number((a as any).question_id)) || { mpc: testMarksPerCorrect, ppi: testPenaltyPerIncorrect }
        if ((a as any).status === 'correct') total += mm.mpc
        else if ((a as any).status === 'incorrect') total -= mm.ppi
        // skipped answers contribute 0 (no addition or subtraction)
      }
      return Math.round(total * 100) / 100
    }
  } catch (err) {
    console.error('Error calculating per-question score:', err)
  }

  // FALLBACK 1: Pre-calculated marks from test_attempt_answers (if available)
  try {
    const { data: attemptAnswers, error } = await supabase
      .from('test_attempt_answers')
      .select('marks_awarded')
      .eq('attempt_id', attemptId)
    if (!error && attemptAnswers && attemptAnswers.length > 0) {
      const sum = attemptAnswers.reduce((s, a: any) => s + (Number(a.marks_awarded) || 0), 0)
      return Math.round(sum * 100) / 100
    }
  } catch {}

  // FALLBACK 2: Legacy method using global marking with totals from test_results
  try {
    const { data: tr } = await supabase
      .from('test_results')
      .select('total_correct, total_incorrect')
      .eq('id', attemptId)
      .single()
    if (tr) {
      const total = (Number((tr as any).total_correct) || 0) * testMarksPerCorrect - (Number((tr as any).total_incorrect) || 0) * testPenaltyPerIncorrect
      return Math.round(total * 100) / 100
    }
  } catch {}

  return 0
}

/**
 * Calculate the total possible marks for a test.
 * Uses per-question marks from test_questions if available, otherwise falls back to global marking.
 * 
 * @param supabase - Supabase client instance
 * @param testId - The mock test ID (test_id)
 * @returns The total possible marks for the test
 */
export async function calculateTotalMarks(
  supabase: SupabaseClient<Database>,
  testId: number
): Promise<number> {
  try {
    const [{ data: tq }, { data: test }] = await Promise.all([
      supabase
        .from('test_questions')
        .select('marks_per_correct')
        .eq('test_id', testId),
      supabase
        .from('tests')
        .select('marks_per_correct')
        .eq('id', testId)
        .single()
    ])

    const globalMpc = Number((test as any)?.marks_per_correct) || 0
    if (!tq || tq.length === 0) return 0
    const haveAnyPerQuestion = tq.some((r: any) => r.marks_per_correct !== null && r.marks_per_correct !== undefined)
    if (haveAnyPerQuestion) {
      // Sum all per-question marks (using global as fallback for null values)
      const sum = tq.reduce((s: number, r: any) => s + (Number(r.marks_per_correct ?? globalMpc) || 0), 0)
      return Math.round(sum * 100) / 100
    }
    // All questions use global marking
    return Math.round((tq.length * globalMpc) * 100) / 100
  } catch {
    return 0
  }
}

/**
 * Unified scoring function that returns both actual score and total marks.
 * This is the authoritative entry point for calculating mock test scores during submission.
 * 
 * @param supabase - Supabase client instance
 * @param resultId - The test result ID (result_id from test_results table)
 * @param testId - The mock test ID (test_id from tests table)
 * @returns Object containing actualScore and totalMarks
 */
export async function calculateScoreForResult(
  supabase: SupabaseClient<Database>,
  resultId: number,
  testId: number
): Promise<{ actualScore: number; totalMarks: number }> {
  const [actualScore, totalMarks] = await Promise.all([
    calculateActualScore(supabase, resultId, testId),
    calculateTotalMarks(supabase, testId)
  ])
  
  return { actualScore, totalMarks }
}
