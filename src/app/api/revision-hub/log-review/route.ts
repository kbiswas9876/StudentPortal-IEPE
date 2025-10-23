import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { updateSrsData } from '@/lib/srs/algorithm';
import type { PerformanceRating } from '@/lib/srs/types';

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/revision-hub/log-review
 * 
 * Logs a user's review of a bookmarked question and updates its SRS schedule.
 * The SRS algorithm is only applied if custom reminders are NOT active.
 * 
 * @body bookmarkId - UUID of the bookmark being reviewed
 * @body performanceRating - User's performance rating (1-4)
 *   1 = Again (forgot/incorrect)
 *   2 = Hard (correct but difficult)  
 *   3 = Good (correct with some effort)
 *   4 = Easy (instant recall)
 * @body userId - ID of the user (for verification)
 * 
 * @returns Success status and updated SRS data (if applicable)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookmarkId, performanceRating, userId } = body;

    // ============================================================================
    // STEP 1: Validate Input
    // ============================================================================

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!performanceRating || performanceRating < 1 || performanceRating > 4) {
      return NextResponse.json(
        { error: 'Performance rating must be between 1 and 4' },
        { status: 400 }
      );
    }

    console.log('📝 Logging review:', {
      bookmarkId,
      performanceRating,
      userId,
    });

    // ============================================================================
    // STEP 2: Fetch the Bookmark and Verify Ownership
    // ============================================================================
    
    // The bookmarkId might actually be a question_id (for convenience from the frontend)
    // Try to fetch by ID first, if that fails, try by question_id
    let bookmark;
    let fetchError;
    
    // First attempt: Try as bookmark ID (UUID)
    console.log('🔍 Attempting to find bookmark by ID:', bookmarkId);
    const resultById = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('id', bookmarkId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (resultById.data) {
      console.log('✅ Found bookmark by ID:', resultById.data.id);
      bookmark = resultById.data;
    } else {
      // Second attempt: Try as question_id (string)
      console.log('🔍 Attempting to find bookmark by question_id:', bookmarkId);
      const resultByQuestionId = await supabaseAdmin
        .from('bookmarked_questions')
        .select('*')
        .eq('question_id', bookmarkId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (resultByQuestionId.data) {
        console.log('✅ Found bookmark by question_id:', resultByQuestionId.data.id);
      } else {
        console.log('❌ Bookmark not found by question_id');
      }
      bookmark = resultByQuestionId.data;
      fetchError = resultByQuestionId.error;
    }

    if (fetchError || !bookmark) {
      console.error('❌ Error fetching bookmark:', fetchError);
      console.error('❌ Bookmark lookup failed for:', { bookmarkId, userId });
      return NextResponse.json(
        {
          error: fetchError?.message || 'Bookmark not found',
        },
        { status: fetchError ? 500 : 404 }
      );
    }

    console.log('📝 Bookmark found successfully:', {
      id: bookmark.id,
      question_id: bookmark.question_id,
      current_interval: bookmark.srs_interval,
      current_ease: bookmark.srs_ease_factor
    });

    // ============================================================================
    // STEP 3: Check the Custom Reminder Switch
    // ============================================================================

    if (bookmark.is_custom_reminder_active) {
      // User has custom reminder active - disable it and transition to SRS
      console.log('🔄 Custom reminder active, transitioning to SRS after review');
      
      // First, disable the custom reminder
      await supabaseAdmin
        .from('bookmarked_questions')
        .update({
          is_custom_reminder_active: false,
          custom_next_review_date: null,
        })
        .eq('id', bookmarkId);
      
      // Now proceed with SRS algorithm (continue to Step 4)
    }

    // ============================================================================
    // STEP 4: Fetch User's SRS Pacing Preference
    // ============================================================================

    const { data: prefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('srs_pacing_mode')
      .eq('user_id', userId)
      .maybeSingle()

    const pacingMode = prefs?.srs_pacing_mode ?? 0.00
    console.log('⚙️ User pacing mode:', pacingMode)

    // ============================================================================
    // STEP 5: Apply the SRS Algorithm (with pacing)
    // ============================================================================

    const currentSrsData = {
      srs_repetitions: bookmark.srs_repetitions,
      srs_ease_factor: bookmark.srs_ease_factor,
      srs_interval: bookmark.srs_interval,
      next_review_date: bookmark.next_review_date,
    };

    console.log('📊 Current SRS data:', currentSrsData);

    const updatedSrsData = updateSrsData(
      currentSrsData,
      performanceRating as PerformanceRating,
      pacingMode
    );

    console.log('📈 Updated SRS data:', updatedSrsData);

    // ============================================================================
    // STEP 5: Update the Database
    // ============================================================================
    // IMPORTANT: user_difficulty_rating is NEVER updated by SRS feedback.
    // It is a static user preference that can only be changed via explicit edit.
    // SRS feedback only updates: srs_repetitions, srs_ease_factor, srs_interval, next_review_date

    console.log('💾 Updating bookmark in database with ID:', bookmark.id);
    const { error: updateError } = await supabaseAdmin
      .from('bookmarked_questions')
      .update({
        srs_repetitions: updatedSrsData.srs_repetitions,
        srs_ease_factor: updatedSrsData.srs_ease_factor,
        srs_interval: updatedSrsData.srs_interval,
        next_review_date: updatedSrsData.next_review_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookmark.id);

    if (updateError) {
      console.error('❌ Error updating bookmark:', updateError);
      console.error('❌ Update failed for bookmark ID:', bookmark.id);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Database updated successfully!');
    console.log('📅 New next_review_date:', updatedSrsData.next_review_date);

    // ============================================================================
    // STEP 6: Update Daily Review Summary (for streak tracking)
    // ============================================================================
    
    try {
      // Get current date in UTC (we'll store as DATE which normalizes to UTC)
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📊 Updating daily review summary for date:', today);
      
      // Upsert: increment reviews_completed for today
      const { error: summaryError } = await supabaseAdmin
        .from('daily_review_summary')
        .upsert(
          {
            user_id: userId,
            date: today,
            reviews_completed: 1, // Will be incremented if row exists
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,date',
            // PostgreSQL trick: increment existing value
            ignoreDuplicates: false,
          }
        );
      
      // If upsert doesn't support increment, do manual update
      if (summaryError) {
        console.log('📊 Upsert failed, trying manual increment:', summaryError.message);
        
        // Try to get existing record
        const { data: existing } = await supabaseAdmin
          .from('daily_review_summary')
          .select('reviews_completed')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();
        
        if (existing) {
          // Update existing record
          await supabaseAdmin
            .from('daily_review_summary')
            .update({
              reviews_completed: existing.reviews_completed + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('date', today);
        } else {
          // Insert new record
          await supabaseAdmin
            .from('daily_review_summary')
            .insert({
              user_id: userId,
              date: today,
              reviews_completed: 1,
            });
        }
      }
      
      console.log('✅ Daily review summary updated');
    } catch (summaryError) {
      // Don't fail the whole request if summary update fails
      console.error('⚠️ Error updating daily review summary (non-critical):', summaryError);
    }

    // ============================================================================
    // STEP 7: Return Success Response
    // ============================================================================

    console.log('✅ Review logged successfully');

    return NextResponse.json({
      success: true,
      message: 'Review logged and SRS schedule updated',
      previousSrsData: currentSrsData,
      updatedSrsData: updatedSrsData,
      customReminderActive: false,
    });
  } catch (error) {
    console.error('❌ Unexpected error in log-review endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

