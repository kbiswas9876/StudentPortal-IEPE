'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
 // AnalysisSkeletonLoader dynamically imported below to avoid server bundling framer-motion
import nextDynamic from 'next/dynamic'
// Dynamically import client-only components to avoid server bundling framer-motion
const DynamicPremiumStatusPanel = nextDynamic(() => import('@/components/PremiumStatusPanel'), { ssr: false })
const DynamicMainQuestionView = nextDynamic(() => import('@/components/MainQuestionView'), { ssr: false })
const DynamicAnalysisSkeletonLoader = nextDynamic(() => import('@/components/AnalysisSkeletonLoader'), { ssr: false })
const DynamicZenModeBackButton = nextDynamic(() => import('@/components/ZenModeBackButton'), { ssr: false })
const DynamicReportErrorModal = nextDynamic(() => import('@/components/ReportErrorModal'), { ssr: false })

// Local type alias to avoid importing from StrategicPerformanceMatrix which uses framer-motion
type QuadrantKey = 'strengths' | 'needsSpeed' | 'carelessErrors' | 'weaknesses'
import { isFastBasedOnDifficultyOrGeneric } from '@/lib/config/time-benchmarks'
import type { QuestionStatus } from '@/components/PracticeInterface'
 // ZenModeBackButton dynamically imported above
 // ReportErrorModal dynamically imported above

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

  // Bookmark map keyed by questions.question_id (string)
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({})

  // Prevent duplicate fetches during re-renders
  const dataFetchedRef = useRef(false)
  
  // Prevent concurrent bookmark requests (race condition fix)
  const bookmarkInProgressRef = useRef(false)

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


  // Inline bookmark toggle (optimistic) with race condition protection
  const handleToggleBookmark = async () => {
    if (!sessionData || !user) return
    const q = sessionData.questions[currentQuestionIndex]
    if (!q) return

    // Prevent concurrent requests (race condition fix)
    if (bookmarkInProgressRef.current) {
      console.debug('Bookmark request already in progress, ignoring duplicate click')
      return
    }

    const key = String(q.question_id)
    const prev = !!bookmarkedMap[key]
    const optimistic = !prev
    setBookmarkedMap((m) => ({ ...m, [key]: optimistic }))

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
        throw new Error(result.error || 'Failed to update bookmark')
      }
      if (typeof result.bookmarked === 'boolean' && result.bookmarked !== optimistic) {
        setBookmarkedMap((m) => ({ ...m, [key]: result.bookmarked }))
      }
    } catch (e) {
      console.error('Error bookmarking:', e)
      // revert
      setBookmarkedMap((m) => ({ ...m, [key]: prev }))
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

  // Handler for "View All Questions" button (stub for Part 1)
  const handleViewAllQuestions = () => {
    console.log('View All Questions clicked - functionality to be implemented in later parts')
    // TODO: This will show a modal or expanded view in future parts
  }

  const totalQuestions = sessionData?.questions.length ?? 0
  const currentQuestion = sessionData?.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <DynamicZenModeBackButton
          onClick={() => router.push(`/analysis/${encodeURIComponent(String(resultId))}`)}
          className="md:left-8 md:top-6"
        />
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detailed Solution Review</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Session ID: {String(resultId)} • Questions: {totalQuestions} • Answers: {sessionData?.answerLog.length ?? 0}
          </div>
        </header>

        {/* Unified two-column layout: main left, palette right */}
        <div className="flex">
          {/* Left column */}
          <div className="flex-1 lg:w-3/4 pt-28 lg:pt-12">
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
                <DynamicMainQuestionView
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
              )
            )}
          </div>

          {/* Right sidebar (desktop only) */}
          <div className="hidden lg:block fixed right-0 top-0 h-screen w-1/4 p-0">
            {sessionData && (
              <DynamicPremiumStatusPanel
                questions={sessionData.questions}
                sessionStates={premiumSessionStates}
                currentIndex={currentQuestionIndex}
                onQuestionSelect={(index: number) => {
                  console.debug('[Solutions] Palette select', { index })
                  setCurrentQuestionIndex(index)
                }}
                onSubmitTest={handleViewAllQuestions}
                isSubmitting={false}
                submitLabel="View All Questions"
              />
            )}
          </div>
        </div>

        {/* Report Error Modal */}
        {showReportModal && currentQuestion && (
          <DynamicReportErrorModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            questionId={currentQuestion.id}
            questionText={currentQuestion.question_text}
          />
        )}
      </div>
    </div>
  )
}