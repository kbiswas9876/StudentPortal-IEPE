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

// POST - Update bookmark with personal note and custom tags
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookmarkId, personalNote, customTags } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
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

    console.log('Updating bookmark:', { bookmarkId, personalNote, customTags })

    const { data, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .update({
        personal_note: personalNote || null,
        custom_tags: customTags || null
      })
      .eq('id', bookmarkId)
      .eq('user_id', user.id) // Ensure user can only update their own bookmarks
      .select()

    if (error) {
      console.error('Error updating bookmark:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Bookmark not found or access denied' }, { status: 404 })
    }

    console.log('Successfully updated bookmark:', data[0])

    return NextResponse.json({ 
      data: data[0],
      message: 'Bookmark updated successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}