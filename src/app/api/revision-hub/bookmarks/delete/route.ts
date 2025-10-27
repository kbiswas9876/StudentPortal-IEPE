import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { cookies } from 'next/headers'
import { logStudentActivity } from '@/lib/utils/analyticsHelpers'

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

// POST - Delete a bookmark
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookmarkId } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
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

    console.log('Deleting bookmark:', { bookmarkId, userId: user.id })

    // ============================================================================
    // FETCH BOOKMARK DETAILS BEFORE DELETION FOR ACTIVITY LOGGING
    // ============================================================================
    
    const { data: bookmarkData, error: fetchError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('question_id, custom_tags, user_difficulty_rating')
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
      .single()

    // Delete the bookmark
    const { error } = await supabaseAdmin
      .from('bookmarked_questions')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id) // Ensure user can only delete their own bookmarks

    if (error) {
      console.error('Error deleting bookmark:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully deleted bookmark:', bookmarkId)

    // ============================================================================
    // LOG ACTIVITY EVENT FOR ANALYTICS
    // ============================================================================
    
    try {
      if (!fetchError && bookmarkData) {
        // Fetch question details from the authoritative source
        const { data: questionData } = await supabaseAdmin
          .from('questions')
          .select('id, chapter_name, difficulty')
          .eq('question_id', bookmarkData.question_id)
          .single()

        if (questionData) {
          // Construct metadata object
          const activityMetadata = {
            question_id: bookmarkData.question_id,
            bookmarked_question_id: bookmarkId,
            question_chapter: questionData.chapter_name,
            question_difficulty: questionData.difficulty,
            user_difficulty_rating: bookmarkData.user_difficulty_rating,
            custom_tags: bookmarkData.custom_tags
          }

          // Log the unbookmark activity event
          await logStudentActivity(supabaseAdmin, {
            user_id: user.id,
            activity_type: 'QUESTION_UNBOOKMARKED',
            related_entity_id: parseInt(bookmarkId),
            metadata: activityMetadata
          })
        }
      }
    } catch (logError) {
      // Log error but don't fail the primary operation
      console.error('Error logging unbookmark activity:', logError)
    }

    return NextResponse.json({ 
      message: 'Bookmark deleted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}