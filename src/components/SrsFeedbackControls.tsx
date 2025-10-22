'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, AlertTriangle, ThumbsUp, Sparkles } from 'lucide-react'
import type { PerformanceRating } from '@/lib/srs/types'

interface SrsFeedbackControlsProps {
  bookmarkId: string
  userId: string
  onFeedbackComplete: (questionId: string, rating: PerformanceRating) => void
  onError?: (error: string) => void
  isLocked?: boolean // Indicates if feedback was already given in this session
  previousRating?: PerformanceRating // The rating that was previously given
}

const feedbackOptions: Array<{
  rating: PerformanceRating
  label: string
  description: string
  icon: React.ComponentType<any>
  color: string
  hoverColor: string
  bgColor: string
  borderColor: string
}> = [
  {
    rating: 1,
    label: 'Again',
    description: 'Incorrect / Forgot',
    icon: RotateCcw,
    color: 'text-red-700 dark:text-red-400',
    hoverColor: 'hover:from-red-600 hover:to-red-700',
    bgColor: 'from-red-500 to-red-600',
    borderColor: 'border-red-300 dark:border-red-700',
  },
  {
    rating: 2,
    label: 'Hard',
    description: 'Correct but difficult',
    icon: AlertTriangle,
    color: 'text-orange-700 dark:text-orange-400',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    bgColor: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  {
    rating: 3,
    label: 'Good',
    description: 'Correct with some effort',
    icon: ThumbsUp,
    color: 'text-blue-700 dark:text-blue-400',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    bgColor: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  {
    rating: 4,
    label: 'Easy',
    description: 'Instant recall',
    icon: Sparkles,
    color: 'text-green-700 dark:text-green-400',
    hoverColor: 'hover:from-green-600 hover:to-green-700',
    bgColor: 'from-green-500 to-green-600',
    borderColor: 'border-green-300 dark:border-green-700',
  },
]

export default function SrsFeedbackControls({
  bookmarkId,
  userId,
  onFeedbackComplete,
  onError,
  isLocked = false,
  previousRating = null,
}: SrsFeedbackControlsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackLocked, setFeedbackLocked] = useState(isLocked)
  const [selectedRating, setSelectedRating] = useState<PerformanceRating | null>(previousRating)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [intervalMessage, setIntervalMessage] = useState('')
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)

  const handleFeedback = async (rating: PerformanceRating) => {
    if (isSubmitting || feedbackLocked) return

    setSelectedRating(rating)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/revision-hub/log-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId,
          performanceRating: rating,
          userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to log review')
      }

      // Lock feedback immediately after successful submission
      setFeedbackLocked(true)

      // Notify parent component IMMEDIATELY
      onFeedbackComplete(bookmarkId, rating)

      // Calculate interval message
      const previousInterval = result.previousSrsData?.srs_interval || 0
      const newInterval = result.updatedSrsData?.srs_interval || 0
      
      let message = ''
      if (rating === 1) {
        // Again - Reset
        message = "Reset! This was a tough one. We'll show it to you again tomorrow."
      } else if (newInterval > previousInterval) {
        const diff = newInterval - previousInterval
        message = `✅ Got it! Next review scheduled in ${newInterval} day${newInterval !== 1 ? 's' : ''} (increased by ${diff} day${diff !== 1 ? 's' : ''}).`
      } else if (newInterval < previousInterval) {
        message = `Next review in ${newInterval} day${newInterval !== 1 ? 's' : ''} (adjusted down for more practice).`
      } else {
        message = `Next review in ${newInterval} day${newInterval !== 1 ? 's' : ''}.`
      }

      setIntervalMessage(message)
      setShowSuccessMessage(true)
    } catch (error) {
      console.error('Error logging review:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not save review. Please try again.'
      
      if (onError) {
        onError(errorMessage)
      }
      
      // Re-enable buttons on error
      setSelectedRating(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUndo = () => {
    setFeedbackLocked(false)
    setSelectedRating(null)
    setShowSuccessMessage(false)
    setIntervalMessage('')
  }

  const handleReschedule = async () => {
    if (!customDate || isRescheduling) return

    setIsRescheduling(true)
    try {
      const response = await fetch(`/api/revision-hub/bookmarks/${bookmarkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          is_custom_reminder_active: true,
          custom_next_review_date: customDate,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to reschedule')
      }

      setIntervalMessage(`📅 Rescheduled to ${new Date(customDate).toLocaleDateString()}`)
      setShowSuccessMessage(true)
      setShowRescheduleModal(false)

      setTimeout(() => {
        setShowSuccessMessage(false)
        onFeedbackComplete()
      }, 2000)
    } catch (error) {
      console.error('Error rescheduling:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to reschedule. Please try again.'
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsRescheduling(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 p-5"
    >
      {/* Prompt */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          How well did you remember this?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your feedback helps optimize your review schedule
        </p>
      </div>

      {/* Feedback Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {feedbackOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedRating === option.rating
          const isDisabled = (isSubmitting || feedbackLocked) && !isSelected

          return (
            <motion.button
              key={option.rating}
              whileHover={isSubmitting || feedbackLocked ? {} : { scale: 1.02 }}
              whileTap={isSubmitting || feedbackLocked ? {} : { scale: 0.98 }}
              onClick={() => handleFeedback(option.rating)}
              disabled={isSubmitting || feedbackLocked}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-150 ease-out
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected 
                  ? `bg-gradient-to-br ${option.bgColor} text-white border-transparent shadow-xl ${feedbackLocked ? 'ring-4 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-800' : ''}` 
                  : `bg-white dark:bg-slate-800 ${option.borderColor}`
                }
              `}
              style={{
                transition: 'transform 150ms ease-out, border-color 150ms ease-out, background-color 150ms ease-out'
              }}
            >
              {/* Loading Spinner (only on selected button) */}
              {isSelected && isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-2">
                <Icon 
                  className={`h-8 w-8 ${isSelected ? 'text-white' : option.color}`} 
                  strokeWidth={2.5} 
                />
              </div>

              {/* Label */}
              <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {option.label}
              </div>

              {/* Description */}
              <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                {option.description}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Undo Button - Only show when feedback is locked */}
      {feedbackLocked && !showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-center"
        >
          <button
            onClick={handleUndo}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </button>
        </motion.div>
      )}

      {/* Helper Text */}
      {!showSuccessMessage && !isSubmitting && !feedbackLocked && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
            💡 Be honest with yourself for the best learning results
          </p>
          
          {/* Manual Reschedule Button */}
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors"
          >
            📅 Reschedule manually
          </button>
        </div>
      )}

      {/* Success Message with Interval Information */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl"
          >
            <p className="text-center text-sm font-semibold text-green-800 dark:text-green-200">
              {intervalMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRescheduleModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6 max-w-md w-full z-50"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Reschedule Review
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Choose a custom date for your next review of this question
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Next Review Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!customDate || isRescheduling}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRescheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    'Reschedule'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

