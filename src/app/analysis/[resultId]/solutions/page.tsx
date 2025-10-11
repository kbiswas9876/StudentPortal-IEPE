'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
 // AnalysisSkeletonLoader dynamically imported below to avoid server bundling framer-motion
import nextDynamic from 'next/dynamic'
// Dynamically import client-only components to avoid server bundling framer-motion
const DynamicQuestionPalette = nextDynamic(() => import('@/components/QuestionPalette'), { ssr: false })
const DynamicMainQuestionView = nextDynamic(() => import('@/components/MainQuestionView'), { ssr: false })
const DynamicAnalysisSkeletonLoader = nextDynamic(() => import('@/components/AnalysisSkeletonLoader'), { ssr: false })
const DynamicZenModeBackButton = nextDynamic(() => import('@/components/ZenModeBackButton'), { ssr: false })
const DynamicReportErrorModal = nextDynamic(() => import('@/components/ReportErrorModal'), { ssr: false })

// Local type alias to avoid importing from StrategicPerformanceMatrix which uses framer-motion
type QuadrantKey = 'strengths' | 'needsSpeed' | 'carelessErrors' | 'weaknesses'
import { isFastBasedOnDifficultyOrGeneric } from '@/lib/config/time-benchmarks'
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

  // Compute filtered indices for navigation & palette display
  const filteredIndices = useMemo(() => {
    if (!sessionData) return []
    return sessionData.questions
      .map((question, index) => {
        // status filter via reviewStates
        const review = reviewStates[index]?.status ?? 'skipped'
        if (statusFilter !== 'all' && review !== statusFilter) return null

        // difficulty filter
        if (difficultyFilter !== 'all' && question.difficulty !== difficultyFilter) return null

        // quadrant filter
        const ans = sessionData.answerLog.find((a) => a.question_id === question.id)
        const item = ans ? ({ ...(ans as AnswerLog), question } as CombinedItem) : null
        const quadrant = item ? getQuadrantForItem(item) : null
        if (selectedQuadrant !== 'all' && quadrant !== selectedQuadrant) return null

        // bookmark filter (map keyed by question_id)
        if (bookmarkOnly) {
          const isBk = !!bookmarkedMap[String(question.question_id)]
          if (!isBk) return null
        }

        return index
      })
      .filter((i): i is number => typeof i === 'number')
  }, [sessionData, reviewStates, statusFilter, difficultyFilter, selectedQuadrant, bookmarkOnly, bookmarkedMap])

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


  // Inline bookmark toggle (optimistic)
  const handleToggleBookmark = async () => {
    if (!sessionData || !user) return
    const q = sessionData.questions[currentQuestionIndex]
    if (!q) return

    const key = String(q.question_id)
    const prev = !!bookmarkedMap[key]
    const optimistic = !prev
    setBookmarkedMap((m) => ({ ...m, [key]: optimistic }))

    try {
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
        <div className="flex gap-6">
          {/* Left column */}
          <div className="flex-1 lg:w-3/4">
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
          <div className="hidden lg:block w-1/4">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              {sessionData && (
                <DynamicQuestionPalette
                  questions={sessionData.questions}
                  reviewStates={reviewStates}
                  currentIndex={currentQuestionIndex}
                  onQuestionSelect={(index: number) => { console.debug('[Solutions] Palette select', { index }); setCurrentQuestionIndex(index) }}
                  // Enhanced palette controls
                  showFilters={true}
                  matrixCounts={matrixCounts}
                  onQuadrantChange={handleQuadrantChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusChange}
                  difficultyFilter={difficultyFilter}
                  onDifficultyFilterChange={handleDifficultyChange}
                  bookmarkOnly={bookmarkOnly}
                  onBookmarkOnlyChange={handleBookmarkOnlyChange}
                  filteredIndices={filteredIndices}
                  bookmarkedMap={bookmarkedMap}
                />
              )}
            </div>
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