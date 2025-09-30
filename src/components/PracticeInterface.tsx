'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import Timer from './Timer'
import QuestionPalette from './QuestionPalette'
import PremiumStatusPanel from './PremiumStatusPanel'
import QuestionDisplay from './QuestionDisplay'
import ActionBar from './ActionBar'
import ProgressBar from './ProgressBar'
import EndSessionModal from './EndSessionModal'
import ReportErrorModal from './ReportErrorModal'
import KatexRenderer from './ui/KatexRenderer'
import { FlagIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

type Question = Database['public']['Tables']['questions']['Row']

export type QuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'marked_for_review'

export type SessionState = {
  status: QuestionStatus
  user_answer: string | null
  time_taken: number
  is_bookmarked: boolean
}

interface PracticeInterfaceProps {
  questions: Question[]
  testMode?: 'practice' | 'timed'
  timeLimitInMinutes?: number
  mockTestData?: {
    test: {
      id: number
      name: string
      total_time_minutes: number
      marks_per_correct: number
      marks_per_incorrect: number
    }
  }
}

export default function PracticeInterface({ questions, testMode = 'practice', timeLimitInMinutes, mockTestData }: PracticeInterfaceProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStates, setSessionStates] = useState<SessionState[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEndSessionModal, setShowEndSessionModal] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Initialize session states
  useEffect(() => {
    if (questions.length > 0) {
      const initialStates: SessionState[] = questions.map(() => ({
        status: 'not_visited',
        user_answer: null,
        time_taken: 0,
        is_bookmarked: false
      }))
      setSessionStates(initialStates)
      setSessionStartTime(Date.now())
      setCurrentQuestionStartTime(Date.now())
      setIsInitialized(true)
    }
  }, [questions])

  // Update current question start time when index changes
  useEffect(() => {
    setCurrentQuestionStartTime(Date.now())
  }, [currentIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Alt + S: Save and Next
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        handleSaveAndNext()
      }
      // Alt + M: Mark for Review and Next
      else if (event.altKey && event.key === 'm') {
        event.preventDefault()
        handleMarkForReviewAndNext()
      }
      // Alt + C: Clear Response
      else if (event.altKey && event.key === 'c') {
        event.preventDefault()
        handleClearResponse()
      }
      // Alt + B: Bookmark
      else if (event.altKey && event.key === 'b') {
        event.preventDefault()
        handleBookmark()
      }
      // Alt + F: Focus Mode
      else if (event.altKey && event.key === 'f') {
        event.preventDefault()
        setIsFocusMode(!isFocusMode)
      }
      // Alt + R: Report Error
      else if (event.altKey && event.key === 'r') {
        event.preventDefault()
        setShowReportModal(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode])

  const currentQuestion = questions[currentIndex]
  const currentState = sessionStates[currentIndex] || {
    status: 'not_visited' as QuestionStatus,
    user_answer: null,
    time_taken: 0,
    is_bookmarked: false
  }

  // Debug logging
  console.log('PracticeInterface render:', {
    questionsLength: questions.length,
    sessionStatesLength: sessionStates.length,
    currentIndex,
    isInitialized,
    currentState
  })

  const updateSessionState = useCallback((index: number, updates: Partial<SessionState>) => {
    setSessionStates(prev => {
      const newStates = [...prev]
      newStates[index] = { ...newStates[index], ...updates }
      return newStates
    })
  }, [])

  const handleAnswerChange = (answer: string) => {
    updateSessionState(currentIndex, {
      user_answer: answer,
      status: answer ? 'answered' : 'unanswered'
    })
  }

  const handleSaveAndNext = () => {
    // Record time spent on current question
    const timeSpent = Date.now() - currentQuestionStartTime
    updateSessionState(currentIndex, {
      time_taken: currentState.time_taken + timeSpent
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleMarkForReviewAndNext = () => {
    // Record time spent on current question
    const timeSpent = Date.now() - currentQuestionStartTime
    updateSessionState(currentIndex, {
      status: 'marked_for_review',
      time_taken: currentState.time_taken + timeSpent
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleClearResponse = () => {
    updateSessionState(currentIndex, {
      user_answer: null,
      status: 'unanswered'
    })
  }

  const handleReturnToStart = () => {
    setCurrentIndex(0)
    setShowEndSessionModal(false)
  }

  const handleStayHere = () => {
    setShowEndSessionModal(false)
  }

  const handleBookmark = async () => {
    if (!user || !currentQuestion) return

    try {
      const response = await fetch('/api/practice/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to bookmark question')
      }

      // Update the session state to reflect the bookmark status
      updateSessionState(currentIndex, { is_bookmarked: !currentState.is_bookmarked })
      
      // Show success toast
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast({
          type: 'success',
          title: 'Question Bookmarked',
          message: 'Added to your revision hub for later review'
        })
      }
    } catch (error) {
      console.error('Error bookmarking question:', error)
    }
  }

  const handleSubmitTest = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Calculate final results
      const totalQuestions = questions.length
      const correctAnswers = sessionStates.filter((state, index) => {
        const question = questions[index]
        return state.user_answer === question.correct_option
      }).length
      const incorrectAnswers = sessionStates.filter((state, index) => {
        const question = questions[index]
        return state.user_answer && state.user_answer !== question.correct_option
      }).length
      const skippedAnswers = sessionStates.filter(state => !state.user_answer).length

      // Calculate score based on mock test rules or default percentage
      let score: number
      if (mockTestData) {
        // Mock test scoring: use actual marks
        const totalMarks = (correctAnswers * mockTestData.test.marks_per_correct) + 
                          (incorrectAnswers * mockTestData.test.marks_per_incorrect)
        const maxMarks = totalQuestions * mockTestData.test.marks_per_correct
        score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
      } else {
        // Regular practice scoring: percentage based
        score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      }
      
      const totalTime = Math.round((Date.now() - sessionStartTime) / 1000) // Convert to seconds

      console.log('Submitting practice session:', {
        user_id: user?.id,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        skipped_answers: skippedAnswers,
        score
      })

      // Save test result
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          questions: questions.map((question, index) => ({
            question_id: question.id, // Use numeric ID from questions table
            user_answer: sessionStates[index].user_answer,
            status: sessionStates[index].user_answer ? 
              (sessionStates[index].user_answer === question.correct_option ? 'correct' : 'incorrect') : 
              'skipped',
            time_taken: Math.round(sessionStates[index].time_taken / 1000) // Convert to seconds
          })),
          score,
          total_time: totalTime,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          skipped_answers: skippedAnswers,
          // Mock test specific fields
          session_type: mockTestData ? 'mock_test' : 'practice',
          mock_test_id: mockTestData ? mockTestData.test.id : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test submitted successfully:', result)
        // Redirect to analysis report
        router.push(`/analysis/${result.test_id}`)
      } else {
        const errorData = await response.json()
        console.error('Test submission failed:', errorData)
        throw new Error(errorData.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      setIsSubmitting(false)
    }
  }

  const handleQuestionNavigation = (index: number) => {
    // Record time spent on current question
    const timeSpent = Date.now() - currentQuestionStartTime
    updateSessionState(currentIndex, {
      time_taken: currentState.time_taken + timeSpent
    })

    setCurrentIndex(index)
    setShowMobileSidebar(false) // Close mobile sidebar
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!isInitialized || sessionStates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Initializing practice session...</p>
        </div>
      </div>
    )
  }

  // Calculate answered questions for progress bar
  const answeredQuestions = sessionStates.filter(state => state.user_answer !== null).length

  return (
    <div className="min-h-screen flex">
      {/* Progress Bar - Top of Screen */}
      <ProgressBar
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        answeredQuestions={answeredQuestions}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-12 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {mockTestData ? mockTestData.test.name : 'Practice Session'} - Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <Timer sessionStartTime={sessionStartTime} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:flex-none lg:w-3/4 pt-28 lg:pt-12">
        <div className="h-screen overflow-y-auto">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            userAnswer={currentState.user_answer}
            isBookmarked={currentState.is_bookmarked}
            onAnswerChange={handleAnswerChange}
            onBookmark={handleBookmark}
            onReportError={() => setShowReportModal(true)}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="hidden lg:block w-1/4 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-6 overflow-y-auto"
          >
            <PremiumStatusPanel
              questions={questions}
              sessionStates={sessionStates}
              currentIndex={currentIndex}
              sessionStartTime={sessionStartTime}
              timeLimitInMinutes={testMode === 'timed' ? timeLimitInMinutes : undefined}
              onQuestionSelect={handleQuestionNavigation}
              onSubmitTest={handleSubmitTest}
              isSubmitting={isSubmitting}
            />
            
            {mockTestData && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Scoring Rules</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <div className="flex justify-between">
                    <span>Correct Answer:</span>
                    <span className="font-semibold">+{mockTestData.test.marks_per_correct} marks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incorrect Answer:</span>
                    <span className="font-semibold">{mockTestData.test.marks_per_incorrect} marks</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Question Navigation</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Timer 
              sessionStartTime={sessionStartTime} 
              duration={testMode === 'timed' ? timeLimitInMinutes : undefined}
            />
              </div>
              
              <div className="p-6">
                <QuestionPalette
                  questions={questions}
                  sessionStates={sessionStates}
                  currentIndex={currentIndex}
                  onQuestionSelect={handleQuestionNavigation}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFocusMode(!isFocusMode)}
        className="fixed top-4 right-4 z-40 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title={`${isFocusMode ? 'Exit' : 'Enter'} Focus Mode (Alt + F)`}
      >
        {isFocusMode ? (
          <ArrowsPointingOutIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <ArrowsPointingInIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </motion.button>

      {/* Action Bar */}
      <ActionBar
        onSaveAndNext={handleSaveAndNext}
        onMarkForReviewAndNext={handleMarkForReviewAndNext}
        onClearResponse={handleClearResponse}
        onSubmitTest={handleSubmitTest}
        isSubmitting={isSubmitting}
        isLastQuestion={currentIndex === questions.length - 1}
      />

      {/* End Session Modal */}
      <EndSessionModal
        isOpen={showEndSessionModal}
        onReturnToStart={handleReturnToStart}
        onStayHere={handleStayHere}
      />

      {/* Report Error Modal */}
      {showReportModal && (
        <ReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestion.id}
          questionText={currentQuestion.question_text}
        />
      )}
    </div>
  )
}
