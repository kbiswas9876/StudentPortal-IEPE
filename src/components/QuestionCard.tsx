'use client'

import React from 'react'
import '../styles/QuestionCard.css'
import KatexRenderer from './ui/KatexRenderer'

interface QuestionCardProps {
  questionNumber?: number
  questionText: string
  inQuestionTimer?: string
}

const QuestionCard: React.FC<QuestionCardProps> = ({ questionNumber, questionText, inQuestionTimer }) => {
  return (
    <div className="question-card">
      <div className="card-header">
        <p className="question-text" id="question-text">
          <KatexRenderer content={questionText} />
        </p>
        {inQuestionTimer && (
          <div className="in-question-timer-pill-card">
            {inQuestionTimer}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
