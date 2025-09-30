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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Get the current user
    const cookieStore = cookies()
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id')
      .eq('question_id', questionId.toString())
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing bookmark:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingBookmark) {
      // Remove existing bookmark
      const { error: deleteError } = await supabaseAdmin
        .from('bookmarked_questions')
        .delete()
        .eq('question_id', questionId.toString())
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing bookmark:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Bookmark removed', bookmarked: false })
    } else {
      // Add new bookmark
      const { error: insertError } = await supabaseAdmin
        .from('bookmarked_questions')
        .insert({
          question_id: questionId.toString(),
          user_id: user.id
        })

      if (insertError) {
        console.error('Error adding bookmark:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Bookmark added', bookmarked: true })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
