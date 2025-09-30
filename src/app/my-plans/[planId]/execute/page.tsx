'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { ChevronLeftIcon, PlayIcon } from '@heroicons/react/24/outline'

interface PracticePlan {
  id: string
  name: string
  plan_type: 'daily' | 'weekly' | 'monthly'
  content: {
    days: Array<{
      id: string
      name: string
      selectedBooks: string[]
      selectedChapters: string[]
      selectedQuestions: string[]
      questionCount: number
    }>
  }
  created_at: string
  updated_at: string
}

export default function ExecutePlanPage() {
  const { planId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [plan, setPlan] = useState<PracticePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (planId) {
      fetchPlan()
    }
  }, [user, authLoading, router, planId])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      console.log('Fetching practice plan:', planId)

      const response = await fetch(`/api/practice-plans/${planId}?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch practice plan')
      }

      console.log('Practice plan fetched successfully:', result.data)
      setPlan(result.data)
    } catch (error) {
      console.error('Error fetching practice plan:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch practice plan')
    } finally {
      setLoading(false)
    }
  }

  const handleStartDay = (day: any) => {
    // For now, we'll navigate to the practice page with a placeholder
    // In a full implementation, this would fetch the actual questions based on the day's configuration
    console.log('Starting day:', day.name)
    router.push(`/practice?planDay=${day.id}&planId=${planId}&testMode=practice`)
  }

  const getPlanTypeColor = (planType: string) => {
    switch (planType) {
      case 'daily':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      case 'weekly':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'monthly':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getPlanTypeIcon = (planType: string) => {
    switch (planType) {
      case 'daily':
        return '📅'
      case 'weekly':
        return '📊'
      case 'monthly':
        return '🗓️'
      default:
        return '📋'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading practice plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Plan</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/my-plans')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to My Plans
          </button>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Plan Not Found</h2>
            <p>The requested practice plan could not be found.</p>
          </div>
          <button
            onClick={() => router.push('/my-plans')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to My Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/my-plans')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {plan.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanTypeColor(plan.plan_type)}`}>
                  {getPlanTypeIcon(plan.plan_type)} {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)} Plan
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {plan.content.days.length} day{plan.content.days.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plan Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Practice Sessions
          </h2>

          {plan.content.days.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Practice Sessions</h3>
                <p>This plan doesn't have any practice sessions configured yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {plan.content.days.map((day, index) => (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {day.name}
                        </h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Session {index + 1}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <div className="font-medium mb-1">Configuration:</div>
                          <div>• {day.selectedBooks.length} book{day.selectedBooks.length !== 1 ? 's' : ''} selected</div>
                          <div>• {day.selectedChapters.length} chapter{day.selectedChapters.length !== 1 ? 's' : ''} selected</div>
                          <div>• {day.questionCount || 'Unknown'} questions available</div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartDay(day)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <PlayIcon className="h-5 w-5" />
                        <span>Start Session</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-slate-100 dark:bg-slate-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Plan Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium">Created:</span> {new Date(plan.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(plan.updated_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Plan Type:</span> {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}
            </div>
            <div>
              <span className="font-medium">Total Sessions:</span> {plan.content.days.length}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
