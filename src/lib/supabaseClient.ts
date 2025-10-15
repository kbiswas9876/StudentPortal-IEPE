import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// CLIENT-SIDE ONLY: Singleton pattern to prevent memory leaks during HMR
// Server-side (API routes) should create their own instances with custom auth storage
function createBrowserClient(): SupabaseClient<Database> {
  // Use global singleton for browser to persist across HMR
  const globalForSupabase = globalThis as typeof globalThis & {
    supabase?: SupabaseClient<Database>
  }
  
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
      global: {
        headers: {
          'x-client-info': 'student-portal',
        },
      },
    })
  }
  
  return globalForSupabase.supabase
}

// Helper for server-side error messages
class ServerSideSupabaseError extends Error {
  constructor() {
    super(
      'Supabase client cannot be used on the server side. ' +
      'For API routes, create a new client with createClient() and custom auth storage. ' +
      'For server components, pass data through props from client components.'
    )
    this.name = 'ServerSideSupabaseError'
  }
}

// Proxy to throw helpful error on server-side usage
const serverSideProxy = new Proxy({} as SupabaseClient<Database>, {
  get() {
    throw new ServerSideSupabaseError()
  },
})

// Only create client instance on the client side
// Server components and API routes should create their own instances
export const supabase: SupabaseClient<Database> = typeof window !== 'undefined' 
  ? createBrowserClient()
  : serverSideProxy
