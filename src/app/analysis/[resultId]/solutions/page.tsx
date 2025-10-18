'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
 // AnalysisSkeletonLoader dynamically imported below to avoid server bundling framer-motion
import nextDynamic from 'next/dynamic'
// Dynamically import client-only components to avoid server bundling framer-motion
const DynamicReviewPremiumStatusPanel = nextDynamic(() => import('@/components/ReviewPremiumStatusPanel'), { ssr: false })
const DynamicSolutionQuestionDisplayWindow = nextDynamic(() => import('@/components/SolutionQuestionDisplayWindow'), { ssr: false })
const DynamicAnalysisSkeletonLoader = nextDynamic(() => import('@/components/AnalysisSkeletonLoader'), { ssr: false })
const DynamicZenModeBackButton = nextDynamic(() => import('@/components/ZenModeBackButton'), { ssr: false })
const DynamicReportErrorModal = nextDynamic(() => import('@/components/ReportErrorModal'), { ssr: false })
const DynamicViewAllQuestionsModal = nextDynamic(() => import('@/components/ViewAllQuestionsModal'), { ssr: false })
const DynamicQuestionNavigationFooter = nextDynamic(() => import('@/components/QuestionNavigationFooter'), { ssr: false })
const DynamicBookmarkCreationModal = nextDynamic(() => import('@/components/BookmarkCreationModal'), { ssr: false })
const DynamicBookmarkHistory = nextDynamic(() => import('@/components/BookmarkHistory'), { ssr: false })
const DynamicSrsFeedbackControls = nextDynamic(() => import('@/components/SrsFeedbackControls'), { ssr: false })

// Local type alias to avoid importing from StrategicPerformanceMatrix which uses framer-motion
type QuadrantKey = 'strengths' | 'needsSpeed' | 'carelessErrors' | 'weaknesses'
import { isFastBasedOnDifficultyOrGeneric } from '@/lib/config/time-benchmarks'
import type { QuestionStatus } from '@/components/PracticeInterface'
 // ZenModeBackButton dynamically imported above
 // ReportErrorModal dynamically imported above

 import { ChevronLeft, ChevronRight, X } from 'lucide-react'
type TestResult = Database['public']['Tables']['test_results']['Row']
type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface SessionData {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  peerAverages: Record<number, number>
}

/**
 * Unified Solutions Interface
 * Layout mirrors practice environment: main content left, question palette right.
 * Enhancements:
 * - QuestionPalette: compact performance matrix, advanced filters, status summary
 * - MainQuestionView: header, inline actions (bookmark, report), collapsible solution
 * - Navigation respects filtered question set
 */
