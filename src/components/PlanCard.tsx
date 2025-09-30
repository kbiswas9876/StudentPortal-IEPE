'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { Database } from '@/types/database'

type PracticePlan = Database['public']['Tables']['practice_plans']['Row']

interface PlanCardProps {
  plan: PracticePlan
  onUpdate: (planId: string, planData: { name: string; planType: string; content: any }) => void
  onDelete: (planId: string) => void
  onStartDay: (plan: PracticePlan, dayIndex: number) => void
}

export default function PlanCard({
  plan,
  onUpdate,
  onDelete,
  onStartDay
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getTotalDays = () => {
    return Array.isArray(plan.content) ? plan.content.length : 0
  }

  const getCompletedDays = () => {
    // This would be calculated based on user progress
    // For now, return 0 as we haven't implemented progress tracking yet
    return 0
  }

  const handleDelete = () => {
    onDelete(plan.id)
    setShowDeleteConfirm(false)
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    alert('PDF export functionality will be implemented soon!')
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {plan.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanTypeColor(plan.plan_type)}`}>
                {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(plan.created_at)}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              title="Export to PDF"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate(plan.id, { name: plan.name, planType: plan.plan_type, content: plan.content })}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
              title="Edit Plan"
            >
              <PencilIcon className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Delete Plan"
            >
              <TrashIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">{getCompletedDays()}</span> of <span className="font-medium">{getTotalDays()}</span> days completed
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </motion.div>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getTotalDays() > 0 ? (getCompletedDays() / getTotalDays()) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
        >
          <div className="p-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Plan Days ({getTotalDays()} total)
            </h4>
            
            <div className="space-y-2">
              {Array.isArray(plan.content) && plan.content.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Day {index + 1}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {day.questionIds?.length || 0} questions
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartDay(plan, index)}
                    disabled={!day.questionIds || day.questionIds.length === 0}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                  >
                    <PlayIcon className="h-3 w-3" />
                    Start
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Delete Practice Plan
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Delete Plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
