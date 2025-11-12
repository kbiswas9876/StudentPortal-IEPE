'use client'

import React from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

interface BookmarkedQuestion {
  id: string
  user_id: string
  question_id: string
  user_difficulty_rating: number | null
  [key: string]: any
}

interface DifficultyBreakdownProps {
  questions: BookmarkedQuestion[]
  className?: string
  onRatingClick?: (rating: number) => void
  selectedRating?: number | null
}

// --- Main Component ---
const DifficultyBreakdown: React.FC<DifficultyBreakdownProps> = ({ 
  questions, 
  className = '', 
  onRatingClick,
  selectedRating 
}) => {
  if (!questions || questions.length === 0) {
    return null
  }

  // Count questions by difficulty rating
  const ratingCounts = [0, 0, 0, 0, 0, 0] // Index 0 for unrated, 1-5 for star ratings
  questions.forEach(q => {
    const rating = q.user_difficulty_rating
    if (rating === null || rating === undefined) {
      ratingCounts[0]++
    } else if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++
    }
  })

  const totalQuestions = questions.length
  const unratedCount = ratingCounts[0]

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Star ratings 1-5 */}
      {[1, 2, 3, 4, 5].map(rating => (
        <button
          key={rating}
          onClick={() => onRatingClick?.(rating)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
            selectedRating === rating
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <StarIcon className="w-4 h-4 text-amber-500" />
          <span className="font-medium">{rating}</span>
          <span className="text-xs">({ratingCounts[rating]})</span>
        </button>
      ))}
      
      {/* Unrated questions */}
      {unratedCount > 0 && (
        <button
          onClick={() => onRatingClick?.(0)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
            selectedRating === 0
              ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <span className="font-medium">{unratedCount} unrated</span>
        </button>
      )}
      
      {/* Total count */}
      <div className="flex items-center gap-1 px-2 py-1 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium">{totalQuestions} total</span>
      </div>
    </div>
  )
}

export default DifficultyBreakdown
