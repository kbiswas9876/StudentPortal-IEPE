'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import PlanCard from '@/components/PlanCard'
import CreatePlanModal from '@/components/CreatePlanModal'

type PracticePlan = Database['public']['Tables']['practice_plans']['Row']

export default function MyPlansPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<PracticePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const handleCreatePlan = async (planData: { name: string; planType: string; content: any }) => {
    try {
      const response = await fetch('/api/practice-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...planData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create practice plan')
      }

      console.log('Practice plan created successfully:', result.data)
      
      // Refresh the plans list
      await fetchPlans()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating practice plan:', error)
    }
  }

  const handleUpdatePlan = async (planId: string, planData: { name: string; planType: string; content: any }) => {
    try {
      const response = await fetch(`/api/practice-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...planData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update practice plan')
      }

      console.log('Practice plan updated successfully:', result.data)
      
      // Refresh the plans list
      await fetchPlans()
    } catch (error) {
      console.error('Error updating practice plan:', error)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/practice-plans/${planId}?userId=${user?.id}`, {
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
    }
  }

  const handleStartPlanDay = (plan: PracticePlan, dayIndex: number) => {
    const dayConfig = plan.content[dayIndex]
    if (!dayConfig || !dayConfig.questionIds || dayConfig.questionIds.length === 0) {
      alert('No questions configured for this day')
      return
    }

    // Navigate to practice session with the plan's question IDs
    router.push(`/practice?questions=${dayConfig.questionIds.join(',')}&testMode=practice&fromPlan=${plan.id}&day=${dayIndex + 1}`)
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Create New Plan
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
                Create your first structured study plan to get started with organized learning.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
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
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PlanCard
                  plan={plan}
                  onUpdate={handleUpdatePlan}
                  onDelete={handleDeletePlan}
                  onStartDay={handleStartPlanDay}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create Plan Modal */}
        {showCreateModal && (
          <CreatePlanModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreatePlan}
          />
        )}
      </div>
    </div>
  )
}
