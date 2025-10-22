import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { updateSrsData } from '@/lib/srs/algorithm'
import type { PerformanceRating } from '@/lib/srs/types'
import type { SrsFeedbackLog } from '@/types/database'

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * POST /api/srs-feedback/[resultId]/submit
 * 
 * Submits SRS feedback for a question, updates the bookmark, and logs to test_results.
 * 
 * Request body:
 * - questionId: string (question_id from questions table)
 * - rating: 1 | 2 | 3 | 4 (Again/Hard/Good/Easy)
 * - userId: string (for verification)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params
    const body = await request.json()
    const { questionId, rating, userId } = body

    console.log('📝 [SRS Feedback] Submit request:', { resultId, questionId, rating, userId })

    // ============================================================================
    // STEP 1: Validate Input
    // ============================================================================

    if (!resultId || !questionId || !rating || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: resultId, questionId, rating, userId' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 4) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 4' },
        { status: 400 }
      )
    }

    // ============================================================================
    // STEP 2: Verify User Owns This Test Result
    // ============================================================================

    // Try to fetch with srs_feedback_log column
    const resultWithLog = await supabaseAdmin
      .from('test_results')
      .select('id, user_id, srs_feedback_log')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle()
    
    let testResult
    let testError
    
    // If column doesn't exist yet, fetch without it
    if (resultWithLog.error && resultWithLog.error.message?.includes('column')) {
      console.log('⚠️ srs_feedback_log column not found, migration required')
      return NextResponse.json(
        { error: 'Database migration required. Please run: supabase/migrations/add_srs_feedback_log.sql' },
        { status: 503 }
      )
    } else {
      testResult = resultWithLog.data
      testError = resultWithLog.error
    }

    // Check if no result was found
    if (!testResult && !testError) {
      console.error('❌ Test result not found (0 rows returned)')
      return NextResponse.json(
        { error: 'Test result not found. You may need to complete a new practice session.' },
        { status: 404 }
      )
    }

    if (testError || !testResult) {
      console.error('❌ Test result not found:', testError)
      return NextResponse.json(
        { error: 'Test result not found or access denied' },
        { status: 404 }
      )
    }

    console.log('✅ Test result verified:', testResult.id)

    // ============================================================================
    // STEP 3: Get Current Bookmark State
    // ============================================================================

    const { data: bookmark, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id, question_id, srs_repetitions, srs_ease_factor, srs_interval, next_review_date')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single()

    if (bookmarkError || !bookmark) {
      console.error('❌ Bookmark not found:', bookmarkError)
      return NextResponse.json(
        { error: 'Bookmark not found for this question' },
        { status: 404 }
      )
    }

    console.log('✅ Bookmark found:', bookmark.id)

    // ============================================================================
    // STEP 4: Determine Original SRS State
    // ============================================================================
    // If this is the first feedback for this question in this session,
    // store the ORIGINAL state. If re-selecting after undo, use the stored original.

    const feedbackLog: SrsFeedbackLog = (testResult.srs_feedback_log as SrsFeedbackLog) || {}
    const existingEntry = feedbackLog[questionId]

    const originalState = existingEntry?.originalSrsState || {
      srs_repetitions: bookmark.srs_repetitions,
      srs_ease_factor: bookmark.srs_ease_factor,
      srs_interval: bookmark.srs_interval,
      next_review_date: bookmark.next_review_date,
    }

    console.log('📊 Original SRS state:', originalState)

    // ============================================================================
    // STEP 5: Calculate New SRS Data from Original State
    // ============================================================================
    // CRITICAL: Always calculate from original state to ensure undo/reselect works correctly

    const newSrsData = updateSrsData(originalState, rating as PerformanceRating)

    console.log('📈 New SRS data calculated:', newSrsData)

    // ============================================================================
    // STEP 6: Update Bookmark in Database
    // ============================================================================

    const { error: updateError } = await supabaseAdmin
      .from('bookmarked_questions')
      .update({
        srs_repetitions: newSrsData.srs_repetitions,
        srs_ease_factor: newSrsData.srs_ease_factor,
        srs_interval: newSrsData.srs_interval,
        next_review_date: newSrsData.next_review_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookmark.id)

    if (updateError) {
      console.error('❌ Error updating bookmark:', updateError)
      return NextResponse.json(
        { error: 'Failed to update bookmark' },
        { status: 500 }
      )
    }

    console.log('✅ Bookmark updated successfully')

    // ============================================================================
    // STEP 7: Update Feedback Log in test_results
    // ============================================================================

    feedbackLog[questionId] = {
      rating: rating as 1 | 2 | 3 | 4,
      timestamp: new Date().toISOString(),
      originalSrsState: originalState,
    }

    const { error: logError } = await supabaseAdmin
      .from('test_results')
      .update({ srs_feedback_log: feedbackLog })
      .eq('id', resultId)

    if (logError) {
      console.error('❌ Error updating feedback log:', logError)
      return NextResponse.json(
        { error: 'Failed to update feedback log' },
        { status: 500 }
      )
    }

    console.log('✅ Feedback log updated successfully')

    // ============================================================================
    // STEP 8: Emit SRS Review Complete Event Data
    // ============================================================================
    // This allows the frontend to update the due counter

    return NextResponse.json({
      success: true,
      feedbackLog,
      updatedSrsData: newSrsData,
      message: 'Feedback submitted successfully',
    })

  } catch (error) {
    console.error('❌ Unexpected error in submit endpoint:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

