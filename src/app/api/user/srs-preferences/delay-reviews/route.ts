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

/**
 * POST /api/user/srs-preferences/delay-reviews
 * 
 * Delays all existing bookmarks by a specified number of days.
 * Applies to both next_review_date and custom_next_review_date.
 */
export async function POST(request: Request) {
  try {
    const { userId, delayDays } = await request.json()
    
    // Validation
    if (!userId || typeof delayDays !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    if (delayDays < 1 || delayDays > 365) {
      return NextResponse.json({ 
        error: 'Delay days must be between 1 and 365' 
      }, { status: 400 })
    }
    
    console.log(`⏰ Delaying all reviews by ${delayDays} days for user ${userId}`)
    
    // Fetch all bookmarks
    const { data: bookmarks, error: fetchError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id, next_review_date, custom_next_review_date')
      .eq('user_id', userId)
    
    if (fetchError) {
      console.error('❌ Error fetching bookmarks:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!bookmarks || bookmarks.length === 0) {
      console.log('⚠️ No bookmarks to delay')
      return NextResponse.json({ 
        success: true, 
        message: 'No bookmarks to delay',
        updatedCount: 0 
      })
    }
    
    console.log(`🔄 Delaying ${bookmarks.length} bookmarks`)
    
    // Calculate new dates
    const updates = bookmarks.map(bookmark => {
      const addDays = (dateStr: string | null, days: number): string | null => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        date.setDate(date.getDate() + days)
        return date.toISOString().split('T')[0]
      }
      
      return {
        id: bookmark.id,
        next_review_date: addDays(bookmark.next_review_date, delayDays),
        custom_next_review_date: addDays(bookmark.custom_next_review_date, delayDays)
      }
    })
    
    // Bulk update in batches
    const batchSize = 100
    let updatedCount = 0
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      const { error: updateError } = await supabaseAdmin
        .from('bookmarked_questions')
        .upsert(batch, { onConflict: 'id' })
      
      if (updateError) {
        console.error(`❌ Error updating batch ${i / batchSize + 1}:`, updateError)
        return NextResponse.json({ 
          error: `Failed at batch ${i / batchSize + 1}: ${updateError.message}` 
        }, { status: 500 })
      }
      
      updatedCount += batch.length
      console.log(`✅ Updated batch ${i / batchSize + 1} (${batch.length} cards)`)
    }
    
    console.log(`✅ Delayed ${updatedCount} bookmarks by ${delayDays} days`)
    
    return NextResponse.json({
      success: true,
      message: `Delayed ${updatedCount} reviews by ${delayDays} days`,
      updatedCount
    })
    
  } catch (error) {
    console.error('❌ Error in delay-reviews endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

