'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon, PlayIcon } from '@heroicons/react/24/outline'

interface PracticePlan {
  id: string
  name: string
  plan_type: 'daily' | 'weekly' | 'monthly'
  content: any
  created_at: string
  updated_at: string
}

export default function MyPlansPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<PracticePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchPlans()
  }, [user, authLoading, router])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      console.log('Fetching practice plans for user:', user?.id)

      const response = await fetch(`/api/practice-plans?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch practice plans')
      }

      console.log('Practice plans fetched successfully:', result.data)
      setPlans(result.data || [])
    } catch (error) {
      console.error('Error fetching practice plans:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch practice plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!user) return

    try {
      setDeletingPlan(planId)
      console.log('Deleting practice plan:', planId)

      const response = await fetch(`/api/practice-plans/${planId}?userId=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete practice plan')
      }

      console.log('Practice plan deleted successfully')
      
      // Refresh the plans list
      await fetchPlans()
    } catch (error) {
      console.error('Error deleting practice plan:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete practice plan')
    } finally {
      setDeletingPlan(null)
    }
  }

  const handleExportPDF = async (plan: PracticePlan) => {
    // TODO: Implement PDF export functionality
    console.log('Exporting plan to PDF:', plan.name)
    // This will be implemented in the PDF export feature
  }

  const handleStartPlan = (plan: PracticePlan) => {
    // Navigate to plan execution page
    router.push(`/my-plans/${plan.id}/execute`)
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
          <p className="text-slate-600 dark:text-slate-300">Loading your practice plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Plans</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                My Practice Plans
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Create and manage your structured study plans
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/my-plans/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create New Plan</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center py-12"
          >
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Practice Plans Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first structured study plan to get started with organized practice sessions.
              </p>
              <button
                onClick={() => router.push('/my-plans/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Your First Plan
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {plan.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanTypeColor(plan.plan_type)}`}>
                            {getPlanTypeIcon(plan.plan_type)} {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Created {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartPlan(plan)}
                          className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                          title="Start Plan"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/my-plans/${plan.id}/edit`)}
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="Edit Plan"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExportPDF(plan)}
                          className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                          title="Export PDF"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={deletingPlan === plan.id}
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Plan"
                        >
                          {deletingPlan === plan.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}