export default function DetailedSolutionReviewPage() {
  const { resultId } = useParams()
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Track which question is currently being reviewed (index in original order)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Filters
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | string
  >('all')
  const [bookmarkOnly, setBookmarkOnly] = useState(false)

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false)
  
  // View All Questions modal
  const [showViewAllModal, setShowViewAllModal] = useState(false)
  
  // Bookmark creation modal
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)

  // Bookmark map keyed by questions.question_id (string)
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({})
  
  // SRS Feedback state
  const [srsFeedbackGiven, setSrsFeedbackGiven] = useState<Set<string>>(new Set())
  const [srsFeedbackError, setSrsFeedbackError] = useState<string | null>(null)

  // Prevent duplicate fetches during re-renders
  const dataFetchedRef = useRef(false)
  
  // Prevent concurrent bookmark requests (race condition fix)
  const bookmarkInProgressRef = useRef(false)

  // Right panel collapsed state (controls visibility and left column width)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  
  // Track session origin for conditional rendering
  const source = searchParams.get('source')

  useEffect(() => {
    if (authLoading) return
    // Anonymous viewing permitted for verification; bookmark/report actions require login
    if (resultId && !dataFetchedRef.current) {
      dataFetchedRef.current = true
      fetchSessionData()
    }
  }, [authLoading, resultId])

  // Initialize question index when data loads
  useEffect(() => {
    if (sessionData && sessionData.questions.length > 0) {
      setCurrentQuestionIndex(0)
    }
  }, [sessionData])

  // Fetch bookmarks once sessionData is available
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!sessionData || !user) return
      try {
        const questionIds = sessionData.questions.map((q) => q.question_id)
        const response = await fetch('/api/practice/check-bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ questionIds }),
        })
        const result = await response.json()
        if (response.ok && result.bookmarks) {
          setBookmarkedMap(result.bookmarks as Record<string, boolean>)
        }
      } catch (e) {
        console.error('Failed to fetch bookmarks:', e)
      }
    }
    fetchBookmarks()
  }, [sessionData, user, session])

  // Basic timeout safeguard to avoid indefinite loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 10000)
    return () => clearTimeout(timeout)
  }, [loading])

  const fetchSessionData = async (isRetry = false) => {
    try {
      setLoading(true)
      if (isRetry) {
        setError(null)
        setRetryCount((prev) => prev + 1)
      }

      const response = await fetch(`/api/analysis/${resultId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch session data')
      }

      setSessionData(result.data as SessionData)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch session data'
      setError(message)

      if (retryCount < 3 && message.toLowerCase().includes('not found')) {
        setTimeout(() => fetchSessionData(true), 2000)
        return
      }
    } finally {
      setLoading(false)
    }
  }




  // Build review states (correct/incorrect/skipped) aligned to questions order
  const reviewStates =
    sessionData?.questions.map((q) => {
      const log = sessionData?.answerLog.find((a) => a.question_id === q.id)
      const status = (log?.status ?? 'skipped') as 'correct' | 'incorrect' | 'skipped'
      return { status }
    }) ?? []

  // Map review states to PremiumStatusPanel sessionStates format
  const premiumSessionStates =
    sessionData?.questions.map((q, index) => {
      const rv = reviewStates[index]?.status
      const status =
        rv === 'correct' ? 'answered' :
        rv === 'incorrect' ? 'unanswered' :
        'not_visited'
      const is_bookmarked = !!bookmarkedMap[String(q.question_id)]
      return { status: status as QuestionStatus, user_answer: null, is_bookmarked }
    }) ?? []

  // CRITICAL FIX: Create timing map from answerLog for Performance Matrix stability
  // Maps question.id to time_taken in seconds (answerLog already stores in seconds)
  const timePerQuestion: Record<string, number> = {}
  sessionData?.answerLog.forEach((answer) => {
    timePerQuestion[answer.question_id.toString()] = answer.time_taken
  })

  // Build combined data of answers joined with questions
  type CombinedItem = AnswerLog & { question: Question }
  const combinedData: CombinedItem[] = (sessionData?.answerLog || [])
    .map((answer) => {
      const question = sessionData?.questions.find((q) => q.id === answer.question_id)
      if (!question) return null
      return { ...answer, question }
    })
    .filter(Boolean) as CombinedItem[]

  // Determine quadrant for an item using tiered speed logic:
  const getQuadrantForItem = (item: CombinedItem): QuadrantKey | null => {
    const status = item.status as 'correct' | 'incorrect' | 'skipped'
    if (status === 'skipped') return null
    const { isFast } = isFastBasedOnDifficultyOrGeneric(
      item.time_taken,
      item.question.difficulty as any
    )
    if (status === 'correct') {
      return isFast ? 'strengths' : 'needsSpeed'
    } else if (status === 'incorrect') {
      return isFast ? 'carelessErrors' : 'weaknesses'
    }
    return null
  }

  // Compute matrix counts
  const matrixCounts = combinedData.reduce(
    (acc, item) => {
      const q = getQuadrantForItem(item)
      if (!q) return acc
      acc[q] += 1
      return acc
    },
    { strengths: 0, needsSpeed: 0, carelessErrors: 0, weaknesses: 0 }
  )

  // For Part 1: Show all questions without filtering
  const filteredIndices = useMemo(() => {
    if (!sessionData) return []
    return sessionData.questions.map((_, index) => index)
  }, [sessionData])

  // Ensure current index stays valid within filtered set
  useEffect(() => {
    if (!sessionData) return
    if (filteredIndices.length === 0) return
    if (!filteredIndices.includes(currentQuestionIndex)) {
      setCurrentQuestionIndex(filteredIndices[0])
    }
  }, [filteredIndices, sessionData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers: quadrant & advanced filters
  const handleQuadrantChange = (q: QuadrantKey | 'all') => {
    setSelectedQuadrant(q)
    // Jump to first match when changing quadrant
    if (filteredIndices.length > 0) {
      setCurrentQuestionIndex(filteredIndices[0])
    }
  }
  const handleStatusChange = (f: 'all' | 'correct' | 'incorrect' | 'skipped') => {
    setStatusFilter(f)
  }
  const handleDifficultyChange = (f: typeof difficultyFilter) => {
    setDifficultyFilter(f)
  }
  const handleBookmarkOnlyChange = (enabled: boolean) => {
    setBookmarkOnly(enabled)
  }
// Keyboard navigation: ArrowLeft/ArrowRight navigate within filtered set
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [filteredIndices, currentQuestionIndex]) // keep dependencies minimal

// Navigation through filtered set
const handlePrev = () => {
  const pos = filteredIndices.findIndex((i) => i === currentQuestionIndex)
  console.debug('[Solutions] Prev click', { currentQuestionIndex, pos, filteredIndices })
  if (pos > 0) {
    setCurrentQuestionIndex(filteredIndices[pos - 1])
  }
}
const handleNext = () => {
  const pos = filteredIndices.findIndex((i) => i === currentQuestionIndex)
  console.debug('[Solutions] Next click', { currentQuestionIndex, pos, filteredIndices })
  if (pos >= 0 && pos < filteredIndices.length - 1) {
    setCurrentQuestionIndex(filteredIndices[pos + 1])
  }
}

// SRS Feedback handlers
const handleSrsFeedbackComplete = () => {
  // Mark feedback as given for current question
  if (currentQuestion) {
    setSrsFeedbackGiven(prev => new Set(prev).add(currentQuestion.question_id))
  }
  // Automatically proceed to next question
  handleNext()
}

const handleSrsFeedbackError = (error: string) => {
  setSrsFeedbackError(error)
  // Clear error after 5 seconds
  setTimeout(() => setSrsFeedbackError(null), 5000)
}

// Helper: Check if current question needs SRS feedback
const needsSrsFeedback = () => {
  if (source !== 'srs-daily-review') return false
  if (!currentQuestion) return false
  if (!bookmarkedMap[currentQuestion.question_id]) return false // Only for bookmarked questions
  return !srsFeedbackGiven.has(currentQuestion.question_id)
}

// Get bookmark ID for current question
const getCurrentQuestionBookmarkId = () => {
  // We need to fetch this - for now return null and handle in the component
  // The component will need the bookmark ID to log the review
  return null // This will be handled by the SrsFeedbackControls component
}


  // Bookmark toggle - now opens creation modal for new bookmarks
  const handleToggleBookmark = async () => {
    if (!sessionData || !user) return
    const q = sessionData.questions[currentQuestionIndex]
    if (!q) return

    const key = String(q.question_id)
    const isCurrentlyBookmarked = !!bookmarkedMap[key]

    if (isCurrentlyBookmarked) {
      // Remove existing bookmark
      try {
        bookmarkInProgressRef.current = true
        const response = await fetch('/api/practice/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ questionId: q.question_id }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.error || 'Failed to remove bookmark')
        }
        setBookmarkedMap((m) => ({ ...m, [key]: false }))
      } catch (e) {
        console.error('Error removing bookmark:', e)
      } finally {
        bookmarkInProgressRef.current = false
      }
    } else {
      // Open bookmark creation modal for new bookmark
      setShowBookmarkModal(true)
    }
  }

  // Handle bookmark creation from modal
  const handleBookmarkSave = async (bookmarkData: {
    difficultyRating: number
    customTags: string[]
    personalNote: string
    isCustomReminderActive: boolean
    customNextReviewDate: string | null
  }) => {
    if (!sessionData || !user) return
    const q = sessionData.questions[currentQuestionIndex]
    if (!q) return

    try {
      bookmarkInProgressRef.current = true
      
      // Step 1: Create the bookmark
      const response = await fetch('/api/revision-hub/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          questionId: q.question_id,
          userId: user.id,
          difficultyRating: bookmarkData.difficultyRating,
          customTags: bookmarkData.customTags,
          personalNote: bookmarkData.personalNote
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bookmark')
      }
      
      const bookmarkId = result.data?.id
      
      // Step 2: If custom reminder is active, set it
      if (bookmarkData.isCustomReminderActive && bookmarkId) {
        const reminderResponse = await fetch(`/api/revision-hub/bookmarks/${bookmarkId}/custom-reminder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            isCustomReminderActive: bookmarkData.isCustomReminderActive,
            customNextReviewDate: bookmarkData.customNextReviewDate,
            userId: user.id
          }),
        })
        
        if (!reminderResponse.ok) {
          console.error('Failed to set custom reminder, but bookmark was created')
        }
      }
      
      // Update local state
      const key = String(q.question_id)
      setBookmarkedMap((m) => ({ ...m, [key]: true }))
    } catch (e) {
      console.error('Error creating bookmark:', e)
      throw e // Re-throw to let modal handle the error
    } finally {
      bookmarkInProgressRef.current = false
    }
  }

  // Inline report handler
  const handleReportError = () => {
    setShowReportModal(true)
  }
  
  const clearAllFilters = () => {
    setSelectedQuadrant('all')
    setStatusFilter('all')
    setDifficultyFilter('all')
    setBookmarkOnly(false)
  }

  // Handler for "View All Questions" button
  const handleViewAllQuestions = () => {
    setShowViewAllModal(true)
  }

  const totalQuestions = sessionData?.questions.length ?? 0
  const currentQuestion = sessionData?.questions[currentQuestionIndex]

  return (
    <div className="h-screen flex gap-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-visible">

      {/* Mobile Floating Action Button for Status Panel */}
      <button
        onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        aria-label="Toggle questions panel"
        title="Show Questions"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
      {/* Left column: main content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isRightPanelCollapsed ? 'lg:w-full lg:pr-0' : 'lg:w-3/4 xl:w-3/4 2xl:w-3/4'} h-full`}>


        {/* Main question view */}
        <div className="h-full">
          {sessionData && (
            filteredIndices.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No matching questions</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Adjust the filters or clear them to view questions.
                    </p>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <DynamicSolutionQuestionDisplayWindow
                  session={sessionData}
                  currentIndex={currentQuestionIndex}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isBookmarked={currentQuestion ? !!bookmarkedMap[String(currentQuestion.question_id)] : false}
                  onToggleBookmark={handleToggleBookmark}
                  onReportError={handleReportError}
                  canPrev={(filteredIndices.findIndex(i => i === currentQuestionIndex)) > 0}
                  canNext={(() => { const pos = filteredIndices.findIndex(i => i === currentQuestionIndex); return pos >= 0 && pos < filteredIndices.length - 1; })()}
                  filteredPosition={(() => { const pos = filteredIndices.findIndex(i => i === currentQuestionIndex); return pos >= 0 ? pos + 1 : 1; })()}
                  filteredTotal={filteredIndices.length}
                />
                
                {/* SRS Feedback Controls - Only for SRS Daily Review */}
                {source === 'srs-daily-review' && currentQuestion && bookmarkedMap[currentQuestion.question_id] && !srsFeedbackGiven.has(currentQuestion.question_id) && user && (
                  <div className="mt-6">
                    {srsFeedbackError && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg">
                        {srsFeedbackError}
                      </div>
                    )}
                    <DynamicSrsFeedbackControls
                      bookmarkId={currentQuestion.question_id} // Using question_id as a proxy - API will handle the lookup
                      userId={user.id}
                      onFeedbackComplete={handleSrsFeedbackComplete}
                      onError={handleSrsFeedbackError}
                    />
                  </div>
                )}
                
                {/* Post-Revision Feedback Loop: Bookmark History Component */}
                {source === 'revision' && currentQuestion && (
                  <DynamicBookmarkHistory questionId={currentQuestion.question_id} />
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Right column: Premium Status Panel */}
      {!isRightPanelCollapsed && (
        <div className="lg:block w-full lg:w-1/4 xl:w-1/4 2xl:w-1/4 h-screen p-0 lg:p-0 pb-0 fixed lg:relative top-0 right-0 z-40 lg:z-auto bg-white dark:bg-slate-800 lg:bg-transparent overflow-visible">
          <div className="bg-white dark:bg-slate-800 rounded-none border-none shadow-none h-full flex flex-col relative">
            {/* Mobile close button */}
            <button
              onClick={() => setIsRightPanelCollapsed(true)}
              className="lg:hidden absolute top-4 right-4 z-50 w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close panel"
              title="Close"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Desktop collapse control (external) - Apple-Inspired */}
            <motion.button
              onClick={() => setIsRightPanelCollapsed(true)}
              className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-30 group relative w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ 
                scale: 1.08,
                y: -1
              }}
              whileTap={{ scale: 0.96 }}
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {/* Subtle background glow */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              {/* Main icon container */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.svg 
                  className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 3
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </motion.svg>
              </div>

              {/* Subtle pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-500/20 opacity-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
              />

              {/* Premium indicator dot */}
              <motion.div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-sm"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
            {sessionData && (
              <DynamicReviewPremiumStatusPanel
                questions={sessionData.questions}
                reviewStates={reviewStates}
                currentIndex={currentQuestionIndex}
                onQuestionSelect={(index: number) => {
                  console.debug('[Solutions] Palette select', { index })
                  setCurrentQuestionIndex(index)
                }}
                bookmarkedMap={bookmarkedMap}
                hideInternalToggle={true}
                timePerQuestion={timePerQuestion}
              />
            )}
          </div>
        </div>
      )}

      {isRightPanelCollapsed && (
        <motion.button
          onClick={() => setIsRightPanelCollapsed(false)}
          className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 group relative w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
          whileHover={{ 
            scale: 1.08,
            y: -1
          }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Subtle background glow */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          {/* Main icon container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.svg 
              className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
              whileHover={{ 
                scale: 1.1,
                rotate: -3
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </motion.svg>
          </div>

          {/* Subtle pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-500/20 opacity-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut"
            }}
          />

          {/* Premium indicator dot */}
          <motion.div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-sm"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      )}
      {/* Report Error Modal */}
      {showReportModal && currentQuestion && (
        <DynamicReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestion.id}
          questionText={currentQuestion.question_text}
        />
      )}

      {/* View All Questions Modal */}
      {sessionData && (
        <DynamicViewAllQuestionsModal
          isOpen={showViewAllModal}
          onClose={() => setShowViewAllModal(false)}
          questions={sessionData.questions}
          reviewStates={reviewStates.map(r => r.status)}
          timePerQuestion={timePerQuestion}
          onQuestionSelect={(index: number) => {
            setCurrentQuestionIndex(index)
            setShowViewAllModal(false)
          }}
        />
      )}

      {/* Bookmark Creation Modal */}
      {sessionData && (
        <DynamicBookmarkCreationModal
          isOpen={showBookmarkModal}
          onClose={() => setShowBookmarkModal(false)}
          onSave={handleBookmarkSave}
          questionText={sessionData.questions[currentQuestionIndex]?.question_text || ''}
          questionId={sessionData.questions[currentQuestionIndex]?.question_id || ''}
        />
      )}

    </div>
  )
}