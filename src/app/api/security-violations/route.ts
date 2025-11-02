import { NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

// Use admin client for inserts (bypasses RLS safely on server)
const supabaseAdmin = createAdminClient()

/**
 * POST /api/security-violations
 * 
 * Logs a security violation detected during a mock test session.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      testResultId,
      mockTestId,
      violationType,
      outcome,
      deviceType,
      browserName,
      osName,
      userAgentString
    } = body

    // Validate required fields
    if (!userId || !violationType || !outcome) {
      return NextResponse.json({
        error: 'userId, violationType, and outcome are required'
      }, { status: 400 })
    }

    // Validate outcome value
    if (!['cancelled', 'submitted'].includes(outcome)) {
      return NextResponse.json({
        error: 'outcome must be either "cancelled" or "submitted"'
      }, { status: 400 })
    }

    // Authenticate user using server client (supports Authorization Bearer token)
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const supabase = await createServerClient(token)
    const { data: { user }, error: getUserError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser()

    if (getUserError) {
      console.error('Security-violations getUser error:', {
        message: getUserError.message,
        code: (getUserError as any)?.code,
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify that the userId in the request matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json({ 
        error: 'User ID mismatch. Cannot log violation for another user.' 
      }, { status: 403 })
    }

    console.log('Logging security violation:', { 
      userId: user.id, 
      testResultId, 
      mockTestId,
      violationType, 
      outcome 
    })

    const insertData = {
      user_id: userId,
      test_result_id: testResultId || null,
      mock_test_id: mockTestId || null,
      violation_type: violationType,
      outcome: outcome,
      device_type: deviceType || null,
      browser_name: browserName || null,
      os_name: osName || null,
      user_agent_string: userAgentString || null
    }

    const { data, error } = await supabaseAdmin
      .from('security_violations')
      .insert(insertData as any)
      .select()
      .single()

    if (error) {
      console.error('Error inserting security violation:', error)
      return NextResponse.json({ 
        error: 'Failed to log security violation',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in security-violations API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
