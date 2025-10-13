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

// POST - Update user difficulty rating for a bookmarked question
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookmarkId, rating } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5, or null' }, { status: 400 })
    }

    console.log('Updating rating for bookmark:', { bookmarkId, rating })

    const { data, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .update({ 
        user_difficulty_rating: rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookmarkId)
      .select()
      .single()

    if (error) {
      console.error('Error updating rating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Rating updated successfully')
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

