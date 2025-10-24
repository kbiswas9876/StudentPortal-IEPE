'use client'

import React from 'react'
import { ChevronLeft, Flag, Clock, Play, Pause } from 'lucide-react'
import '../styles/UnifiedHeader.css'
import '@/styles/TimerTypography.css'

interface UnifiedHeaderProps {
  currentQuestion: number
  totalQuestions: number
  mainTimer: string
  isLowTime?: boolean // NEW: Flag for low time styling
  onBack?: () => void
  onReport?: () => void
  isPaused?: boolean
  onTogglePause?: () => void
  // Scoring information
  correctMarks?: number
  negativeMarks?: number
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  mainTimer,
  isLowTime = false, // NEW: Add this parameter
  onBack,
  onReport,
  isPaused = false,
  onTogglePause,
  correctMarks,
  negativeMarks
}) => {
  return (
    <header className="unified-header">
      <div className="header-zone left">
        <button 
          className="icon-button back-button" 
          aria-label="Back to question list"
          onClick={onBack}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="progress-indicator">
          Question {currentQuestion} of {totalQuestions}
        </div>
      </div>

      <div className="header-zone center">
        <div className="premium-timer-container">
          <Clock size={18} className="premium-timer-icon" />
          <span
            key={mainTimer} // CRITICAL: This key changes every second, forcing a re-render and re-animation.
            className={`premium-timer medium font-semibold transition-colors duration-300 ${
              isLowTime 
                ? 'text-red-500 dark:text-red-400 timer-heartbeat' // Use our new custom animation class
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {mainTimer}
          </span>
          {onTogglePause && (
            <button 
              onClick={onTogglePause}
              className="timer-control-button"
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
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

export default UnifiedHeader
