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
 * CRON Job: Automatic Test Status Transitions
 * 
 * This endpoint is called every minute by Vercel Cron to automatically
 * transition test statuses based on their scheduled times:
 * 
 * - scheduled → live: When current time >= start_time
 * - live → completed: When current time >= end_time
 * 
 * Security: Protected by CRON_SECRET environment variable
 * Schedule: Every minute (* * * * *)
 */
export async function GET(request: Request) {
  try {
    // Verify authorization using CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      )
    }
    
    if (authHeader !== expectedAuth) {
      console.warn('Unauthorized CRON attempt:', { authHeader })
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const now = new Date().toISOString()
    console.log('Running test status update CRON job at:', now)

    // ========================================================================
    // TRANSITION 1: Scheduled → Live
    // ========================================================================
    const { data: scheduledToLive, error: scheduledError } = await supabaseAdmin
      .from('tests')
      .update({ status: 'live', updated_at: now })
      .eq('status', 'scheduled')
      .lte('start_time', now)
      .select('id, name')

    if (scheduledError) {
      console.error('Error transitioning scheduled → live:', scheduledError)
    } else if (scheduledToLive && scheduledToLive.length > 0) {
      console.log(`✅ Transitioned ${scheduledToLive.length} test(s) to LIVE:`, 
        scheduledToLive.map(t => `#${t.id} "${t.name}"`).join(', ')
      )
    }

    // ========================================================================
    // TRANSITION 2: Live → Completed
    // ========================================================================
    const { data: liveToCompleted, error: liveError } = await supabaseAdmin
      .from('tests')
      .update({ status: 'completed', updated_at: now })
      .eq('status', 'live')
      .lte('end_time', now)
      .select('id, name')

    if (liveError) {
      console.error('Error transitioning live → completed:', liveError)
    } else if (liveToCompleted && liveToCompleted.length > 0) {
      console.log(`✅ Transitioned ${liveToCompleted.length} test(s) to COMPLETED:`, 
        liveToCompleted.map(t => `#${t.id} "${t.name}"`).join(', ')
      )
    }

    // ========================================================================
    // RESPONSE
    // ========================================================================
    const summary = {
      success: true,
      timestamp: now,
      transitions: {
        scheduled_to_live: scheduledToLive?.length || 0,
        live_to_completed: liveToCompleted?.length || 0
      },
      updated_tests: {
        now_live: scheduledToLive?.map(t => ({ id: t.id, name: t.name })) || [],
        now_completed: liveToCompleted?.map(t => ({ id: t.id, name: t.name })) || []
      }
    }

    console.log('CRON job completed successfully:', summary)
    
    return NextResponse.json(summary)
    
  } catch (error) {
    console.error('Unexpected error in test status CRON job:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Optional: Support POST method for manual testing
export async function POST(request: Request) {
  console.log('Manual test status update triggered via POST')
  return GET(request)
}

