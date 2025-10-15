'use client'

import React from 'react'
import '../styles/QuestionCard.css'
import KatexRenderer from './ui/KatexRenderer'
import TimerDisplay from './TimerDisplay'

interface QuestionCardProps {
  questionNumber?: number
  questionText: string
  inQuestionTimer?: number // Changed to number (milliseconds) for TimerDisplay
  isPaused?: boolean // Added pause state for TimerDisplay
}

const QuestionCard: React.FC<QuestionCardProps> = ({ questionNumber, questionText, inQuestionTimer, isPaused = false }) => {
  return (
    <div className="question-card">
      <div className="card-header">
        <p className="question-text" id="question-text">
          <KatexRenderer content={questionText} />
        </p>
        {inQuestionTimer !== undefined && (
          <div className="in-question-timer-pill-card">
            <TimerDisplay
              milliseconds={inQuestionTimer}
              isPaused={isPaused}
              size="small"
              className="text-slate-600 dark:text-slate-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
