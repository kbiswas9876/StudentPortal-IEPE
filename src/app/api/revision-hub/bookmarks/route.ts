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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching bookmarked questions for user:', userId)

    // Fetch bookmarked questions with JOIN to get full question data
    const { data, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .select(`
        id,
        personal_note,
        custom_tags,
        created_at,
        questions (
          id,
          question_id,
          book_source,
          chapter_name,
          question_number_in_book,
          question_text,
          options,
          correct_option,
          solution_text,
          exam_metadata,
          admin_tags,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarked questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Successfully fetched ${data?.length || 0} bookmarked questions`)

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
