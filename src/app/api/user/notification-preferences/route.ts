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
 * GET /api/user/notification-preferences
 * 
 * Fetches the current notification settings for the authenticated user.
 * If no preferences exist, creates a default record and returns it.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('📋 Fetching notification preferences for user:', userId);

    // Try to fetch existing preferences
    const { data: preferences, error: fetchError } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('❌ Error fetching preferences:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // If preferences exist, return them
    if (preferences) {
      console.log('✅ Found existing preferences:', preferences);
      return NextResponse.json({ data: preferences });
    }

    // No preferences exist - create default preferences
    console.log('📝 No preferences found, creating defaults');
    const defaultPreferences = {
      user_id: userId,
      enable_email_reminders: true,
      enable_in_app_reminders: true,
      reminder_time: '09:00',
      user_timezone: 'Asia/Kolkata',
    };

    const { data: newPreferences, error: createError } = await supabaseAdmin
      .from('user_notification_preferences')
      .insert([defaultPreferences])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating default preferences:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    console.log('✅ Created default preferences:', newPreferences);
    return NextResponse.json({ data: newPreferences });
  } catch (error) {
    console.error('❌ Unexpected error in notification-preferences GET:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 * 
 * Updates the user's notification settings.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      enable_email_reminders,
      enable_in_app_reminders,
      reminder_time,
      user_timezone,
    } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof enable_email_reminders !== 'boolean' || typeof enable_in_app_reminders !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid notification toggle values' },
        { status: 400 }
      );
    }

    if (!reminder_time || !/^\d{2}:\d{2}$/.test(reminder_time)) {
      return NextResponse.json(
        { error: 'Invalid reminder time format. Expected HH:MM' },
        { status: 400 }
      );
    }

    if (!user_timezone || user_timezone.length === 0) {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }

    console.log('💾 Updating notification preferences for user:', userId);

    // Note: We don't manually set updated_at as it's handled by a database trigger
    const { error: updateError } = await supabaseAdmin
      .from('user_notification_preferences')
      .update({
        enable_email_reminders,
        enable_in_app_reminders,
        reminder_time,
        user_timezone,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating preferences:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Successfully updated notification preferences');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in notification-preferences PUT:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

