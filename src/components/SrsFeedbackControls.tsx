'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, AlertTriangle, ThumbsUp, Sparkles } from 'lucide-react'
import type { PerformanceRating } from '@/lib/srs/types'

interface SrsFeedbackControlsProps {
  bookmarkId: string
  userId: string
  onFeedbackComplete: () => void
  onError?: (error: string) => void
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
}: SrsFeedbackControlsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState<PerformanceRating | null>(null)

  const handleFeedback = async (rating: PerformanceRating) => {
    if (isSubmitting) return

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

      // Success! Navigate to next question after a brief delay
      setTimeout(() => {
        onFeedbackComplete()
      }, 300)
    } catch (error) {
      console.error('Error logging review:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not save review. Please try again.'
      
      if (onError) {
        onError(errorMessage)
      }
      
      // Re-enable buttons on error
      setIsSubmitting(false)
      setSelectedRating(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg"
    >
      {/* Prompt */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          How well did you remember this?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your feedback helps optimize your review schedule
        </p>
      </div>

      {/* Feedback Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {feedbackOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedRating === option.rating
          const isDisabled = isSubmitting && !isSelected

          return (
            <motion.button
              key={option.rating}
              whileHover={isSubmitting ? {} : { scale: 1.05, y: -4 }}
              whileTap={isSubmitting ? {} : { scale: 0.95 }}
              onClick={() => handleFeedback(option.rating)}
              disabled={isSubmitting}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected 
                  ? `bg-gradient-to-br ${option.bgColor} text-white border-transparent shadow-xl` 
                  : `bg-white dark:bg-slate-800 ${option.borderColor} hover:shadow-lg`
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

      {/* Helper Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-500">
          💡 Be honest with yourself for the best learning results
        </p>
      </div>
    </motion.div>
  )
}

