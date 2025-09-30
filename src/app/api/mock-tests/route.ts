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

// GET - Fetch all mock tests and user's attempts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching mock tests and user attempts for user:', userId)

    // Query 1: Fetch all relevant tests
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .in('status', ['scheduled', 'live', 'completed'])
      .order('start_time', { ascending: true })

    if (testsError) {
      console.error('Error fetching tests:', testsError)
      return NextResponse.json({ error: testsError.message }, { status: 500 })
    }

    // Query 2: Fetch user's attempts
    const { data: userAttempts, error: attemptsError } = await supabaseAdmin
      .from('test_results')
      .select('mock_test_id, score_percentage, id')
      .eq('user_id', userId)
      .eq('session_type', 'mock_test')

    if (attemptsError) {
      console.error('Error fetching user attempts:', attemptsError)
      return NextResponse.json({ error: attemptsError.message }, { status: 500 })
    }

    console.log(`Successfully fetched ${tests?.length || 0} tests and ${userAttempts?.length || 0} user attempts`)

    return NextResponse.json({
      data: {
        tests: tests || [],
        userAttempts: userAttempts || []
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
