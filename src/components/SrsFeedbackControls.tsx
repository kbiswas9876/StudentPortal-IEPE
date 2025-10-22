'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, AlertTriangle, ThumbsUp, Sparkles } from 'lucide-react'

interface SrsFeedbackControlsProps {
  questionId: string
  userId: string
  resultId: string
  existingFeedback: { rating: number; timestamp: string } | null
  onFeedbackUpdated: (questionId: string, newFeedbackLog: Record<string, any>) => void
  onBookmarkUpdated?: (questionId: string) => void
  onError?: (error: string) => void
}

const feedbackOptions: Array<{
  rating: 1 | 2 | 3 | 4
  label: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
}> = [
  {
    rating: 1,
    label: 'Again',
    description: 'Incorrect / Forgot',
    icon: RotateCcw,
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'from-red-500 to-red-600',
    borderColor: 'border-red-300 dark:border-red-700',
  },
  {
    rating: 2,
    label: 'Hard',
    description: 'Correct but difficult',
    icon: AlertTriangle,
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  {
    rating: 3,
    label: 'Good',
    description: 'Correct with some effort',
    icon: ThumbsUp,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  {
    rating: 4,
    label: 'Easy',
    description: 'Instant recall',
    icon: Sparkles,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'from-green-500 to-green-600',
    borderColor: 'border-green-300 dark:border-green-700',
  },
]

export default function SrsFeedbackControls({
  questionId,
  userId,
  resultId,
  existingFeedback,
  onFeedbackUpdated,
  onBookmarkUpdated,
  onError,
}: SrsFeedbackControlsProps) {
  // Local state - completely isolated per question
  const [localRating, setLocalRating] = useState<1 | 2 | 3 | 4 | null>(
    existingFeedback?.rating as (1 | 2 | 3 | 4) || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [intervalMessage, setIntervalMessage] = useState('')

  // Update local state when existingFeedback changes (e.g., after undo)
  useEffect(() => {
    setLocalRating(existingFeedback?.rating as (1 | 2 | 3 | 4) || null)
  }, [existingFeedback])

  const handleFeedback = async (rating: 1 | 2 | 3 | 4) => {
    if (isSubmitting) return

    setLocalRating(rating)
    setIsSubmitting(true)

    try {
      console.log('📝 [SrsFeedback] Submitting feedback:', { questionId, rating, resultId })

      const response = await fetch(`/api/srs-feedback/${resultId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          rating,
          userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback')
      }

      console.log('✅ [SrsFeedback] Feedback submitted successfully:', result)

      // Update parent's feedback log immediately
      onFeedbackUpdated(questionId, result.feedbackLog)

      // Trigger bookmark refresh to update SRS Status section
      onBookmarkUpdated?.(questionId)

      // Calculate interval message
      const newInterval = result.updatedSrsData?.srs_interval || 0
      
      let message = ''
      if (rating === 1) {
        message = "Reset! This was a tough one. We'll show it to you again tomorrow."
      } else if (rating === 2) {
        message = `Next review in ${newInterval} day${newInterval !== 1 ? 's' : ''} (needs more practice).`
      } else if (rating === 3) {
        message = `Good! Next review in ${newInterval} day${newInterval !== 1 ? 's' : ''}.`
      } else {
        message = `Easy! Next review in ${newInterval} day${newInterval !== 1 ? 's' : ''}.`
      }

      setIntervalMessage(message)
      setShowSuccessMessage(true)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)

    } catch (error) {
      console.error('❌ [SrsFeedback] Error submitting feedback:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not save feedback. Please try again.'
      
      if (onError) {
        onError(errorMessage)
      }
      
      // Reset local state on error
      setLocalRating(existingFeedback?.rating as (1 | 2 | 3 | 4) || null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUndo = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      console.log('🔄 [SrsFeedback] Undoing feedback:', { questionId, resultId })

      const response = await fetch(`/api/srs-feedback/${resultId}/undo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to undo feedback')
      }

      console.log('✅ [SrsFeedback] Feedback undone successfully:', result)

      // Update parent's feedback log
      onFeedbackUpdated(questionId, result.feedbackLog)

      // Reset local state
      setLocalRating(null)
      setShowSuccessMessage(false)
      setIntervalMessage('')

    } catch (error) {
      console.error('❌ [SrsFeedback] Error undoing feedback:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not undo feedback. Please try again.'
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLocked = localRating !== null && !isSubmitting

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
          const isSelected = localRating === option.rating
          const isDisabled = isSubmitting || (isLocked && !isSelected)

          return (
            <motion.button
              key={option.rating}
              whileHover={isDisabled ? {} : { scale: 1.02 }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onClick={() => handleFeedback(option.rating)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-150 ease-out
                ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected 
                  ? `bg-gradient-to-br ${option.bgColor} text-white border-transparent shadow-xl ${isLocked ? 'ring-4 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-800' : ''}` 
                  : `bg-white dark:bg-slate-800 ${option.borderColor} hover:border-opacity-70`
                }
              `}
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
      {isLocked && !showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-center"
        >
          <button
            onClick={handleUndo}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </button>
        </motion.div>
      )}

      {/* Helper Text */}
      {!showSuccessMessage && !isSubmitting && !isLocked && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            💡 Be honest with yourself for the best learning results
          </p>
        </div>
      )}

      {/* Success Message with Interval Information */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                    Feedback Saved!
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {intervalMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
