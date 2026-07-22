'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export interface UserProfileData {
  id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  status: 'pending' | 'correction_required' | 'active' | 'suspended' | null
  role: string | null
  rejection_reason: string | null
  date_of_birth: string | null
  state: string | null
  city: string | null
  target_exam: string | null
  student_category: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfileData | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setUserProfile(data as UserProfileData)
      } else {
        setUserProfile(null)
      }
    } catch (err) {
      console.error('Error fetching user profile in auth context:', err)
      setUserProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user?.id) {
            await fetchProfile(session.user.id)
          } else {
            setUserProfile(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user?.id) {
            await fetchProfile(session.user.id)
          } else {
            setUserProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUserProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }, [user?.id, fetchProfile])

  const value = useMemo(
    () => ({
      user,
      session,
      userProfile,
      loading,
      signOut,
      refreshProfile,
    }),
    [user, session, userProfile, loading, signOut, refreshProfile]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
