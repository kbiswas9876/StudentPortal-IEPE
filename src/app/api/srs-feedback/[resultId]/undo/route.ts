import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
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
 * POST /api/srs-feedback/[resultId]/undo
 * 
 * Undoes SRS feedback for a question by rolling back the bookmark to its original state
 * and removing the entry from the feedback log.
 * 
 * Request body:
 * - questionId: string (question_id from questions table)
 * - userId: string (for verification)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params
    const body = await request.json()
    const { questionId, userId } = body

    console.log('🔄 [SRS Feedback] Undo request:', { resultId, questionId, userId })

    // ============================================================================
    // STEP 1: Validate Input
    // ============================================================================

    if (!resultId || !questionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: resultId, questionId, userId' },
        { status: 400 }
      )
    }

    // ============================================================================
    // STEP 2: Verify User Owns This Test Result & Fetch Feedback Log
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

    const feedbackLog: SrsFeedbackLog = (testResult.srs_feedback_log as SrsFeedbackLog) || {}

    // ============================================================================
    // STEP 3: Check if Feedback Exists for This Question
    // ============================================================================

    const feedbackEntry = feedbackLog[questionId]

    if (!feedbackEntry) {
      console.log('⚠️ No feedback found for this question, nothing to undo')
      return NextResponse.json({
        success: true,
        feedbackLog,
        message: 'No feedback to undo',
      })
    }

    console.log('📊 Found feedback to undo:', feedbackEntry)

    // ============================================================================
    // STEP 4: Get Current Bookmark
    // ============================================================================

    const { data: bookmark, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id, question_id')
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
    // STEP 5: Rollback Bookmark to Original State
    // ============================================================================

    const originalState = feedbackEntry.originalSrsState

    const { error: rollbackError } = await supabaseAdmin
      .from('bookmarked_questions')
      .update({
        srs_repetitions: originalState.srs_repetitions,
        srs_ease_factor: originalState.srs_ease_factor,
        srs_interval: originalState.srs_interval,
        next_review_date: originalState.next_review_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookmark.id)

    if (rollbackError) {
      console.error('❌ Error rolling back bookmark:', rollbackError)
      return NextResponse.json(
        { error: 'Failed to rollback bookmark' },
        { status: 500 }
      )
    }

    console.log('✅ Bookmark rolled back to original state:', originalState)

    // ============================================================================
    // STEP 6: Remove Entry from Feedback Log
    // ============================================================================

    delete feedbackLog[questionId]

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

    console.log('✅ Feedback log updated (entry removed)')

    // ============================================================================
    // STEP 7: Return Updated Feedback Log
    // ============================================================================

    return NextResponse.json({
      success: true,
      feedbackLog,
      message: 'Feedback undone successfully',
    })

  } catch (error) {
    console.error('❌ Unexpected error in undo endpoint:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

