'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Primary: sum marks_awarded from test_attempt_answers
// Fallback: recompute using answer_log joined with test_questions per-question marking
// Legacy: global test-level marks_per_correct/negative_marks_per_incorrect with totals
export async function calculateActualScore(
  supabase: SupabaseClient<Database>,
  attemptId: number,
  testId: number
): Promise<number> {
  // 1) Primary path
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

  // 2) Fallback: per-question marking using answer_log + test_questions
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
      }
      return Math.round(total * 100) / 100
    }
  } catch {}

  // 3) Legacy: compute using global and totals from test_results
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
      const sum = tq.reduce((s: number, r: any) => s + (Number(r.marks_per_correct ?? globalMpc) || 0), 0)
      return Math.round(sum * 100) / 100
    }
    return Math.round((tq.length * globalMpc) * 100) / 100
  } catch {
    return 0
  }
}


