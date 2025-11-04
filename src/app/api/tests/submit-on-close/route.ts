import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { calculateScoreForResult } from '@/lib/scoring'
import type { DeviceContext } from '@/lib/device-context'

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

/**
 * POST /api/tests/submit-on-close
 * 
 * Handles test submission when user closes tab/browser during a proctored test.
 * This endpoint receives data via navigator.sendBeacon, which sends a Blob.
 * 
 * The endpoint must be highly efficient as it's called during browser unload.
 */
export async function POST(request: Request) {
  try {
    // Read the request body - navigator.sendBeacon sends a Blob
    const blob = await request.blob()
    const text = await blob.text()
    const body = JSON.parse(text)

    const {
      testId,
      userId,
      questions,
      sessionStates,
      violation,
      totalTime,
      question_order,
      option_order,
      deviceContext
    } = body

    // Validate required fields
    if (!userId || !questions || !Array.isArray(questions)) {
      console.error('Invalid payload for submit-on-close:', { userId, hasQuestions: !!questions })
      return NextResponse.json({ 
        error: 'userId and questions array are required' 
      }, { status: 400 })
    }

    // Allow anonymous submissions for testing, but log a warning
    const normalizedUserId = userId || 'anonymous'
    
    if (normalizedUserId === 'anonymous') {
      console.warn('⚠️ Anonymous submission received via submit-on-close')
    }

    console.log('Submitting test on browser close:', { 
      userId: normalizedUserId,
      testId,
      violation,
      totalQuestions: questions.length,
      totalTime
    })

    // Calculate results from the questions array
    const totalQuestions = questions.length
    const correctAnswers = questions.filter((q: any) => q.status === 'correct').length
    const incorrectAnswers = questions.filter((q: any) => q.status === 'incorrect').length
    const skippedAnswers = questions.filter((q: any) => q.status === 'skipped').length

    // Calculate score (simplified - will be recalculated on server for mock tests)
    // For mock tests, we need test metadata to calculate properly
    let score = 0
    let scorePercentage = 0

    if (testId) {
      // Fetch test metadata to calculate score properly
      try {
        const { data: testData, error: testError } = await supabaseAdmin
          .from('tests')
          .select('marks_per_correct, negative_marks_per_incorrect')
          .eq('id', testId)
          .single()

        if (!testError && testData) {
          const totalMarks = (correctAnswers * testData.marks_per_correct) + 
                            (incorrectAnswers * testData.negative_marks_per_incorrect)
          const maxMarks = totalQuestions * testData.marks_per_correct
          score = totalMarks
          scorePercentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
        }
      } catch (error) {
        console.error('Error fetching test metadata for score calculation:', error)
        // Fallback to percentage-based scoring
        scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
        score = scorePercentage
      }
    } else {
      // Regular practice scoring: percentage based
      scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      score = scorePercentage
    }

    // Create test result
    const { data: testResult, error: testError } = await supabaseAdmin
      .from('test_results')
      .insert({
        user_id: normalizedUserId,
        test_type: testId ? 'mock_test' : 'practice',
        score: score,
        score_percentage: scorePercentage,
        total_questions: totalQuestions,
        total_correct: correctAnswers,
        total_incorrect: incorrectAnswers,
        total_skipped: skippedAnswers,
        total_time_taken: totalTime || 0,
        session_type: testId ? 'mock_test' : 'practice',
        mock_test_id: testId || null,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (testError) {
      console.error('Error creating test result:', testError)
      return NextResponse.json({ 
        error: 'Failed to create test result',
        details: testError.message 
      }, { status: 500 })
    }

    // If this was a mock test and orders are provided, log them
    if (testId && Array.isArray(question_order) && option_order && typeof option_order === 'object') {
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
        // Continue anyway - order logging is not critical
      }
    }

    // Create answer log entries
    try {
      const answerLogEntries = questions.map((question: any) => ({
        result_id: testResult.id,
        question_id: question.question_id,
        user_id: normalizedUserId,
        user_answer: question.user_answer,
        status: question.status, // 'correct', 'incorrect', or 'skipped'
        time_taken: question.time_taken || 0, // in seconds
        created_at: new Date().toISOString()
      }))

      const { error: answerError } = await supabaseAdmin
        .from('answer_log')
        .insert(answerLogEntries)

      if (answerError) {
        console.error('Error creating answer log:', answerError)
        return NextResponse.json({ 
          error: 'Failed to create answer log',
          details: answerError.message 
        }, { status: 500 })
      }

      console.log(`Successfully created ${answerLogEntries.length} answer log entries`)
    } catch (error) {
      console.error('Error creating answer log entries:', error)
      return NextResponse.json({ 
        error: 'Failed to create answer log entries' 
      }, { status: 500 })
    }

    // For mock tests, recalculate accurate score using per-question marking scheme
    if (testId) {
      try {
        const { actualScore, totalMarks } = await calculateScoreForResult(
          supabaseAdmin,
          testResult.id,
          testId
        )
        
        const accurateScorePercentage = totalMarks > 0 
          ? Math.round((actualScore / totalMarks) * 100 * 100) / 100
          : 0

        // Update test_results with accurate score
        await supabaseAdmin
          .from('test_results')
          .update({ 
            score: actualScore, 
            score_percentage: accurateScorePercentage 
          })
          .eq('id', testResult.id)

        console.log(`✅ Updated mock test score: ${actualScore} / ${totalMarks} (${accurateScorePercentage}%)`)
      } catch (error) {
        console.error('Error calculating mock test score:', error)
        // Continue anyway - the initial score is saved
      }
    }

    // Log the security violation
    if (violation === 'BROWSER_CLOSE_VIOLATION') {
      try {
        const deviceInfo = deviceContext as DeviceContext | undefined
        
        await supabaseAdmin
          .from('security_violations')
          .insert({
            user_id: normalizedUserId,
            test_result_id: testResult.id,
            mock_test_id: testId || null,
            violation_type: 'BROWSER_CLOSE_VIOLATION',
            outcome: 'submitted',
            device_type: deviceInfo?.deviceType || null,
            browser_name: deviceInfo?.browserName || null,
            os_name: deviceInfo?.osName || null,
            user_agent_string: deviceInfo?.userAgentString || null
          })

        console.log('✅ Logged BROWSER_CLOSE_VIOLATION security violation')
      } catch (error) {
        console.error('Error logging security violation:', error)
        // Continue anyway - violation logging is not critical for submission
      }
    }

    console.log(`✅ Successfully submitted test result ${testResult.id} via submit-on-close`)

    // Return success - note: this response may not be received by the client
    // as the page is closing, but we return it for logging purposes
    return NextResponse.json({ 
      success: true,
      test_id: testResult.id,
      message: 'Test submitted successfully on browser close' 
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in submit-on-close:', error)
    // Return error but don't throw - we want to log the error even if the page is closing
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

