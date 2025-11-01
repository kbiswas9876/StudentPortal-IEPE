import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { calculateScoreForResult } from '@/lib/scoring'

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id,
      questions,
      score,
      total_time,
      total_questions,
      correct_answers,
      incorrect_answers,
      skipped_answers,
      session_type = 'practice',
      mock_test_id = null,
      // Optional: orders for dynamically shuffled mock tests
      question_order,
      option_order
    } = body
  
    // Allow anonymous submissions for local verification and testing
    const normalizedUserId = user_id || 'anonymous'

    // Permit anonymous user_id for verification; only validate questions payload
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions are required' }, { status: 400 })
    }

    console.log('Submitting practice session:', { 
      user_id, 
      total_questions, 
      correct_answers,
      incorrect_answers,
      skipped_answers,
      score 
    })

    // Create test result with all required fields
    const { data: testResult, error: testError } = await supabaseAdmin
      .from('test_results')
      .insert({
        user_id: normalizedUserId,
        test_type: session_type === 'mock_test' ? 'mock_test' : 'practice',
        score: score,
        score_percentage: score,
        total_questions: total_questions,
        total_correct: correct_answers,
        total_incorrect: incorrect_answers,
        total_skipped: skipped_answers,
        total_time_taken: total_time, // Fix: Save the total time taken
        session_type: session_type,
        mock_test_id: mock_test_id,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (testError) {
      console.error('Error creating test result:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    // If this was a mock test and orders are provided, log them for deterministic solution rendering
    if (session_type === 'mock_test' && mock_test_id && Array.isArray(question_order) && option_order && typeof option_order === 'object') {
      try {
        await supabaseAdmin
          .from('test_attempt_order_log')
          .insert({
            test_result_id: testResult.id,
            question_order_json: question_order,
            option_order_json: option_order
          })
      } catch (e) {
        console.error('Failed to write test_attempt_order_log:', e)
      }
    }

    // Create answer log entries with correct schema
    try {
      const answerLogEntries = questions.map((question: any) => ({
        result_id: testResult.id, // Use result_id as per schema
        question_id: question.question_id, // This should be the numeric ID
        user_id: normalizedUserId, // Add user_id for performance tracking
        user_answer: question.user_answer,
        status: question.status, // 'correct', 'incorrect', or 'skipped'
        time_taken: question.time_taken, // in seconds
        created_at: new Date().toISOString() // Add timestamp for performance tracking
      }))

      console.log('Inserting answer log entries:', answerLogEntries)

      const { error: answerError } = await supabaseAdmin
        .from('answer_log')
        .insert(answerLogEntries)

      if (answerError) {
        console.error('Error creating answer log:', answerError)
        return NextResponse.json({ error: answerError.message }, { status: 500 })
      }

      console.log(`Successfully created ${answerLogEntries.length} answer log entries`)
    } catch (error) {
      console.error('Error creating answer log entries:', error)
      return NextResponse.json({ error: 'Failed to create answer log entries' }, { status: 500 })
    }

    // For mock tests, calculate accurate score using per-question marking scheme
    if (session_type === 'mock_test' && mock_test_id) {
      try {
        console.log('Calculating accurate score for mock test using per-question marking...')
        const { actualScore, totalMarks } = await calculateScoreForResult(
          supabaseAdmin,
          testResult.id,
          mock_test_id
        )
        
        const scorePercentage = totalMarks > 0 
          ? Math.round((actualScore / totalMarks) * 100 * 100) / 100
          : 0

        // Update test_results with accurate score calculated from per-question marking
        const { error: updateError } = await supabaseAdmin
          .from('test_results')
          .update({ 
            score: actualScore, 
            score_percentage: scorePercentage 
          })
          .eq('id', testResult.id)

        if (updateError) {
          console.error('Error updating test result score:', updateError)
          // Continue anyway - the initial score is saved, just log the error
        } else {
          console.log(`✅ Updated mock test score: ${actualScore} / ${totalMarks} (${scorePercentage}%)`)
        }
      } catch (error) {
        console.error('Error calculating mock test score:', error)
        // Continue anyway - the initial score is saved
      }
    } else if (session_type === 'mock_test') {
      console.warn('⚠️ Mock test submission missing mock_test_id - unable to calculate accurate score')
    }

    console.log(`Successfully submitted test result ${testResult.id} with ${questions.length} answers`)

    return NextResponse.json({ 
      test_id: testResult.id,
      message: 'Test submitted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
