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

// GET - Fetch mock test data and questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    console.log('Fetching mock test data for test ID:', testId)

    // Multi-table JOIN query to get test rules and questions with per-question marking
    const { data: testData, error: testError } = await supabaseAdmin
      .from('test_questions')
      .select(`
        test_id,
        question_id,
        marks_per_correct,
        penalty_per_incorrect,
        tests!inner(
          id,
          name,
          description,
          total_time_minutes,
          marks_per_correct,
          negative_marks_per_incorrect,
          status
        ),
        questions!inner(
          id,
          question_id,
          book_source,
          chapter_name,
          question_number_in_book,
          question_text,
          options,
          correct_option,
          solution_text,
          exam_metadata,
          admin_tags,
          difficulty,
          created_at
        )
      `)
      .eq('test_id', testId)
      .order('id', { ascending: true })

    if (testError) {
      console.error('Error fetching mock test data:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    if (!testData || testData.length === 0) {
      return NextResponse.json({ error: 'Test not found or no questions available' }, { status: 404 })
    }

    // Extract test information from the first row
    // testInfo might be an array or object depending on Supabase response
    const testInfoRaw = testData[0].tests
    const testInfo = Array.isArray(testInfoRaw) ? testInfoRaw[0] : testInfoRaw
    // Map questions with their per-question marking (fallback to test-level if null)
    const globalMpc = Number(testInfo?.marks_per_correct) || 0
    const globalPpi = Math.abs(Number(testInfo?.negative_marks_per_incorrect) || 0)
    
    const questions = testData.map((item: any) => ({
      ...item.questions,
      // Include per-question marking with fallback to test-level
      marks_per_correct: item.marks_per_correct !== null && item.marks_per_correct !== undefined 
        ? Number(item.marks_per_correct) 
        : globalMpc,
      penalty_per_incorrect: item.penalty_per_incorrect !== null && item.penalty_per_incorrect !== undefined 
        ? Math.abs(Number(item.penalty_per_incorrect)) 
        : globalPpi
    }))

    console.log(`Successfully fetched mock test: ${testInfo?.name} with ${questions.length} questions`)

    return NextResponse.json({
      data: {
        test: testInfo,
        questions: questions
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
