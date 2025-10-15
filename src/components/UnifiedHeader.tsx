'use client'

import React from 'react'
import { ChevronLeft, Flag, Clock, Play, Pause } from 'lucide-react'
import '../styles/UnifiedHeader.css'
import '@/styles/TimerTypography.css'

interface UnifiedHeaderProps {
  currentQuestion: number
  totalQuestions: number
  mainTimer: string
  onBack?: () => void
  onReport?: () => void
  isPaused?: boolean
  onTogglePause?: () => void
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  mainTimer,
  onBack,
  onReport,
  isPaused = false,
  onTogglePause
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
          <span className="premium-timer medium primary">{mainTimer}</span>
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
