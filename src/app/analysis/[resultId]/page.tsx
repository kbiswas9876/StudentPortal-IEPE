'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import PerformanceDashboard from '@/components/PerformanceDashboard'
import FilterToolbar from '@/components/FilterToolbar'
import QuestionBreakdown from '@/components/QuestionBreakdown'

type TestResult = Database['public']['Tables']['test_results']['Row']
type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface AnalysisData {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
}

export default function AnalysisReportPage() {
  const { resultId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (resultId) {
      fetchAnalysisData()
    }
  }, [user, authLoading, resultId, router])

  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      console.log('Fetching analysis data for result ID:', resultId)

      const response = await fetch(`/api/analysis/${resultId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analysis data')
      }

      console.log('Analysis data fetched successfully:', result.data)
      setAnalysisData(result.data)
    } catch (error) {
      console.error('Error fetching analysis data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch analysis data')
    } finally {
      setLoading(false)
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
          question_id: questionId,
          user_id: user.id
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

  const getFilteredQuestions = () => {
    if (!analysisData) return []

    // If no answer log data, return empty array
    if (!analysisData.answerLog || analysisData.answerLog.length === 0) {
      return []
    }

    const combinedData = analysisData.answerLog.map(answer => {
      const question = analysisData.questions.find(q => q.id === answer.question_id)
      return {
        ...answer,
        question
      }
    }).filter(item => item.question) // Only include items with valid questions

    switch (filter) {
      case 'correct':
        return combinedData.filter(item => item.status === 'correct')
      case 'incorrect':
        return combinedData.filter(item => item.status === 'incorrect')
      case 'skipped':
        return combinedData.filter(item => item.status === 'skipped')
      default:
        return combinedData
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading analysis report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Analysis Report Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">No Analysis Data Found</h2>
            <p>Unable to load the analysis report for this session.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const filteredQuestions = getFilteredQuestions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Performance Dashboard */}
        <PerformanceDashboard testResult={analysisData.testResult} />

        {/* Interactive Filtering - only show if we have answer log data */}
        {analysisData.answerLog && analysisData.answerLog.length > 0 && (
          <FilterToolbar filter={filter} onFilterChange={setFilter} />
        )}

        {/* Question Breakdown */}
        {analysisData.answerLog && analysisData.answerLog.length > 0 ? (
          <QuestionBreakdown 
            questions={filteredQuestions}
            onBookmark={handleBookmark}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Detailed Question Analysis Not Available</h3>
              <p className="text-sm">
                The overall performance summary is shown above, but detailed question-by-question analysis is not available for this session.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
