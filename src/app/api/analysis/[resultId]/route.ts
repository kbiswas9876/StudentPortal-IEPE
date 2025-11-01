import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    console.log('Fetching analysis data for result ID:', resultId)

    // Fetch test result
    const { data: testResult, error: testError } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (testError) {
      console.error('Error fetching test result:', testError)
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // Fetch answer log using the correct column name
    const { data: answerLog, error: answerError } = await supabaseAdmin
      .from('answer_log')
      .select('*')
      .eq('result_id', resultId)

    if (answerError) {
      console.error('Error fetching answer log:', answerError)
      return NextResponse.json({ error: 'Answer log not found' }, { status: 404 })
    }

    // Extract question IDs and fetch full question data
    const questionIds = answerLog.map(answer => answer.question_id)
    console.log('Question IDs from answer log:', questionIds)
    
    if (questionIds.length === 0) {
      return NextResponse.json({ 
        data: {
          testResult,
          answerLog: [],
          questions: []
        }
      })
    }

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('id', questionIds)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 })
    }

    // For mock tests, enrich questions with per-question marking
    if (testResult.session_type === 'mock_test' && testResult.mock_test_id) {
      const { data: testQuestions, error: testQuestionsError } = await supabaseAdmin
        .from('test_questions')
        .select('question_id, marks_per_correct, penalty_per_incorrect')
        .eq('test_id', testResult.mock_test_id)
        .in('question_id', questionIds)

      if (!testQuestionsError && testQuestions) {
        // Get global marking scheme as fallback
        const { data: testMeta } = await supabaseAdmin
          .from('tests')
          .select('marks_per_correct, negative_marks_per_incorrect')
          .eq('id', testResult.mock_test_id)
          .single()

        const globalMpc = Number(testMeta?.marks_per_correct) || 0
        const globalPpi = Math.abs(Number(testMeta?.negative_marks_per_incorrect) || 0)

        // Create a map of question_id to marking
        const markingMap = new Map(
          testQuestions.map((tq: any) => [
            tq.question_id,
            {
              marks_per_correct: tq.marks_per_correct !== null && tq.marks_per_correct !== undefined 
                ? Number(tq.marks_per_correct) 
                : globalMpc,
              penalty_per_incorrect: tq.penalty_per_incorrect !== null && tq.penalty_per_incorrect !== undefined 
                ? Math.abs(Number(tq.penalty_per_incorrect)) 
                : globalPpi
            }
          ])
        )

        // Enrich questions with per-question marking
        const enrichedQuestions = questions.map((q: any) => {
          const marking = markingMap.get(q.id) || { marks_per_correct: globalMpc, penalty_per_incorrect: globalPpi }
          return {
            ...q,
            marks_per_correct: marking.marks_per_correct,
            penalty_per_incorrect: marking.penalty_per_incorrect
          }
        })

        // Use enriched questions
        questions.splice(0, questions.length, ...enrichedQuestions)
      }
    }

    // If mock test: try to load attempt-specific order for deterministic rendering
    let orderedQuestions = questions
    if (testResult.session_type === 'mock_test') {
      const { data: orderRow } = await supabaseAdmin
        .from('test_attempt_order_log')
        .select('question_order_json, option_order_json')
        .eq('test_result_id', resultId)
        .single()

      if (orderRow && Array.isArray(orderRow.question_order_json)) {
        const byId: Record<number, any> = {}
        for (const q of questions as any[]) byId[q.id] = q
        orderedQuestions = orderRow.question_order_json
          .map((qid: number) => byId[qid])
          .filter((q: any) => q)
      }
    }

    // Fetch peer performance data for benchmarking
    console.log('Fetching peer performance data for benchmarking...')
    const { data: peerPerformanceData, error: peerError } = await supabaseAdmin
      .from('answer_log')
      .select('question_id, time_taken')
      .in('question_id', questionIds)
      .not('user_id', 'eq', testResult.user_id) // Exclude current user's data

    if (peerError) {
      console.error('Error fetching peer performance data:', peerError)
      // Continue without peer data rather than failing
    }

    // Calculate peer averages for each question
    const peerAverages: Record<number, number> = {}
    if (peerPerformanceData && peerPerformanceData.length > 0) {
      const questionGroups = peerPerformanceData.reduce((acc, entry) => {
        if (!acc[entry.question_id]) {
          acc[entry.question_id] = []
        }
        acc[entry.question_id].push(entry.time_taken)
        return acc
      }, {} as Record<number, number[]>)

      // Calculate average time for each question
      Object.entries(questionGroups).forEach(([questionId, times]) => {
        const average = times.reduce((sum, time) => sum + time, 0) / times.length
        peerAverages[parseInt(questionId)] = Math.round(average)
      })
    }

    // Calculate sectional performance (by chapter)
    const sectionalPerformance: Record<string, {
      total: number
      correct: number
      incorrect: number
      skipped: number
      accuracy: number
      avgTime: number
    }> = {}

    // Create a map of question_id to question data for quick lookup
    const questionMap = new Map(orderedQuestions.map(q => [q.id, q]))

    answerLog.forEach(answer => {
      const question = questionMap.get(answer.question_id)
      if (!question || !question.chapter_name) return

      const chapter = question.chapter_name

      if (!sectionalPerformance[chapter]) {
        sectionalPerformance[chapter] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          accuracy: 0,
          avgTime: 0
        }
      }

      sectionalPerformance[chapter].total++
      
      if (answer.status === 'correct') {
        sectionalPerformance[chapter].correct++
      } else if (answer.status === 'incorrect') {
        sectionalPerformance[chapter].incorrect++
      } else if (answer.status === 'skipped') {
        sectionalPerformance[chapter].skipped++
      }
    })

    // Calculate accuracy and average time for each chapter
    Object.entries(sectionalPerformance).forEach(([chapter, stats]) => {
      const attempted = stats.correct + stats.incorrect
      stats.accuracy = attempted > 0 ? (stats.correct / attempted) * 100 : 0

      // Calculate average time for this chapter's questions
      const chapterAnswers = answerLog.filter(answer => {
        const question = questionMap.get(answer.question_id)
        return question && question.chapter_name === chapter
      })
      
      const totalTime = chapterAnswers.reduce((sum, answer) => sum + (answer.time_taken || 0), 0)
      stats.avgTime = chapterAnswers.length > 0 ? Math.round(totalTime / chapterAnswers.length) : 0
    })

    console.log('Fetched questions:', orderedQuestions)
    console.log('Peer averages calculated:', peerAverages)
    console.log('Sectional performance calculated:', sectionalPerformance)
    console.log(`Successfully fetched analysis data: ${testResult ? '1' : '0'} test result, ${answerLog.length} answers, ${questions.length} questions`)

    return NextResponse.json({
      data: {
        testResult,
        answerLog,
        questions: orderedQuestions,
        peerAverages,
        sectionalPerformance
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
