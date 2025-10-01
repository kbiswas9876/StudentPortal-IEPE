'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import TimerDisplay from './TimerDisplay'
import QuestionPalette from './QuestionPalette'
import PremiumStatusPanel from './PremiumStatusPanel'
import QuestionDisplay from './QuestionDisplay'
import ActionBar from './ActionBar'
import ProgressBar from './ProgressBar'
import EndSessionModal from './EndSessionModal'
import ReportErrorModal from './ReportErrorModal'
import ExitSessionModal from './ExitSessionModal'
import ZenModeBackButton from './ZenModeBackButton'
import KatexRenderer from './ui/KatexRenderer'
import { FlagIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

type Question = Database['public']['Tables']['questions']['Row']

export type QuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'marked_for_review'

export type SessionState = {
  status: QuestionStatus
  user_answer: string | null
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
  savedSessionState?: any
}

export default function PracticeInterface({ questions, testMode = 'practice', timeLimitInMinutes, mockTestData, savedSessionState }: PracticeInterfaceProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStates, setSessionStates] = useState<SessionState[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEndSessionModal, setShowEndSessionModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  
  // Dual-Timer System State Management
  const [timePerQuestion, setTimePerQuestion] = useState<Record<string, number>>({})
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(Date.now())

  // Initialize session states
  useEffect(() => {
    if (questions.length > 0) {
      if (savedSessionState) {
        // Restore saved session state - RE-HYDRATION MODE
        console.log('Restoring saved session state:', savedSessionState)
        
        const restoredStates: SessionState[] = questions.map((q, index) => {
          const questionId = q.id
          return {
            status: (savedSessionState?.questionStatuses?.[questionId] as QuestionStatus) || 'not_visited',
            user_answer: savedSessionState?.userAnswers?.[questionId] || null,
            is_bookmarked: savedSessionState?.bookmarkedQuestions?.[questionId] || false
          }
        })
        
        // RE-HYDRATE ALL STATE FROM SAVED SESSION
        setSessionStates(restoredStates)
        setCurrentIndex(savedSessionState?.currentIndex || 0)
        setSessionStartTime(savedSessionState?.sessionStartTime || Date.now())
        
        // Restore per-question timing data
        if (savedSessionState?.timePerQuestion) {
          const restoredTimePerQuestion: Record<string, number> = {}
          Object.entries(savedSessionState.timePerQuestion).forEach(([questionId, timeInSeconds]) => {
            restoredTimePerQuestion[questionId] = (timeInSeconds as number) * 1000 // Convert back to milliseconds
          })
          setTimePerQuestion(restoredTimePerQuestion)
        }
        
        setIsInitialized(true)
        
        console.log('Session state restored successfully with:', {
          currentIndex: savedSessionState?.currentIndex,
          sessionStartTime: savedSessionState?.sessionStartTime,
          userAnswers: Object.keys(savedSessionState?.userAnswers || {}).length,
          questionStatuses: Object.keys(savedSessionState?.questionStatuses || {}).length
        })
      } else {
        // Initialize new session - NEW SESSION MODE
        const initialStates: SessionState[] = questions.map(() => ({
          status: 'not_visited',
          user_answer: null,
          is_bookmarked: false
        }))
        setSessionStates(initialStates)
        setSessionStartTime(Date.now())
        setIsInitialized(true)
      }
    }
  }, [questions, savedSessionState])


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
      // Alt + R: Report Error
      else if (event.altKey && event.key === 'r') {
        event.preventDefault()
        setShowReportModal(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentQuestion = questions[currentIndex]

  // Core per-question timing logic
  useEffect(() => {
    if (!currentQuestion) return

    const questionId = currentQuestion.id.toString()
    
    // Save time spent on previous question when navigating away
    const savePreviousQuestionTime = () => {
      if (currentQuestionStartTime) {
        const timeSpent = Date.now() - currentQuestionStartTime
        setTimePerQuestion(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + timeSpent
        }))
      }
    }

    // Cleanup function to save time when component unmounts or question changes
    return () => {
      savePreviousQuestionTime()
    }
  }, [currentIndex, currentQuestion, currentQuestionStartTime])
  const currentState = sessionStates[currentIndex] || {
    status: 'not_visited' as QuestionStatus,
    user_answer: null,
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
    // Only update status if not already marked for review
    // If marked for review and user changes answer, keep it marked
    const currentState = sessionStates[currentIndex]
    const newStatus = currentState?.status === 'marked_for_review' 
      ? 'marked_for_review' 
      : (answer ? 'answered' : 'unanswered')
    
    updateSessionState(currentIndex, {
      user_answer: answer,
      status: newStatus
    })
  }

  const handleSaveAndNext = () => {
    // Determine status based on current state and user answer
    let newStatus: QuestionStatus
    if (currentState.status === 'marked_for_review') {
      // If marked for review and has answer, keep as marked_for_review
      // If marked for review and no answer, change to unanswered
      newStatus = currentState.user_answer ? 'marked_for_review' : 'unanswered'
    } else {
      // Regular save logic: answered if has answer, unanswered if no answer
      newStatus = currentState.user_answer ? 'answered' : 'unanswered'
    }
    
    updateSessionState(currentIndex, {
      status: newStatus
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
    updateSessionState(currentIndex, {
      status: 'marked_for_review'
      // Keep existing user_answer - don't change it
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
    // Clear the answer but don't change status yet
    // Status will be determined when user clicks Save & Next or Mark for Review & Next
    updateSessionState(currentIndex, {
      user_answer: null
      // Keep existing status - will be updated on next action
    })
  }

  const handleReturnToStart = () => {
    setCurrentIndex(0)
    setShowEndSessionModal(false)
  }

  const handleStayHere = () => {
    setShowEndSessionModal(false)
  }

  const handleExitWithoutSaving = () => {
    setShowExitModal(false)
    router.push('/dashboard')
  }

  const handleSaveAndExit = async (sessionName: string) => {
    try {
      if (!user) return

      // Create comprehensive session state object with complete state serialization
      const sessionState = {
        // Core session configuration
        sessionConfig: {
          testMode,
          timeLimitInMinutes,
          questionOrder: 'sequential' // Default for now
        },
        
        // Question set and current position
        questionSet: questions.map(q => q.id),
        currentIndex,
        
        // Timer data
        sessionStartTime,
        mainTimerValue: Math.floor((Date.now() - sessionStartTime) / 1000),
        
        // User progress data - capture ALL live state
        userAnswers: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.user_answer) {
            acc[q.id] = state.user_answer
          }
          return acc
        }, {} as Record<string, string>),
        
        questionStatuses: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          acc[q.id] = state?.status || 'not_visited'
          return acc
        }, {} as Record<string, string>),
        
        timePerQuestion: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          const questionTime = timePerQuestion[q.id] || 0
          if (questionTime > 0) {
            acc[q.id] = Math.floor(questionTime / 1000) // Convert to seconds
          }
          return acc
        }, {} as Record<string, number>),
        
        bookmarkedQuestions: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.is_bookmarked) {
            acc[q.id] = true
          }
          return acc
        }, {} as Record<string, boolean>),
        
        // Mock test data if applicable
        mockTestData,
        
        // Full question data for restoration
        questions: questions.map((q, index) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_option: q.correct_option,
          solution_text: q.solution_text,
          difficulty: q.difficulty,
          chapter_name: q.chapter_name,
          book_source: q.book_source
        }))
      }

      console.log('Saving comprehensive session state:', sessionState)

      // Save to database
      const response = await fetch('/api/saved-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          sessionName,
          sessionState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      // Close modal and redirect
      setShowExitModal(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving session:', error)
      showToast({ type: 'error', title: 'Failed to save session', message: 'Please try again.' })
    }
  }

  const getCurrentProgress = () => {
    const answered = sessionStates.filter(state => state.user_answer !== null).length
    const total = questions.length
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
    const minutes = Math.floor(timeSpent / 60)
    const seconds = timeSpent % 60
    return {
      answered,
      total,
      timeSpent: `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const getStatusCounts = () => {
    const answeredCount = sessionStates.filter(s => s.status === 'answered').length
    const notAnsweredCount = sessionStates.filter(s => s.status === 'unanswered').length
    const notVisitedCount = sessionStates.filter(s => s.status === 'not_visited').length
    const markedCount = sessionStates.filter(s => s.status === 'marked_for_review').length
    const markedAndAnsweredCount = sessionStates.filter(s => s.status === 'marked_for_review' && s.user_answer).length
    const bookmarkedCount = sessionStates.filter(s => s.is_bookmarked).length

    return {
      answeredCount,
      notAnsweredCount,
      notVisitedCount,
      markedCount,
      markedAndAnsweredCount,
      bookmarkedCount
    }
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
      showToast({
        type: 'success',
        title: 'Question Bookmarked',
        message: 'Added to your revision hub for later review'
      })
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
            time_taken: Math.round((timePerQuestion[question.id] || 0) / 1000) // Use new per-question timing data
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
    // Save time spent on current question before navigating
    if (currentQuestion && currentQuestionStartTime) {
      const timeSpent = Date.now() - currentQuestionStartTime
      const questionId = currentQuestion.id.toString()
      setTimePerQuestion(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + timeSpent
      }))
    }
    
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
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {mockTestData ? mockTestData.test.name : 'Practice Session'} - Question {currentIndex + 1} of {questions.length}
              </div>
              <TimerDisplay
                startTime={currentQuestionStartTime}
                mode="stopwatch"
                size="small"
                className="text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Ultra-Premium Main Timer - Fixed at top edge */}
      <div className="lg:hidden fixed top-0 left-1/2 transform -translate-x-1/2 z-50">
        <TimerDisplay
          startTime={sessionStartTime}
          mode={testMode === 'timed' ? 'countdown' : 'stopwatch'}
          duration={testMode === 'timed' ? timeLimitInMinutes : undefined}
          onTimeUp={handleSubmitTest}
          size="large"
          variant="ultra-premium"
          className="shadow-2xl hover:shadow-3xl"
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 pt-28 lg:pt-12 transition-all duration-300 ${isRightPanelCollapsed ? 'lg:w-full' : 'lg:w-3/4'}`}>
        {/* Desktop Ultra-Premium Main Timer - Fixed at top edge */}
        <div className="hidden lg:block fixed top-0 left-1/2 transform -translate-x-1/2 z-50">
          <TimerDisplay
            startTime={sessionStartTime}
            mode={testMode === 'timed' ? 'countdown' : 'stopwatch'}
            duration={testMode === 'timed' ? timeLimitInMinutes : undefined}
            onTimeUp={handleSubmitTest}
            size="ultra"
            variant="ultra-premium"
            className="shadow-2xl hover:shadow-3xl"
          />
        </div>
        
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
            sessionStartTime={sessionStartTime}
            timeLimitInMinutes={testMode === 'timed' ? timeLimitInMinutes : undefined}
            currentQuestionStartTime={currentQuestionStartTime}
            cumulativeTime={timePerQuestion[currentQuestion.id] || 0}
          />
        </div>
      </div>

      {/* Desktop Right Panel - Simplified Structure */}
      <div className="hidden lg:block w-1/4 h-screen p-6">
        <PremiumStatusPanel
          questions={questions}
          sessionStates={sessionStates}
          currentIndex={currentIndex}
          onQuestionSelect={handleQuestionNavigation}
          onSubmitTest={handleSubmitTest}
          isSubmitting={isSubmitting}
          mockTestData={mockTestData}
        />
      </div>

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
              className="w-80 h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Header with Timer */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50">
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
                <div className="flex items-center justify-between mt-4">
                  <TimerDisplay
                    startTime={currentQuestionStartTime}
                    mode="stopwatch"
                    size="small"
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <TimerDisplay
                    startTime={sessionStartTime}
                    mode={testMode === 'timed' ? 'countdown' : 'stopwatch'}
                    duration={testMode === 'timed' ? timeLimitInMinutes : undefined}
                    onTimeUp={handleSubmitTest}
                    size="large"
                    variant="premium"
                    className="shadow-lg"
                  />
                </div>
              </div>
              
              {/* Mobile Question Palette - Full Height with Proper Flex Layout */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                <QuestionPalette
                  questions={questions}
                  sessionStates={sessionStates}
                  currentIndex={currentIndex}
                  onQuestionSelect={handleQuestionNavigation}
                  onSubmitTest={handleSubmitTest}
                  isSubmitting={isSubmitting}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Action Bar */}
      <ActionBar
        onSaveAndNext={handleSaveAndNext}
        onMarkForReviewAndNext={handleMarkForReviewAndNext}
        onClearResponse={handleClearResponse}
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

      {/* Zen Mode Back Button */}
      <ZenModeBackButton onClick={() => setShowExitModal(true)} />

      {/* Exit Session Modal */}
      <ExitSessionModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onExitWithoutSaving={handleExitWithoutSaving}
        onSaveAndExit={handleSaveAndExit}
        currentProgress={getCurrentProgress()}
        statusCounts={getStatusCounts()}
      />
    </div>
  )
}
