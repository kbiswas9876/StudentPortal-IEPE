'use client'

import React, { useState, useEffect, useMemo } from 'react'
import '../styles/QuestionDisplayWindow.css'
import QuestionCard from './QuestionCard'
import OptionCard from './OptionCard'
import UnifiedHeader from './UnifiedHeader'
import ActionsFooter from './ActionsFooter'
import QuestionDetails from './QuestionDetails'
import TimerDisplay from './TimerDisplay'

// --- MOCK DATA (for demonstration) ---
const mockQuestion = {
  text: "What is the distance between two points A(x₁, y₁) and B(x₂, y₂) in a Cartesian plane?",
  options: [
    { id: 'a', text: '√(x₂ - x₁)² + (y₂ - y₁)²' },
    { id: 'b', text: '(x₂ - x₁) + (y₂ - y₁)' },
    { id: 'c', text: '|x₂ - x₁| + |y₂ - y₁|' },
    { id: 'd', text: '(y₂ - y₁)/(x₂ - x₁)' },
  ],
  source: "CAT 2021 Slot 1",
  tags: ["Coordinate Geometry", "Distance Formula"]
}
// ------------------------------------

interface QuestionDisplayWindowProps {
  children?: React.ReactNode
  // Props for integration with PracticeInterface
  question?: any
  questionNumber?: number
  totalQuestions?: number
  userAnswer?: string | null
  isBookmarked?: boolean
  onAnswerChange?: (answer: string) => void
  onBookmark?: () => void
  onReportError?: () => void
  onExit?: () => void
  mainTimer?: string
  isLowTime?: boolean
  inQuestionTime?: number
  isPaused?: boolean
  showBookmark?: boolean
  onTogglePause?: () => void
  // CRITICAL: Add missing button functionality props
  onSaveAndNext?: () => void
  onMarkForReviewAndNext?: () => void
}

const QuestionDisplayWindow: React.FC<QuestionDisplayWindowProps> = ({ 
  children,
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isBookmarked,
  onAnswerChange,
  onBookmark,
  onReportError,
  onExit,
  mainTimer = '00:00',
  isLowTime = false,
  inQuestionTime = 0,
  isPaused = false,
  showBookmark,
  onTogglePause,
  // CRITICAL: Add missing button functionality props
  onSaveAndNext,
  onMarkForReviewAndNext
}) => {
  // FOUC Fix: State to control fade-in animation
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // This runs only once after the component has mounted
    setIsLoaded(true)
  }, []) // Empty dependency array ensures it runs once
  // Use props from PracticeInterface if available, otherwise use mock data
  const currentQuestion = question || mockQuestion
  const currentQuestionNumber = questionNumber || 2
  const currentTotalQuestions = totalQuestions || 5
  const currentUserAnswer = userAnswer || null
  const currentIsBookmarked = isBookmarked || false

  // hasSelection is only used for Clear Response button - Save & Next and Mark for Review are always enabled

  const handleOptionSelect = (optionId: string) => {
    if (onAnswerChange) {
      onAnswerChange(optionId)
    }
  }

  const handleClearResponse = () => {
    if (onAnswerChange) {
      onAnswerChange('')
    }
  }

  const handleMarkForReview = () => {
    console.log('Mark for Review & Next button was clicked!') // DEBUG: Add this log
    if (onMarkForReviewAndNext) {
      onMarkForReviewAndNext() // Call the real function from PracticeInterface
    } else {
      console.log('Mark for Review & Next - no handler provided')
    }
  }

  const handleSaveAndNext = () => {
    console.log('Save & Next button was clicked!') // DEBUG: Add this log
    if (onSaveAndNext) {
      onSaveAndNext() // Call the real function from PracticeInterface
    } else {
      console.log('Save & Next - no handler provided')
    }
  }

  const handleBack = () => {
    if (onExit) {
      onExit()
    } else {
      // Fallback logic to go back to question list
      console.log('Going back to question list')
    }
  }

  const handleReport = () => {
    if (onReportError) {
      onReportError()
    }
  }

  return (
    <div className="question-display-window">
      {/* The header is now a real component */}
      <UnifiedHeader 
        currentQuestion={currentQuestionNumber}
        totalQuestions={currentTotalQuestions}
        mainTimer={mainTimer}
        isLowTime={isLowTime}
        onBack={handleBack}
        onReport={handleReport}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
      />

      {/* 
        Main Content Area - Scrollable content only
        This area will scroll independently while header and footer remain fixed
      */}
      <main className={`main-content-area ${isLoaded ? 'loaded' : ''}`}>
        <QuestionCard 
          questionText={currentQuestion.question_text} 
          inQuestionTimer={inQuestionTime}
          isPaused={isPaused}
        />
        
        <div className="options-container" role="radiogroup" aria-labelledby="question-text">
          {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => (
            <OptionCard
              key={key}
              optionText={value as string}
              isSelected={currentUserAnswer === key}
              onClick={() => handleOptionSelect(key)}
              optionId={key}
            />
          ))}
        </div>

        {/* Add the new QuestionDetails component */}
        <QuestionDetails 
          source={currentQuestion.exam_metadata}
          tags={currentQuestion.admin_tags}
        />
      </main>

      {/* 
        Fixed Footer - Always visible at bottom
        This footer will remain fixed and not scroll with content
      */}
      <ActionsFooter 
        onClearResponse={handleClearResponse}
        onMarkForReview={handleMarkForReview}
        onSaveAndNext={handleSaveAndNext}
        hasSelection={currentUserAnswer !== null && currentUserAnswer !== ''}
      />
    </div>
  )
}

export default QuestionDisplayWindow
