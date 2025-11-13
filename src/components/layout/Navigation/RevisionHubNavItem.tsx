'use client'

import React, { useState, useEffect } from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabaseClient'
import NavItem from './NavItem'

interface RevisionHubNavItemProps {
  isActive: boolean
  isCollapsed: boolean
}

export default function RevisionHubNavItem({ isActive, isCollapsed }: RevisionHubNavItemProps) {
  const { user } = useAuth()
  const [dueCount, setDueCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchDueCount = async () => {
      try {
        const response = await fetch(`/api/revision-hub/due-count?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setDueCount(data.dueCount || 0)
        }
      } catch (error) {
        console.error('Error fetching due count:', error)
        setDueCount(0)
      }
    }

    fetchDueCount()

    // Set up real-time subscription for due count updates
    const channel = supabase
      .channel(`due-count-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarked_questions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDueCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <NavItem
      icon={AcademicCapIcon}
      label="Revision Hub"
      href="/revision-hub"
      isActive={isActive}
      isCollapsed={isCollapsed}
      badge={dueCount && dueCount > 0 ? dueCount : undefined}
    />
  )
}