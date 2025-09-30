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

    console.log('Fetched questions:', questions)
    console.log('Peer averages calculated:', peerAverages)
    console.log(`Successfully fetched analysis data: ${testResult ? '1' : '0'} test result, ${answerLog.length} answers, ${questions.length} questions`)

    return NextResponse.json({
      data: {
        testResult,
        answerLog,
        questions,
        peerAverages
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
