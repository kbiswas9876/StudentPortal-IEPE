'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NewPerformanceAnalysisDashboard from '@/components/NewPerformanceAnalysisDashboard'
import { SessionResult } from '@/components/PerformanceAnalysisDashboard'
import NewPerformanceAnalysisSkeletonLoader from '@/components/NewPerformanceAnalysisSkeletonLoader'
import { Database } from '@/types/database'
import { 
  getCachedStaticData, 
  cacheStaticData, 
  extractStaticData, 
  extractDynamicData,
  StaticAnalysisData,
  DynamicAnalysisData 
} from '@/utils/analysisCache'

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
  const [isNavigating, setIsNavigating] = useState(false)
  const [solutionsDataPrefetched, setSolutionsDataPrefetched] = useState(false)
  
  // Hybrid loading states
  const [staticDataLoaded, setStaticDataLoaded] = useState(false)
  const [dynamicDataLoading, setDynamicDataLoading] = useState(false)
  const [dynamicData, setDynamicData] = useState<DynamicAnalysisData | null>(null)

  useEffect(() => {
    if (resultId) {
      loadAnalysisData()
    }
  }, [resultId])

  /**
   * Hybrid loading strategy:
   * 1. Try to load static data from cache instantly
   * 2. Fetch dynamic data in background
   * 3. If no cache, fetch everything normally
   */
  const loadAnalysisData = async () => {
    const resultIdStr = String(resultId)
    
    // Step 1: Try to load cached static data instantly
    const cachedStatic = getCachedStaticData(resultIdStr)
    
    if (cachedStatic) {
      console.log('⚡ Loading from cache for instant display')
      
      // Build session result from cached static data
      const cachedSessionResult: SessionResult = {
        testResult: {
          ...cachedStatic.testResult,
          results: {
            marks_obtained: cachedStatic.staticMetrics.score,
            total_marks: cachedStatic.staticMetrics.totalMarks,
            percentile: 0, // Will be updated with dynamic data
            rank: 0, // Will be updated with dynamic data
            total_test_takers: 0 // Will be updated with dynamic data
          },
          accuracy: cachedStatic.staticMetrics.accuracy
        } as any,
        answerLog: cachedStatic.answerLog,
        questions: cachedStatic.questions,
        topperResult: undefined, // Will be updated with dynamic data
        leaderboard: undefined
      }
      
      setSessionResult(cachedSessionResult)
      setStaticDataLoaded(true)
      setLoading(false)
      
      // Step 2: Fetch dynamic data in background
      fetchDynamicData(resultIdStr)
    } else {
      // No cache available, fetch everything normally
      console.log('📡 No cache found, fetching all data')
      await fetchAllData(resultIdStr)
    }
  }

  /**
   * Fetch all data (static + dynamic) when no cache is available
   */
  const fetchAllData = async (resultIdStr: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const analysisResponse = await fetch(`/api/analysis/${resultIdStr}`)
      const analysisResult = await analysisResponse.json()
      
      if (!analysisResponse.ok) {
        throw new Error(analysisResult.error || 'Failed to fetch analysis data')
      }
      
      const fetchedData: FetchedSessionData = analysisResult.data
      const finalSessionResult: SessionResult = {
        ...fetchedData,
        topperResult: analysisResult.data.topperResult || undefined,
        leaderboard: undefined
      }

      setSessionResult(finalSessionResult)
      setStaticDataLoaded(true)
      
      // Cache the static data for future visits
      const staticData = extractStaticData(analysisResult.data)
      cacheStaticData(resultIdStr, staticData)
      
      // Store dynamic data
      const dynamicData = extractDynamicData(analysisResult.data)
      setDynamicData(dynamicData)
      
      // Pre-fetch solutions data in the background
      prefetchSolutionsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch only dynamic data (rank, percentile, topper comparison)
   */
  const fetchDynamicData = async (resultIdStr: string) => {
    setDynamicDataLoading(true)
    
    try {
      console.log('🔄 Fetching dynamic data in background...')
      const analysisResponse = await fetch(`/api/analysis/${resultIdStr}`)
      const analysisResult = await analysisResponse.json()
      
      if (analysisResponse.ok) {
        const dynamicData = extractDynamicData(analysisResult.data)
        setDynamicData(dynamicData)
        
        // Update session result with dynamic data
        setSessionResult(prev => {
          if (!prev) return prev
          
          return {
            ...prev,
            testResult: {
              ...prev.testResult,
              results: {
                ...(prev.testResult.results ?? {}),
                rank: dynamicData.rank,
                percentile: dynamicData.percentile,
                total_test_takers: dynamicData.totalTestTakers
              }
            },
            topperResult: dynamicData.topperResult
          }
        })
        
        console.log('✅ Dynamic data updated')
        
        // Pre-fetch solutions data
        prefetchSolutionsData()
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic data:', err)
      // Non-critical error, static data is already displayed
    } finally {
      setDynamicDataLoading(false)
    }
  }

  /**
   * Pre-fetch solutions data for instant loading when user clicks "View Solutions"
   */
  const prefetchSolutionsData = async () => {
    try {
      const response = await fetch(`/api/analysis/${resultId}`)
      if (response.ok) {
        setSolutionsDataPrefetched(true)
        console.log('✅ Solutions data pre-fetched successfully')
      }
    } catch (err) {
      console.warn('Failed to pre-fetch solutions data:', err)
    }
  }

  const handleNavigateToSolutions = () => {
    setIsNavigating(true)
    router.push(`/analysis/${resultId}/solutions`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NewPerformanceAnalysisSkeletonLoader />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-center p-4">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Failed to Load Analysis</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => loadAnalysisData()}
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-indigo-400/50"
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
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Data Available</h2>
            <p className="text-slate-600 dark:text-slate-400">No analysis data found for this result.</p>
          </div>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewPerformanceAnalysisDashboard
          sessionResult={sessionResult}
          onNavigateToSolutions={handleNavigateToSolutions}
          isNavigating={isNavigating}
          dynamicDataLoading={dynamicDataLoading}
        />
      </div>
    </div>
  )
}