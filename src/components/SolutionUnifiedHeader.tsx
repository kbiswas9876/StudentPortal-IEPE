'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Flag, Clock, Bookmark } from 'lucide-react'
import '../styles/UnifiedHeader.css'
import { getAdvancedThreeTierSpeedCategory, type AdvancedDifficulty } from '@/lib/speed-calculator'

interface SolutionUnifiedHeaderProps {
  currentQuestion: number
  totalQuestions: number
  timeTakenSeconds: number
  status: 'correct' | 'incorrect' | 'skipped'
  difficulty: string | null
  isBookmarked: boolean
  onBack?: () => void
  onReport?: () => void
  onToggleBookmark?: () => void
  showBookmark?: boolean
}

const SolutionUnifiedHeader: React.FC<SolutionUnifiedHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  timeTakenSeconds,
  status,
  difficulty,
  isBookmarked,
  onBack,
  onReport,
  onToggleBookmark,
  showBookmark = true
}) => {
  const getStatusPillClasses = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'incorrect':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
    }
  }

  const getStatusLabel = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'Correct'
      case 'incorrect':
        return 'Incorrect'
      default:
        return 'Skipped'
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  // Get color coding for time taken based on performance
  const getTimeColor = (timeTakenSeconds: number, difficulty: string | null, status: string) => {
    // Only apply color-coding to correct answers
    if (status !== 'correct') {
      return 'text-gray-500 dark:text-gray-400'
    }
    
    const speedCategory = getAdvancedThreeTierSpeedCategory(timeTakenSeconds, difficulty as AdvancedDifficulty)
    
    // Three-tier color system for correct answers only
    if (speedCategory === 'Fast') {
      return 'text-green-600 dark:text-green-400' // Fast - Green
    } else if (speedCategory === 'Average') {
      return 'text-yellow-600 dark:text-yellow-400' // Average - Yellow/Amber
    } else if (speedCategory === 'Slow') {
      return 'text-red-600 dark:text-red-400' // Slow - Red
    }
    
    return 'text-gray-500 dark:text-gray-400'
  }

  return (
    <header className="unified-header">
      <div className="header-zone left">
        <button 
          className="icon-button back-button" 
          aria-label="Back to analysis"
          onClick={onBack}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="progress-indicator">
          Question {currentQuestion} of {totalQuestions}
        </div>
        <div className={`px-3 py-1 rounded-lg text-sm font-medium ml-3 ${getStatusPillClasses(status)}`}>
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="header-zone center">
        <div className="premium-timer-container">
          <Clock size={18} className="premium-timer-icon" />
          <span className={`premium-timer medium primary ${getTimeColor(timeTakenSeconds, difficulty, status)}`}>
            {formatTime(timeTakenSeconds)}
          </span>
        </div>
      </div>

      <div className="header-zone right">
        {/* Premium Bookmark Button */}
        {showBookmark && onToggleBookmark && (
          <motion.button
            onClick={onToggleBookmark}
            className={`
              relative mr-3 px-3 py-2 rounded-xl border-2 transition-all duration-300
              ${isBookmarked 
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            title={isBookmarked ? 'Remove from Revision Hub' : 'Save to Revision Hub'}
          >
            {/* Animated glow effect for bookmarked state */}
            {isBookmarked && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-amber-400/20 dark:bg-amber-500/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            <div className="flex items-center gap-2 relative z-10">
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isBookmarked ? 0 : 2} />
              <span className="text-xs font-semibold">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </div>
          </motion.button>
        )}
        
        <button 
          className="icon-button report-button" 
          aria-label="Report this question"
          onClick={onReport}
        >
          <Flag size={16} />
        </button>
      </div>
    </header>
  )
}

export default SolutionUnifiedHeader
