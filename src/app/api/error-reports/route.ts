import { NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import { Database } from '@/types/database'

// Use admin client for inserts (bypasses RLS safely on server)
const supabaseAdmin = createAdminClient()

// POST - Create a new error report
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionId, description } = body

    if (!questionId || !description) {
      return NextResponse.json({
        error: 'Question ID and description are required'
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
      console.error('Error-reports getUser error:', {
        message: getUserError.message,
        code: (getUserError as any)?.code,
        details: (getUserError as any)?.details,
        hint: (getUserError as any)?.hint,
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Creating error report:', { questionId, userId: user.id, description })

    const insertData = {
      question_id: questionId,
      reported_by_user_id: user.id,
      report_description: description,
      status: 'new' as const
    }

    const { data, error } = await supabaseAdmin
      .from('error_reports')
      .insert(insertData as any) // Type assertion needed due to Supabase client type inference issue
      .select()
      .single()

    if (error) {
      console.error('Error creating error report:', {
        error,
        message: error.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully created error report:', data)

    return NextResponse.json({
      data,
      message: 'Error report submitted successfully'
    })
  } catch (error) {
    // Enhanced error logging with full details
    console.error('[ERROR-REPORTS] Unexpected error in POST handler:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
