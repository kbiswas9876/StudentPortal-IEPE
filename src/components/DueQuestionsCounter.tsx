'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DueQuestionsCounterProps {
  userId: string
}

export default function DueQuestionsCounter({ userId }: DueQuestionsCounterProps) {
  const [dueCount, setDueCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  const fetchDueCount = async () => {
    try {
      console.log('🔄 [DueCounter] Fetching due count for user:', userId)
      const response = await fetch(`/api/revision-hub/due-count?userId=${userId}`)
      const result = await response.json()

      if (response.ok) {
        console.log('📊 [DueCounter] Due count:', result.count)
        setDueCount(result.count || 0)
      }
    } catch (error) {
      console.error('❌ [DueCounter] Error fetching due count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDueCount()
      
      // Poll every 2 minutes (120000ms) - more frequent for better UX
      const interval = setInterval(fetchDueCount, 120000)
      return () => clearInterval(interval)
    }
  }, [userId])

  // Refetch when route changes (e.g., after completing a review)
  useEffect(() => {
    if (userId && !isLoading) {
      console.log('🔄 [DueCounter] Route changed to:', pathname, '- refreshing count')
      fetchDueCount()
    }
  }, [pathname])

  // Listen for custom SRS review completion events
  useEffect(() => {
    const handleSrsReviewComplete = () => {
      console.log('✅ [DueCounter] SRS review completed event - refreshing count')
      fetchDueCount()
    }

    window.addEventListener('srs-review-complete', handleSrsReviewComplete)
    return () => window.removeEventListener('srs-review-complete', handleSrsReviewComplete)
  }, [userId])

  // Don't show anything if count is 0 or still loading
  if (isLoading || dueCount === 0) {
    return null
  }

  return (
    <Link href="/revision-hub" className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.1 }}
          className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
        >
          <motion.span
            key={dueCount}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {dueCount > 99 ? '99+' : dueCount}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </Link>
  )
}

