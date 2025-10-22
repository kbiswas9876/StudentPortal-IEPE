'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { StarRatingDisplay } from './ui/StarRating'

interface BookmarkedQuestion {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  user_difficulty_rating: number | null
  created_at: string
  updated_at: string
  questions: any
  performance: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

interface DifficultyBreakdownProps {
  questions: BookmarkedQuestion[]
  className?: string
  onRatingClick?: (rating: number) => void
  selectedRating?: number | null
}

// Difficulty level mappings - Standardized 5-star rating system
const difficultyLabels = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard'
}

export default function DifficultyBreakdown({ 
  questions, 
  className = '', 
  onRatingClick,
  selectedRating 
}: DifficultyBreakdownProps) {
  // Calculate difficulty breakdown
  const difficultyCounts = React.useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    questions.forEach(question => {
      const rating = question.user_difficulty_rating
      if (rating && rating >= 1 && rating <= 5) {
        counts[rating as keyof typeof counts]++
      }
    })
    
    return counts
  }, [questions])

  const totalQuestions = questions.length
  const ratedQuestions = Object.values(difficultyCounts).reduce((sum, count) => sum + count, 0)
  const unratedQuestions = totalQuestions - ratedQuestions

  // Don't render if no questions
  if (totalQuestions === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Difficulty Breakdown Cards */}
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const count = difficultyCounts[rating as keyof typeof difficultyCounts]
          const percentage = ratedQuestions > 0 ? Math.round((count / ratedQuestions) * 100) : 0
          
          return (
            <motion.div
              key={rating}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: rating * 0.05 }}
              onClick={() => onRatingClick?.(rating)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200
                ${count > 0 
                  ? selectedRating === rating
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-300 dark:border-blue-600 shadow-md'
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                }
                ${onRatingClick ? 'cursor-pointer hover:scale-105' : ''}
              `}
              title={`${difficultyLabels[rating as keyof typeof difficultyLabels]} - ${count} question${count !== 1 ? 's' : ''}${percentage > 0 ? ` (${percentage}% of rated)` : ''}${onRatingClick ? ' - Click to filter' : ''}`}
            >
              {/* Star Rating Display */}
              <div className="flex items-center">
                <StarRatingDisplay 
                  value={rating} 
                  maxRating={rating}
                  size="sm"
                  className={count > 0 ? '' : 'opacity-50'}
                />
              </div>
              
              {/* Count */}
              <span className={`
                text-sm font-semibold min-w-[2rem] text-center
                ${count > 0 
                  ? 'text-slate-700 dark:text-slate-200' 
                  : 'text-slate-400 dark:text-slate-500'
                }
              `}>
                {count}
              </span>
              
              {/* Question/Questions label */}
              <span className={`
                text-xs font-medium
                ${count > 0 
                  ? 'text-slate-600 dark:text-slate-300' 
                  : 'text-slate-400 dark:text-slate-500'
                }
              `}>
                {count === 1 ? 'Q' : 'Qs'}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      {unratedQuestions > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
        >
          <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {unratedQuestions} unrated
          </span>
        </motion.div>
      )}

      {/* Total Count */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
      >
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {totalQuestions} total
        </span>
      </motion.div>
    </div>
  )
}
