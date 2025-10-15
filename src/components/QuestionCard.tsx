'use client'

import React from 'react'
import '../styles/QuestionCard.css'
import KatexRenderer from './ui/KatexRenderer'

interface QuestionCardProps {
  questionNumber?: number
  questionText: string
}

const QuestionCard: React.FC<QuestionCardProps> = ({ questionNumber, questionText }) => {
  return (
    <div className="question-card">
      <p className="question-text" id="question-text">
        <KatexRenderer content={questionText} />
      </p>
    </div>
  )
}

export default QuestionCard
