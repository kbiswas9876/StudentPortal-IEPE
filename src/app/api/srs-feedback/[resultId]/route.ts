import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'
import { env } from '@/lib/env'

// Use admin client to bypass RLS for test_results queries
const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * GET /api/srs-feedback/[resultId]
 * 
 * Fetches the SRS feedback log for a specific test result.
 * This log contains all feedback given during the solution review session.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params

    console.log('🔍 [SRS Feedback GET] Request for resultId:', resultId)

    if (!resultId) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      )
    }

    // Extract auth token from Authorization header
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    console.log('🔐 [SRS Feedback GET] Has auth token:', !!token)

    const supabase = await createServerClient(token)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ [SRS Feedback GET] Auth failed:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ [SRS Feedback GET] User authenticated:', user.id)

    // Fetch test result - try with srs_feedback_log first
    let testResult
    let testError
    
    // Try to fetch with srs_feedback_log column using admin client (bypasses RLS)
    console.log('📊 [SRS Feedback GET] Querying test_results for id:', resultId, 'user:', user.id)
    
    const resultWithLog = await supabaseAdmin
      .from('test_results')
      .select('id, user_id, srs_feedback_log')
      .eq('id', resultId)
      .eq('user_id', user.id) // Still verify ownership
      .maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows gracefully
    
    console.log('📊 [SRS Feedback GET] Query result:', { 
      hasData: !!resultWithLog.data, 
      hasError: !!resultWithLog.error,
      errorMessage: resultWithLog.error?.message,
      errorCode: resultWithLog.error?.code
    })
    
    // If column doesn't exist yet (migration not run), fetch without it
    if (resultWithLog.error && resultWithLog.error.message?.includes('column')) {
      console.log('⚠️ [SRS Feedback GET] srs_feedback_log column not found, returning empty feedback log')
      const resultWithoutLog = await supabaseAdmin
        .from('test_results')
        .select('id, user_id')
        .eq('id', resultId)
        .eq('user_id', user.id) // Still verify ownership
        .maybeSingle() // Use maybeSingle() to handle 0 rows
      
      testResult = resultWithoutLog.data
      testError = resultWithoutLog.error
    } else {
      testResult = resultWithLog.data
      testError = resultWithLog.error
    }
    
    // If no test result found at all, it might not exist or user doesn't have access
    if (!testResult && !testError) {
      console.error('❌ [SRS Feedback GET] Test result not found (0 rows returned)')
      return NextResponse.json(
        { error: 'Test result not found. You may need to complete a new practice session.' },
        { status: 404 }
      )
    }

    if (testError || !testResult) {
      console.error('❌ [SRS Feedback GET] Error fetching test result:', {
        error: testError,
        resultId,
        userId: user.id
      })
      return NextResponse.json(
        { error: 'Test result not found or access denied' },
        { status: 404 }
      )
    }

    console.log('✅ [SRS Feedback GET] Test result found:', testResult.id)

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

