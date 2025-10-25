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

    // Multi-table JOIN query to get test rules and questions
    const { data: testData, error: testError } = await supabaseAdmin
      .from('test_questions')
      .select(`
        test_id,
        tests!inner(
          id,
          name,
          description,
          total_time_minutes,
          marks_per_correct,
          negative_marks_per_incorrect,
          status,
          allow_pausing,
          show_in_question_timer
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

    if (testError) {
      console.error('Error fetching mock test data:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    if (!testData || testData.length === 0) {
      return NextResponse.json({ error: 'Test not found or no questions available' }, { status: 404 })
    }

    // Extract test information from the first row
    const testInfo = testData[0].tests
    const questions = testData.map(item => item.questions)

    console.log(`Successfully fetched mock test: ${testInfo?.[0]?.name} with ${questions.length} questions`)

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
