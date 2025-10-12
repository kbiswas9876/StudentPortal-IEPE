import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Server Components and API Routes
 * This client uses cookie-based auth storage for proper SSR authentication
 * 
 * @returns Supabase client configured for server-side usage
 */
export async function createServerClient(authToken?: string): Promise<import('@supabase/supabase-js').SupabaseClient<Database>> {
  const cookieStore = await cookies()
  
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        storage: {
          getItem: (name: string) => {
            return cookieStore.get(name)?.value || null
          },
          setItem: (name: string, value: string) => {
            // No-op for server-side - cookies are managed by the client
          },
          removeItem: (name: string) => {
            // No-op for server-side - cookies are managed by the client
          }
        },
        autoRefreshToken: false, // Disable auto-refresh on server to prevent loops
        persistSession: false, // Don't persist sessions on server
        detectSessionInUrl: false, // No URL detection needed on server
      },
      global: {
        headers: {
          'x-client-info': 'student-portal-server',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client for server-side operations that need elevated privileges
 * Warning: This uses the service role key and bypasses RLS policies
 * 
 * @returns Supabase admin client with service role privileges
 */
export function createAdminClient(): import('@supabase/supabase-js').SupabaseClient<Database> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-client-info': 'student-portal-admin',
        },
      },
    }
  )
}
