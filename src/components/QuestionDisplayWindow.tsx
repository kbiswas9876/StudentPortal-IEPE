'use client'

import React, { useState } from 'react'
import '../styles/QuestionDisplayWindow.css'
import QuestionCard from './QuestionCard'
import OptionCard from './OptionCard'
import UnifiedHeader from './UnifiedHeader'
import ActionsFooter from './ActionsFooter'
import QuestionDetails from './QuestionDetails'

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
  sessionStartTime?: number
  timeLimitInMinutes?: number
  currentQuestionStartTime?: number
  cumulativeTime?: number
  isPaused?: boolean
  showBookmark?: boolean
  onTogglePause?: () => void
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
  sessionStartTime,
  timeLimitInMinutes,
  currentQuestionStartTime,
  cumulativeTime,
  isPaused,
  showBookmark,
  onTogglePause
}) => {
  // Use props from PracticeInterface if available, otherwise use mock data
  const currentQuestion = question || mockQuestion
  const currentQuestionNumber = questionNumber || 2
  const currentTotalQuestions = totalQuestions || 5
  const currentUserAnswer = userAnswer || null
  const currentIsBookmarked = isBookmarked || false

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
    // Logic to mark question for review
    console.log('Marked for review')
  }

  const handleSaveAndNext = () => {
    // Logic to save answer and move to next question
    console.log('Saved and moving to next question')
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

  // Format timers
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // CRITICAL FIX: Both timers must be synchronized with isPaused state
  // The PracticeInterface already handles timer synchronization - we just need to display correctly
  const mainTimer = sessionStartTime ? formatTime(Date.now() - sessionStartTime) : "11:01"
  const inQuestionTimer = cumulativeTime ? formatTime(cumulativeTime) : "02:56"
  
  // The isPaused state is already properly managed in PracticeInterface
  // Both timers will automatically pause/resume together when isPaused changes

  return (
    <div className="question-window-container">
      {/* The header is now a real component */}
      <UnifiedHeader 
        currentQuestion={currentQuestionNumber}
        totalQuestions={currentTotalQuestions}
        mainTimer={mainTimer}
        onBack={handleBack}
        onReport={handleReport}
        isPaused={isPaused}
        onTogglePause={() => {
          // This will be connected to the parent component's pause logic
          if (onTogglePause) {
            onTogglePause()
          }
        }}
      />

      {/* 
        Part 1, Step C: Main Content Area. 
        This is the scrollable area for the question and options.
      */}
      <main className="main-content-area">
        <QuestionCard 
          questionText={currentQuestion.question_text} 
          inQuestionTimer={inQuestionTimer}
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

        {/* The footer is now inside main content area for proper alignment */}
        <ActionsFooter 
          onClearResponse={handleClearResponse}
          onMarkForReview={handleMarkForReview}
          onSaveAndNext={handleSaveAndNext}
          hasSelection={currentUserAnswer !== null && currentUserAnswer !== ''}
        />
      </main>
    </div>
  )
}

export default QuestionDisplayWindow
