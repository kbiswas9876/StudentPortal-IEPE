import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

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
    const { questionIds } = body

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Question IDs are required' }, { status: 400 })
    }

    console.log('Fetching questions for practice session:', questionIds)
    console.log('Question IDs type check:', questionIds.map(id => ({ id, type: typeof id })))

    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('question_id', questionIds)
      .order('question_number_in_book')

    if (error) {
      console.error('Error fetching practice questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 })
    }

    console.log(`Successfully fetched ${data.length} questions for practice session`)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
