import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

/**
 * GET /api/srs-feedback/[resultId]
 * 
 * Fetches the SRS feedback log for a specific test result.
 * This log contains all feedback given during the solution review session.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params

    if (!resultId) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      )
    }

    // Extract auth token from Authorization header
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const supabase = await createServerClient(token)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch test result - try with srs_feedback_log first
    let testResult
    let testError
    
    // Try to fetch with srs_feedback_log column
    const resultWithLog = await supabase
      .from('test_results')
      .select('id, user_id, srs_feedback_log')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single()
    
    // If column doesn't exist yet (migration not run), fetch without it
    if (resultWithLog.error && resultWithLog.error.message?.includes('column')) {
      console.log('⚠️ srs_feedback_log column not found, returning empty feedback log')
      const resultWithoutLog = await supabase
        .from('test_results')
        .select('id, user_id')
        .eq('id', resultId)
        .eq('user_id', user.id)
        .single()
      
      testResult = resultWithoutLog.data
      testError = resultWithoutLog.error
    } else {
      testResult = resultWithLog.data
      testError = resultWithLog.error
    }

    if (testError || !testResult) {
      console.error('Error fetching test result:', testError)
      return NextResponse.json(
        { error: 'Test result not found or access denied' },
        { status: 404 }
      )
    }

    // Return feedback log (empty object if column doesn't exist yet)
    return NextResponse.json({
      success: true,
      feedbackLog: (testResult as any).srs_feedback_log || {}
    })

  } catch (error) {
    console.error('Error in srs-feedback GET endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

