'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import PerformanceAnalysisDashboard from '@/components/PerformanceAnalysisDashboard'
import Leaderboard from '@/components/Leaderboard'
import AnalysisSkeletonLoader from '@/components/AnalysisSkeletonLoader'
import RevisionPerformanceInsights from '@/components/RevisionPerformanceInsights'
import { Tab } from '@headlessui/react'

type TestResult = Database['public']['Tables']['test_results']['Row']
type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface AnalysisData {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  peerAverages: Record<number, number>
  isMockTest?: boolean
  mockTestId?: number
}

export default function AnalysisReportPage() {
  const { resultId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Track session origin for conditional rendering
  const source = searchParams.get('source')
  
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'fast' | 'slow'>('all')
  const [matrixFilter, setMatrixFilter] = useState<'strengths' | 'needs_speed' | 'careless_errors' | 'weaknesses' | 'all'>('all')
  const [mockTestMetadata, setMockTestMetadata] = useState<any>(null)
  const [isResultsAvailable, setIsResultsAvailable] = useState(true)
  const [resultReleaseAt, setResultReleaseAt] = useState<string | null>(null)
  
  // Add ref to prevent duplicate fetching
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    // Anonymous viewing permitted for verification; login not required
    if (resultId && !dataFetchedRef.current) {
      dataFetchedRef.current = true
      fetchAnalysisData()
    }
  }, [authLoading, resultId])

  // Reset loading state on component mount
  useEffect(() => {
    setLoading(false)
  }, [])

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Analysis page loading timeout - resetting loading state')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  const fetchAnalysisData = async (isRetry = false) => {
    try {
      setLoading(true)
      if (isRetry) {
        setError(null)
        setRetryCount(prev => prev + 1)
      }
      console.log('Fetching analysis data for result ID:', resultId, isRetry ? `(retry ${retryCount + 1})` : '')

      const response = await fetch(`/api/analysis/${resultId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analysis data')
      }

      console.log('Analysis data fetched successfully:', result.data)
      
      // Check if this is a mock test
      const isMockTest = result.data.testResult.session_type === 'mock_test'
      const mockTestId = result.data.testResult.mock_test_id
      
      if (isMockTest && mockTestId) {
        // Fetch mock test metadata to check result policy
        await fetchMockTestMetadata(mockTestId)
      }
      
      setAnalysisData({
        ...result.data,
        isMockTest,
        mockTestId
      })
    } catch (error) {
      console.error('Error fetching analysis data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch analysis data')
      
      // Auto-retry for certain errors (like data not ready yet)
      if (retryCount < 3 && (error instanceof Error && error.message.includes('not found'))) {
        console.log('Auto-retrying in 2 seconds...')
        setTimeout(() => {
          fetchAnalysisData(true)
        }, 2000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMockTestMetadata = async (mockTestId: number) => {
    try {
      console.log('Fetching mock test metadata for test ID:', mockTestId)
      
      const response = await fetch(`/api/mock-tests/${mockTestId}/metadata`)
      const result = await response.json()

      if (response.ok) {
        console.log('Mock test metadata fetched successfully:', result.data)
        setMockTestMetadata(result.data.test)
        setIsResultsAvailable(result.data.isResultsAvailable)
        setResultReleaseAt(result.data.resultReleaseAt)
      }
    } catch (error) {
      console.error('Error fetching mock test metadata:', error)
      // Don't fail the entire page if metadata fetch fails
    }
  }

  const handleBookmark = async (questionId: string) => {
    if (!user) return
  
    try {
      const response = await fetch('/api/practice/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questionId
        })
      })

      if (response.ok) {
        console.log('Question bookmarked successfully')
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error bookmarking question:', error)
    }
  }

  const handleReportError = async (questionId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          reported_by_user_id: user.id,
          report_description: 'Error reported from analysis page'
        })
      })

      if (response.ok) {
        console.log('Error reported successfully')
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error reporting question:', error)
    }
  }

  const getFilteredQuestions = () => {
    if (!analysisData) return []

    // If no answer log data, return empty array
    if (!analysisData?.answerLog || analysisData?.answerLog.length === 0) {
      return []
    }

    const combinedData = analysisData?.answerLog.map(answer => {
      const question = analysisData?.questions.find(q => q.id === answer.question_id)
      return {
        ...answer,
        question
      }
    }).filter(item => item.question) as any // Only include items with valid questions

    let filteredData = combinedData

    // Apply status filter
    switch (filter) {
      case 'correct':
        filteredData = filteredData.filter((item: any) => item.status === 'correct')
        break
      case 'incorrect':
        filteredData = filteredData.filter((item: any) => item.status === 'incorrect')
        break
      case 'skipped':
        filteredData = filteredData.filter((item: any) => item.status === 'skipped')
        break
      default:
        // 'all' - no status filtering
        break
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      filteredData = filteredData.filter((item: any) => {
        const peerAverage = analysisData?.peerAverages[item.question_id]
        if (!peerAverage) return true // Include if no peer data

        const timeRatio = item.time_taken / peerAverage
        if (timeFilter === 'fast') {
          return timeRatio <= 0.8 // 20% faster than peer average
        } else if (timeFilter === 'slow') {
          return timeRatio >= 1.2 // 20% slower than peer average
        }
        return true
      })
    }

    // Apply matrix filter
    if (matrixFilter !== 'all') {
      filteredData = filteredData.filter((item: any) => {
        const peerAverage = analysisData?.peerAverages[item.question_id]
        if (!peerAverage) return true // Include if no peer data

        const timeRatio = item.time_taken / peerAverage
        const isFast = timeRatio <= 0.8
        const isSlow = timeRatio >= 1.2
        const isCorrect = item.status === 'correct'
        const isIncorrect = item.status === 'incorrect'

        switch (matrixFilter) {
          case 'strengths':
            return isCorrect && isFast
          case 'needs_speed':
            return isCorrect && isSlow
          case 'careless_errors':
            return isIncorrect && isFast
          case 'weaknesses':
            return isIncorrect && isSlow
          default:
            return true
        }
      })
    }

    return filteredData
  }

  if (authLoading || loading) {
    return <AnalysisSkeletonLoader retryCount={retryCount} showRetryMessage={retryCount > 0} isMockTest={analysisData?.isMockTest} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Analysis Report Error</h2>
            <p>{error}</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => fetchAnalysisData(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry Loading
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!analysisData && !loading) {
    return <AnalysisSkeletonLoader retryCount={retryCount} showRetryMessage={true} isMockTest={false} />
  }

  const filteredQuestions = getFilteredQuestions()

  // Show result declaration message if results are not yet available
  if (analysisData?.isMockTest && !isResultsAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">⏰</div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Results Will Be Declared Soon
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your test has been submitted successfully. Results and leaderboard will be available at:
              </p>
              {resultReleaseAt && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {new Date(resultReleaseAt).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/mock-tests')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Return to Mock Tests
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-16">

        {/* Post-Revision Feedback Loop: Revision Performance Insights */}
        {source === 'revision' && analysisData && (
          <RevisionPerformanceInsights analysisData={analysisData} />
        )}

        {/* Tabbed Interface for Mock Tests */}
        {analysisData?.isMockTest ? (
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-8">
              {[
                { key: 'analysis', label: 'My Analysis', icon: '📊' },
                { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
              ].map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                      selected
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {analysisData && (
                    <PerformanceAnalysisDashboard
                      sessionResult={{
                        testResult: analysisData.testResult,
                        answerLog: analysisData.answerLog,
                        questions: analysisData.questions
                      }}
                      onNavigateToSolutions={() => {
                        const source = searchParams.get('source')
                        let url = `/analysis/${resultId}/solutions`
                        if (source === 'revision') {
                          url += `?source=revision`
                        }
                        router.push(url)
                      }}
                    />
                  )}
                </motion.div>
              </Tab.Panel>

              <Tab.Panel>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Leaderboard 
                    testId={analysisData?.mockTestId!} 
                    currentUserId={user?.id || ''} 
                  />
                </motion.div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        ) : (
          // Regular practice session analysis (no tabs)
          <>
            {analysisData && (
              <PerformanceAnalysisDashboard
                sessionResult={{
                  testResult: analysisData.testResult,
                  answerLog: analysisData.answerLog,
                  questions: analysisData.questions
                }}
                onNavigateToSolutions={() => {
                  const source = searchParams.get('source')
                  let url = `/analysis/${resultId}/solutions`
                  if (source === 'revision') {
                    url += `?source=revision`
                  }
                  router.push(url)
                }}
              />
            )}
          </>
        )}

      </div>
    </div>
  )
}
