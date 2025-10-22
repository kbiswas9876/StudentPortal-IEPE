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
 * Shifts all existing bookmarks by a specified number of days.
 * Positive numbers delay, negative numbers advance.
 * Applies to both next_review_date and custom_next_review_date.
 * Reviews that would be scheduled in the past are set to today.
 */
export async function POST(request: Request) {
  try {
    const { userId, delayDays } = await request.json()
    
    // Validation
    if (!userId || typeof delayDays !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    // Allow negative numbers (advance) and positive numbers (delay)
    if (delayDays === 0) {
      return NextResponse.json({ 
        error: 'Shift value cannot be zero' 
      }, { status: 400 })
    }
    
    if (delayDays < -365 || delayDays > 365) {
      return NextResponse.json({ 
        error: 'Shift days must be between -365 and 365' 
      }, { status: 400 })
    }
    
    const action = delayDays < 0 ? 'Advancing' : 'Delaying'
    console.log(`⏰ ${action} all reviews by ${Math.abs(delayDays)} days for user ${userId}`)
    
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
      console.log('⚠️ No bookmarks to shift')
      return NextResponse.json({ 
        success: true, 
        message: 'No bookmarks to shift',
        updatedCount: 0,
        nowDueCount: 0
      })
    }
    
    console.log(`🔄 Shifting ${bookmarks.length} bookmarks`)
    
    // Get today's date (start of day in UTC)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    // Track how many reviews become due today
    let nowDueCount = 0
    
    // Calculate new dates with past-due logic
    const updates = bookmarks.map(bookmark => {
      const shiftDate = (dateStr: string | null, days: number): string | null => {
        if (!dateStr) return null
        
        const date = new Date(dateStr)
        date.setUTCHours(0, 0, 0, 0) // Normalize to start of day
        date.setDate(date.getDate() + days)
        
        // CRITICAL LOGIC: If the new date is in the past or is today, set to today
        if (date <= today) {
          // Only count if it wasn't already due today
          const originalDate = new Date(dateStr)
          originalDate.setUTCHours(0, 0, 0, 0)
          if (originalDate > today) {
            nowDueCount++
          }
          return todayStr
        }
        
        return date.toISOString().split('T')[0]
      }
      
      return {
        id: bookmark.id,
        next_review_date: shiftDate(bookmark.next_review_date, delayDays),
        custom_next_review_date: shiftDate(bookmark.custom_next_review_date, delayDays)
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
    
    console.log(`✅ ${action === 'Advancing' ? 'Advanced' : 'Delayed'} ${updatedCount} bookmarks by ${Math.abs(delayDays)} days`)
    if (nowDueCount > 0) {
      console.log(`📅 ${nowDueCount} reviews are now due today`)
    }
    
    return NextResponse.json({
      success: true,
      message: `${action === 'Advancing' ? 'Advanced' : 'Delayed'} ${updatedCount} reviews by ${Math.abs(delayDays)} days`,
      updatedCount,
      nowDueCount
    })
    
  } catch (error) {
    console.error('❌ Error in delay-reviews endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

