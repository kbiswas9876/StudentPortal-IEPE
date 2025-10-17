'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/QuestionDisplayWindow.css'
import SolutionUnifiedHeader from './SolutionUnifiedHeader'
import QuestionCard from './QuestionCard'
import QuestionDetails from './QuestionDetails'
import SolutionNavigationFooter from './SolutionNavigationFooter'
import KatexRenderer from './ui/KatexRenderer'
import { Database } from '@/types/database'

type TestResult = Database['public']['Tables']['test_results']['Row']
type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface SessionDataInput {
  testResult?: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  peerAverages?: Record<number, number>
}

interface SolutionQuestionDisplayWindowProps {
  session: SessionDataInput
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  onReportError?: () => void
  canPrev?: boolean
  canNext?: boolean
  filteredPosition?: number
  filteredTotal?: number
  showBookmark?: boolean
}

const SolutionQuestionDisplayWindow: React.FC<SolutionQuestionDisplayWindowProps> = ({
  session,
  currentIndex,
  onPrev,
  onNext,
  isBookmarked = false,
  onToggleBookmark,
  onReportError,
  canPrev,
  canNext,
  filteredPosition,
  filteredTotal,
  showBookmark = true
}) => {
  // FOUC Fix: State to control fade-in animation
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSolution, setShowSolution] = useState(true)

  useEffect(() => {
    // This runs only once after the component has mounted
    setIsLoaded(true)
  }, [])

  const totalQuestions = session.questions.length
  const question = session.questions[currentIndex]

  const answerLogEntry: AnswerLog | undefined = question
    ? session.answerLog.find((a) => a.question_id === question.id)
    : undefined

  const status = (answerLogEntry?.status ?? 'skipped') as 'correct' | 'incorrect' | 'skipped'
  const userAnswerKey = answerLogEntry?.user_answer ?? null
  const timeTakenSeconds = answerLogEntry?.time_taken ?? 0

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }


  const handleBack = () => {
    // Navigate back to analysis page
    window.history.back()
  }

  const handleReport = () => {
    if (onReportError) {
      onReportError()
    }
  }

  // Display position and total
  const displayPosition = filteredPosition ?? (currentIndex + 1)
  const displayTotal = filteredTotal ?? totalQuestions

  if (!question) {
    return (
      <div className="question-window-container">
        <SolutionUnifiedHeader 
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          timeTakenSeconds={0}
          status="skipped"
          difficulty={null}
          isBookmarked={false}
          onBack={handleBack}
          onReport={handleReport}
        />
        <main className={`main-content-area ${isLoaded ? 'loaded' : ''}`}>
          <div className="text-slate-600 dark:text-slate-300">No question available.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="question-window-container">
      {/* Fixed Header - Same as Practice Interface */}
      <SolutionUnifiedHeader 
        currentQuestion={displayPosition}
        totalQuestions={displayTotal}
        timeTakenSeconds={timeTakenSeconds}
        status={status}
        difficulty={question.difficulty}
        isBookmarked={isBookmarked}
        onBack={handleBack}
        onReport={handleReport}
        onToggleBookmark={onToggleBookmark}
        showBookmark={showBookmark}
      />

      {/* Main Content Area - Scrollable content only */}
      <main className={`main-content-area ${isLoaded ? 'loaded' : ''}`}>
        {/* Question Card - Same as Practice Interface */}
        <QuestionCard 
          questionText={question.question_text}
        />
        
        {/* Answer Options Display - Solution-specific styling with matching width */}
        <div className="options-container" role="radiogroup" aria-labelledby="question-text">
          <div className="w-full max-w-[880px] mx-auto space-y-3">
            {question.options && Object.entries(question.options).map(([key, value]) => {
              const isCorrect = key === question.correct_option
              const isUserChoice = userAnswerKey === key
              const isIncorrectChoice = isUserChoice && !isCorrect
              
              // Solution-specific styling
              const baseClasses = 'block p-4 rounded-xl border-2 transition-all duration-200'
              const stateClasses = isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : isIncorrectChoice
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              
              return (
                <motion.div
                  key={key}
                  className={`${baseClasses} ${stateClasses}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Option label badge */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                      ${isCorrect ? 'bg-green-600 border-green-600 text-white'
                        : isIncorrectChoice ? 'bg-red-600 border-red-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}
                    `}>
                      <span className="text-sm font-bold">{key}</span>
                    </div>

                    <div className="flex-1 min-h-0">
                      <KatexRenderer
                        content={value}
                        className="text-slate-700 dark:text-slate-300 leading-relaxed"
                      />
                    </div>

                    {/* Status labels */}
                    <div className="flex flex-col items-end gap-2">
                      {isCorrect && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                          Correct
                        </span>
                      )}
                      {isIncorrectChoice && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                          Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Question Details - Same as Practice Interface */}
        <QuestionDetails 
          source={question.exam_metadata}
          tags={question.admin_tags}
        />

        {/* Solution Box */}
        {question.solution_text && (
          <div className="mt-6">
            <button
              onClick={() => setShowSolution((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              aria-expanded={showSolution}
            >
              <svg
                className={`w-4 h-4 transition-transform ${showSolution ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showSolution ? 'Hide Solution' : 'View Solution'}</span>
            </button>

            <AnimatePresence initial={false}>
              {showSolution && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'top', willChange: 'transform, opacity' }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden"
                >
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Solution</h4>
                  <KatexRenderer
                    content={question.solution_text}
                    className="text-blue-800 dark:text-blue-200 leading-relaxed"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Fixed Footer - Navigation Only */}
      <SolutionNavigationFooter
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev ?? false}
        canNext={canNext ?? false}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        filteredPosition={filteredPosition}
        filteredTotal={filteredTotal}
      />
    </div>
  )
}

export default SolutionQuestionDisplayWindow
