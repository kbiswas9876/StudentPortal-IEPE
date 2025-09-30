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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')
    const userId = searchParams.get('userId')

    if (!bookmarkId || !userId) {
      return NextResponse.json({ error: 'Bookmark ID and User ID are required' }, { status: 400 })
    }

    console.log('Deleting bookmark:', { bookmarkId, userId })

    // Delete the bookmark
    const { error } = await supabaseAdmin
      .from('bookmarked_questions')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId) // Ensure user can only delete their own bookmarks

    if (error) {
      console.error('Error deleting bookmark:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully deleted bookmark:', bookmarkId)

    return NextResponse.json({ 
      message: 'Bookmark deleted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
