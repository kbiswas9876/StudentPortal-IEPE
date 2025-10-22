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
 * GET /api/user/srs-preferences?userId=xxx
 * Fetches user's SRS pacing setting
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    console.log('📋 Fetching SRS preferences for user:', userId)
    
    const { data, error } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('srs_pacing_mode')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error fetching SRS preferences:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ SRS preferences fetched:', data?.srs_pacing_mode ?? 0.00)
    
    // Return default if no record exists
    return NextResponse.json({
      srs_pacing_mode: data?.srs_pacing_mode ?? 0.00
    })
  } catch (error) {
    console.error('❌ Unexpected error in srs-preferences GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

