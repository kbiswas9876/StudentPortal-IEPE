'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PerformanceAnalysisDashboard, { SessionResult } from '@/components/PerformanceAnalysisDashboard'
import AnalysisSkeletonLoader from '@/components/AnalysisSkeletonLoader'
import { Database } from '@/types/database'

// The API now returns a `results` object directly on testResult,
// so we can expect the fetched data to conform to our SessionResult structure.
type FetchedSessionData = Omit<SessionResult, 'topperResult' | 'leaderboard'> & {
    testResult: {
        results: {
            marks_obtained: number;
            total_marks: number;
            percentile: number;
            rank: number;
            total_test_takers: number;
        }
    } & Database['public']['Tables']['test_results']['Row']
}


export default function AnalysisReportPage() {
  const router = useRouter()
  const { resultId } = useParams()

  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resultId) {
      fetchData()
    }
  }, [resultId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const analysisResponse = await fetch(`/api/analysis/${resultId}`)
      const analysisResult = await analysisResponse.json()
      if (!analysisResponse.ok) {
        throw new Error(analysisResult.error || 'Failed to fetch analysis data')
      }
      
      // The API now provides the correct structure, so no major transformation is needed.
      // We just need to ensure the object conforms to the SessionResult type.
      const fetchedData: FetchedSessionData = analysisResult.data
      const finalSessionResult: SessionResult = {
          ...fetchedData,
          topperResult: undefined, // This would be fetched if needed
          leaderboard: undefined, // This is fetched by the Leaderboard component itself
      }

      setSessionResult(finalSessionResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToSolutions = () => {
    router.push(`/analysis/${resultId}/solutions`)
  }

  if (loading) {
    return <AnalysisSkeletonLoader />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load analysis</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!sessionResult) {
    return (
       <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-center p-4">
          <p className="text-slate-600 dark:text-slate-400">No analysis data found for this result.</p>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PerformanceAnalysisDashboard
          sessionResult={sessionResult}
          onNavigateToSolutions={handleNavigateToSolutions}
        />
      </div>
    </div>
  )
}