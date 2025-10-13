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

// POST - Update bookmark with rating, personal note, and custom tags
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookmarkId, rating, personalNote, customTags } = body

    console.log('📝 Update request received:', { bookmarkId, rating, personalNote, customTags })

    if (!bookmarkId) {
      console.error('❌ No bookmark ID provided')
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      console.error('❌ Invalid rating value:', rating)
      return NextResponse.json({ error: 'Rating must be between 1 and 5, or null' }, { status: 400 })
    }

    // Build update object dynamically based on what's provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (rating !== undefined) {
      updateData.user_difficulty_rating = rating
    }
    if (personalNote !== undefined) {
      updateData.personal_note = personalNote || null
    }
    if (customTags !== undefined) {
      updateData.custom_tags = customTags || null
    }

    console.log('📦 Update data:', updateData)

    const { data, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .update(updateData)
      .eq('id', bookmarkId)
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ 
        error: 'Database error: ' + error.message,
        details: error 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error('❌ Bookmark not found. BookmarkId:', bookmarkId)
      return NextResponse.json({ 
        error: 'Bookmark not found',
        bookmarkId
      }, { status: 404 })
    }

    console.log('✅ Successfully updated bookmark:', data[0])

    return NextResponse.json({ 
      data: data[0],
      message: 'Bookmark updated successfully' 
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}