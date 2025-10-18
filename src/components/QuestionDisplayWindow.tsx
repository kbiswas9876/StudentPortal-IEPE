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
  sessionStartTime?: number
  timeLimitInMinutes?: number
  testMode?: 'practice' | 'timed'
  currentQuestionStartTime?: number
  cumulativeTime?: number
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
  sessionStartTime,
  timeLimitInMinutes,
  testMode,
  currentQuestionStartTime,
  cumulativeTime,
  isPaused,
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

  // Format timers
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // CRITICAL FIX: Implement conditional timer logic based on testMode
  const [now, setNow] = useState(Date.now());

  // This useEffect hook will update the 'now' state every 100ms,
  // forcing the timer display to re-render and stay in sync.
  useEffect(() => {
    const interval = setInterval(() => {
      const newNow = Date.now();
      setNow(newNow);
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const mainTimer = useMemo(() => {
    if (!sessionStartTime) {
      return "00:00";
    }

    if (testMode === 'timed' && timeLimitInMinutes) {
      // --- COUNTDOWN LOGIC (with the fix) ---
      const totalTimeMs = timeLimitInMinutes * 60 * 1000;
      const elapsedMs = now - sessionStartTime;
      const remainingMs = Math.max(0, totalTimeMs - elapsedMs);

      // FIX: Use Math.ceil() on the seconds to ensure the initial display
      // is rounded up to the full minute (e.g., 1799995ms -> 1800s -> 30:00).
      // This effectively "snaps" the initial display to the correct starting value.
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      // Create a new formatting function to handle seconds directly
      const formatSecondsToMMSS = (totalSeconds: number) => {
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      };

      return formatSecondsToMMSS(remainingSeconds);
    } else {
      // --- COUNT-UP LOGIC (Existing Behavior - Unchanged) ---
      const elapsedMs = now - sessionStartTime;
      return formatTime(elapsedMs);
    }
  }, [now, sessionStartTime, testMode, timeLimitInMinutes]);
  
  // FIX: Use TimerDisplay component for in-question timer to properly handle pause state
  // Pass the cumulative time in milliseconds and isPaused state to TimerDisplay
  const inQuestionTimer = cumulativeTime || 0
  
  // The isPaused state is already properly managed in PracticeInterface
  // TimerDisplay component will handle pause/resume correctly

  return (
    <div className="question-display-window">
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
        Main Content Area - Scrollable content only
        This area will scroll independently while header and footer remain fixed
      */}
      <main className={`main-content-area ${isLoaded ? 'loaded' : ''}`}>
        <QuestionCard 
          questionText={currentQuestion.question_text} 
          inQuestionTimer={inQuestionTimer}
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
