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

// GET - Fetch mock test metadata and result policy
export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    console.log('Fetching mock test metadata for test ID:', testId)

    // Fetch test metadata including result policy
    const { data: testMetadata, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id, name, result_policy, result_release_at, status')
      .eq('id', testId)
      .single()

    if (testError) {
      console.error('Error fetching test metadata:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    if (!testMetadata) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check if results should be available
    const now = new Date()
    const isResultsAvailable = testMetadata.result_policy === 'instant' || 
      (testMetadata.result_policy === 'scheduled' && 
       testMetadata.result_release_at && 
       new Date(testMetadata.result_release_at) <= now)

    console.log('Test metadata fetched:', {
      name: testMetadata.name,
      result_policy: testMetadata.result_policy,
      isResultsAvailable
    })

    return NextResponse.json({
      data: {
        test: testMetadata,
        isResultsAvailable,
        resultReleaseAt: testMetadata.result_release_at
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
