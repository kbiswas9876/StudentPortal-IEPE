'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Flag, Bookmark } from 'lucide-react'
import '../styles/UnifiedHeader.css'
import { getNuancedPerformanceState, type AdvancedDifficulty } from '@/lib/speed-calculator'

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
        return 'bg-green-500 text-white font-bold'
      case 'incorrect':
        return 'bg-red-600 text-white font-bold'
      case 'skipped':
        return 'bg-gray-500 text-white font-bold'
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
    const performanceState = getNuancedPerformanceState(
      timeTakenSeconds, 
      difficulty as AdvancedDifficulty, 
      status as 'correct' | 'incorrect' | 'skipped'
    )
    
    // Nuanced color system based on performance state
    switch (performanceState) {
      case 'Slow':
        return 'text-red-600 dark:text-red-400' // Slow - Red
      case 'Superfast':
        return 'text-green-600 dark:text-green-400' // Superfast - Green
      case 'OnTime':
        return 'text-green-600 dark:text-green-400' // On Time - Green
      case 'OnTimeButNotCorrect':
        return 'text-gray-500 dark:text-gray-400' // On Time but not correct - Gray
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  // Get background color and icon for time display
  const getTimeDisplayStyle = (timeTakenSeconds: number, difficulty: string | null, status: string) => {
    const performanceState = getNuancedPerformanceState(
      timeTakenSeconds, 
      difficulty as AdvancedDifficulty, 
      status as 'correct' | 'incorrect' | 'skipped'
    )
    
    // Nuanced styling system based on performance state
    switch (performanceState) {
      case 'Slow':
        return {
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          borderClass: 'border-red-300 dark:border-red-700',
          icon: '😞',
          label: 'Slow'
        }
      case 'Superfast':
        return {
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-300 dark:border-green-700',
          icon: '😄',
          label: 'Superfast'
        }
      case 'OnTime':
        return {
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-300 dark:border-green-700',
          icon: '🙂',
          label: 'On Time'
        }
      case 'OnTimeButNotCorrect':
        return {
          bgClass: 'bg-gray-50 dark:bg-gray-800/50',
          borderClass: 'border-gray-200 dark:border-gray-700',
          icon: '😐',
          label: 'On Time but not Correct'
        }
      default:
        return {
          bgClass: 'bg-gray-50 dark:bg-gray-800/50',
          borderClass: 'border-gray-200 dark:border-gray-700',
          icon: '⏱️',
          label: 'Time'
        }
    }
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
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${getTimeDisplayStyle(timeTakenSeconds, difficulty, status).bgClass} ${getTimeDisplayStyle(timeTakenSeconds, difficulty, status).borderClass}`}>
          <span className="text-lg">{getTimeDisplayStyle(timeTakenSeconds, difficulty, status).icon}</span>
          <div className="flex flex-col items-start">
            <span className={`font-mono text-base font-bold leading-tight ${getTimeColor(timeTakenSeconds, difficulty, status)}`}>
              {formatTime(timeTakenSeconds)}
            </span>
            <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-400 mt-0.5">
              {getTimeDisplayStyle(timeTakenSeconds, difficulty, status).label}
            </span>
          </div>
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
