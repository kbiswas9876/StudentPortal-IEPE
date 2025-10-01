import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { cookies } from 'next/headers'

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

    // Get the current user
    const cookieStore = await cookies()
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        auth: {
          storage: {
            getItem: (name: string) => {
              return cookieStore.get(name)?.value || null
            },
            setItem: (name: string, value: string) => {
              // No-op for server-side
            },
            removeItem: (name: string) => {
              // No-op for server-side
            }
          }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Creating error report:', { questionId, userId: user.id, description })

    const { data, error } = await supabaseAdmin
      .from('error_reports')
      .insert({
        question_id: questionId,
        reported_by_user_id: user.id,
        report_description: description,
        status: 'new'
      })
      .select()

    if (error) {
      console.error('Error creating error report:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully created error report:', data[0])

    return NextResponse.json({ 
      data: data[0],
      message: 'Error report submitted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
