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
  correctMarks?: number
  negativeMarks?: number
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
  showBookmark = true,
  correctMarks,
  negativeMarks
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

  // Get target time based on difficulty
  const getTargetTime = (difficulty: string | null): number => {
    const ADVANCED_TIME_THRESHOLDS = {
      'Easy': 20,
      'Easy-Moderate': 30,
      'Moderate': 45,
      'Moderate-Hard': 60,
      'Hard': 90,
      'default': 36
    }
    return ADVANCED_TIME_THRESHOLDS[difficulty as keyof typeof ADVANCED_TIME_THRESHOLDS] || ADVANCED_TIME_THRESHOLDS.default
  }

  // Get premium performance chip styling
  const getPremiumPerformanceChipStyle = (timeTakenSeconds: number, difficulty: string | null, status: string) => {
    const performanceState = getNuancedPerformanceState(
      timeTakenSeconds, 
      difficulty as AdvancedDifficulty, 
      status as 'correct' | 'incorrect' | 'skipped'
    )
    
    // Premium styling system with dynamic backgrounds and effects
    switch (performanceState) {
      case 'Slow':
        return {
          containerClass: 'bg-red-500 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30',
          icon: '😞',
          label: 'SLOW',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'Superfast':
        return {
          containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/30',
          icon: '😄',
          label: 'SUPERFAST',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'OnTime':
        return {
          containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/30',
          icon: '🙂',
          label: 'ON TIME',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'OnTimeButNotCorrect':
        return {
          containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30',
          icon: '😐',
          label: 'ON TIME BUT NOT CORRECT',
          labelClass: 'font-bold text-xs uppercase tracking-wide'
        }
      default:
        return {
          containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30',
          icon: '⏱️',
          label: 'TIME',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
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
        <div className={`px-3 py-1 rounded-full text-sm font-medium ml-3 ${getStatusPillClasses(status)}`}>
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="header-zone center">
        {/* Premium Performance Chip v2.0 - Refined Design */}
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).containerClass}`}>
          {/* Icon */}
          <span className="text-lg flex-shrink-0">{getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).icon}</span>
          
          {/* Performance Label */}
          <span className={`${getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).labelClass} flex-shrink-0`}>
            {getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).label}
          </span>
          
          {/* Separator */}
          <span className="text-white font-bold">|</span>
          
          {/* Time Information */}
          <div className="flex items-center space-x-4 text-sm">
            {/* User's Time */}
            <div className="flex items-center space-x-1">
              <span className="font-medium text-white">You:</span>
              <span className="font-mono font-bold text-white text-base">
                {formatTime(timeTakenSeconds)}
              </span>
            </div>
            
            {/* Target Time */}
            <div className="flex items-center space-x-1">
              <span className="font-medium text-white">Target:</span>
              <span className="font-mono font-bold text-white text-base">
                {formatTime(getTargetTime(difficulty))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-zone right">
        {/* Scoring Information */}
        {(correctMarks !== undefined || negativeMarks !== undefined) && (
          <div className="flex items-center space-x-3 mr-4">
            {correctMarks !== undefined && (
              <div className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
                <span>+</span>
                <span>{correctMarks}</span>
              </div>
            )}
            {negativeMarks !== undefined && (
              <div className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
                <span>-</span>
                <span>{Math.abs(negativeMarks)}</span>
              </div>
            )}
          </div>
        )}
        
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
