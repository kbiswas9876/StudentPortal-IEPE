import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

// GET - Fetch mock test metadata
export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    console.log('Fetching mock test metadata for test ID:', testId)

    // Fetch test metadata including result policy
    const { data: testMetadata, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id, name, description, total_time_minutes, marks_per_correct, negative_marks_per_incorrect, total_questions, result_policy, result_release_at, status')
      .eq('id', testId)
      .single()

    if (testError) {
      console.error('Error fetching test metadata:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    if (!testMetadata) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check for per-question marking overrides
    const { data: testQuestions, error: questionsError } = await supabaseAdmin
      .from('test_questions')
      .select('marks_per_correct, penalty_per_incorrect')
      .eq('test_id', testId)

    let hasMixedMarking = false
    if (!questionsError && testQuestions && testQuestions.length > 0) {
      const globalMarksPerCorrect = testMetadata.marks_per_correct
      const globalNegativeMarks = testMetadata.negative_marks_per_incorrect || 0
      
      // Check if any question has a different marking scheme
      hasMixedMarking = testQuestions.some((tq: any) => {
        const questionMarksPerCorrect = tq.marks_per_correct
        const questionPenalty = tq.penalty_per_incorrect
        
        // If the question has override values that differ from global
        if (questionMarksPerCorrect != null && questionMarksPerCorrect !== globalMarksPerCorrect) {
          return true
        }
        if (questionPenalty != null && Math.abs(Number(questionPenalty || 0)) !== Math.abs(Number(globalNegativeMarks || 0))) {
          return true
        }
        return false
      })
    }

    // Check if results should be available
    const now = new Date()
    const isResultsAvailable = testMetadata.result_policy === 'instant' ||
      (testMetadata.result_policy === 'scheduled' &&
       testMetadata.result_release_at &&
       new Date(testMetadata.result_release_at) <= now)

    console.log('Test metadata fetched:', {
      name: testMetadata.name,
      result_policy: testMetadata.result_policy,
      isResultsAvailable,
      negative_marks_per_incorrect: testMetadata.negative_marks_per_incorrect,
      marks_per_correct: testMetadata.marks_per_correct,
      hasMixedMarking
    })

    return NextResponse.json({
      data: {
        test: testMetadata,
        isResultsAvailable,
        resultReleaseAt: testMetadata.result_release_at,
        hasMixedMarking
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
