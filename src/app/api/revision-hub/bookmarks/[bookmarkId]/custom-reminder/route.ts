import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

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
 * PUT /api/revision-hub/bookmarks/[bookmarkId]/custom-reminder
 * 
 * Sets, updates, or disables a custom reminder for a bookmarked question.
 * When a custom reminder is active, the SRS algorithm is bypassed for that question.
 * 
 * @param bookmarkId - The ID of the bookmark to update
 * @body isCustomReminderActive - Boolean indicating if custom reminder is enabled
 * @body customNextReviewDate - The custom review date (YYYY-MM-DD) or null
 * @body userId - The user ID for verification
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bookmarkId: string }> }
) {
  try {
    const { bookmarkId } = await params;
    const body = await request.json();
    const { isCustomReminderActive, customNextReviewDate, userId } = body;

    // ============================================================================
    // STEP 1: Validate Input
    // ============================================================================

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    if (typeof isCustomReminderActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isCustomReminderActive must be a boolean' },
        { status: 400 }
      );
    }

    // Validate date format if custom reminder is active
    if (isCustomReminderActive) {
      if (!customNextReviewDate) {
        return NextResponse.json(
          { error: 'Custom review date is required when custom reminder is active' },
          { status: 400 }
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(customNextReviewDate)) {
        return NextResponse.json(
          { error: 'Invalid date format. Expected YYYY-MM-DD' },
          { status: 400 }
        );
      }

      // Validate that date is not in the past
      const selectedDate = new Date(customNextReviewDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return NextResponse.json(
          { error: 'Custom reminder date cannot be in the past' },
          { status: 400 }
        );
      }
    }

    console.log('📅 Setting custom reminder:', {
      bookmarkId,
      userId,
      isCustomReminderActive,
      customNextReviewDate,
    });

    // ============================================================================
    // STEP 2: Verify Bookmark Ownership
    // ============================================================================

    const { data: bookmark, error: fetchError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('id', bookmarkId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !bookmark) {
      console.error('❌ Error fetching bookmark:', fetchError);
      return NextResponse.json(
        { error: fetchError?.message || 'Bookmark not found' },
        { status: fetchError ? 500 : 404 }
      );
    }

    // ============================================================================
    // STEP 3: Update Custom Reminder Settings
    // ============================================================================

    const updateData: any = {
      is_custom_reminder_active: isCustomReminderActive,
      custom_next_review_date: isCustomReminderActive ? customNextReviewDate : null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('bookmarked_questions')
      .update(updateData)
      .eq('id', bookmarkId);

    if (updateError) {
      console.error('❌ Error updating custom reminder:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Custom reminder updated successfully');

    return NextResponse.json({
      success: true,
      message: isCustomReminderActive
        ? `Custom reminder set for ${customNextReviewDate}`
        : 'Custom reminder disabled - question will use SRS scheduling',
    });
  } catch (error) {
    console.error('❌ Unexpected error in custom-reminder endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

