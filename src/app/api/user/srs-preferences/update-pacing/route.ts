import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { applyPacingToInterval, calculatePacedReviewDate } from '@/lib/srs/pacing'

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
 * POST /api/user/srs-preferences/update-pacing
 * 
 * Updates user's pacing mode and performs bulk recalculation of all existing bookmarks.
 * This is a critical operation that must be atomic and performant.
 */
export async function POST(request: Request) {
  try {
    const { userId, pacingMode } = await request.json()
    
    // Validation
    if (!userId || typeof pacingMode !== 'number') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    if (pacingMode < -1 || pacingMode > 1) {
      return NextResponse.json({ 
        error: 'Pacing mode must be between -1.00 and 1.00' 
      }, { status: 400 })
    }
    
    console.log(`📊 Updating SRS pacing for user ${userId} to ${pacingMode}`)
    
    // Step 1: Update user's pacing preference
    const { error: prefError } = await supabaseAdmin
      .from('user_notification_preferences')
      .update({ srs_pacing_mode: pacingMode })
      .eq('user_id', userId)
    
    if (prefError) {
      console.error('❌ Error updating preferences:', prefError)
      return NextResponse.json({ error: prefError.message }, { status: 500 })
    }
    
    console.log('✅ Preference updated')
    
    // Step 2: Fetch all user's bookmarks
    const { data: bookmarks, error: fetchError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id, srs_interval, created_at, next_review_date')
      .eq('user_id', userId)
    
    if (fetchError) {
      console.error('❌ Error fetching bookmarks:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!bookmarks || bookmarks.length === 0) {
      console.log('⚠️ No bookmarks to update')
      return NextResponse.json({ 
        success: true, 
        message: 'No bookmarks to update',
        updatedCount: 0,
        newlyDueCount: 0
      })
    }
    
    console.log(`🔄 Recalculating ${bookmarks.length} bookmarks with new pacing`)
    
    // Step 3: Bulk recalculate all intervals
    const today = new Date().toISOString().split('T')[0]
    const updates = bookmarks.map(bookmark => {
      // Get the original interval (before pacing was applied)
      // This is stored in srs_interval, which we now need to re-apply pacing to
      const baselineInterval = bookmark.srs_interval
      
      // Apply new pacing to the baseline interval
      const adjustedInterval = applyPacingToInterval(baselineInterval, pacingMode)
      
      // Calculate how many days ago the last review was
      const lastReviewDate = new Date(bookmark.next_review_date || bookmark.created_at)
      const daysSinceReview = Math.floor(
        (new Date().getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Calculate new next review date based on when the card was last scheduled
      const daysUntilNextReview = Math.max(0, adjustedInterval - daysSinceReview)
      const nextReviewDate = calculatePacedReviewDate(daysUntilNextReview)
      
      return {
        id: bookmark.id,
        srs_interval: adjustedInterval,
        next_review_date: nextReviewDate
      }
    })
    
    // Step 4: Perform bulk update using Supabase's upsert
    // We'll update in batches of 100 for performance
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
    
    console.log(`✅ Successfully recalculated ${updatedCount} bookmarks`)
    
    // Count how many cards became due today
    const newlyDueCount = updates.filter(u => u.next_review_date === today).length
    
    return NextResponse.json({
      success: true,
      message: `Updated pacing to ${pacingMode}`,
      updatedCount,
      newlyDueCount
    })
    
  } catch (error) {
    console.error('❌ Error in update-pacing endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

