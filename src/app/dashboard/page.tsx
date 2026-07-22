'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useSidebar } from '@/lib/sidebar-context'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/database'
import { PracticeSessionConfig, QuestionSelection } from '@/types/practice'
import { debounce } from '@/lib/development-utils'
import PremiumPracticeSetup from '@/components/PremiumPracticeSetup'
import SavedSessionsManager from '@/components/SavedSessionsManager'
import AccessHub from '@/components/AccessHub'
import SupabaseTest from '@/components/SupabaseTest'
import DashboardSkeletonLoader from '@/components/DashboardSkeletonLoader'
import { BookAccordionSkeleton, RecentReportsSkeleton } from '@/components/SkeletonLoader'
import { useDashboard } from '@/lib/dashboard-context'
import { getCachedDashboardData, cacheDashboardData } from '@/utils/dashboardCache'

type BookSource = Database['public']['Tables']['book_sources']['Row']

// Extended type for books with statistics
type BookSourceWithStats = BookSource & {
  totalChapters?: number
  totalQuestions?: number
}
type TestResult = Database['public']['Tables']['test_results']['Row']

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { isCollapsed: sidebarCollapsed } = useSidebar()
  const { activeTab, setActiveTab } = useDashboard()
  const router = useRouter()
  const [books, setBooks] = useState<BookSourceWithStats[]>([])
  const [recentReports, setRecentReports] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [booksLoading, setBooksLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [currentSessionConfig, setCurrentSessionConfig] = useState<PracticeSessionConfig | null>(null)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false)
  
  // Ref to track if data has been fetched to prevent duplicate calls
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && !dataFetchedRef.current) {
      console.log('Triggering hybrid loading for user:', user.id)
      dataFetchedRef.current = true
      
      // HYBRID LOADING STRATEGY
      // Step 1: Try to load from cache instantly
      const cachedData = getCachedDashboardData()
      
      if (cachedData && cachedData.books.length > 0) {
        console.log('📦 Loading from cache instantly')
        setBooks(cachedData.books)
        setIsLoadingFromCache(true)
        setLoading(false)
        setBooksLoading(false)
        
        // Step 2: Fetch fresh data in background
        console.log('🔄 Fetching fresh data in background...')
        fetchDashboardDataInBackground()
      } else {
        // No cache: Show loading and fetch
        console.log('⏳ No cache found, fetching data...')
        setLoading(true)
        fetchDashboardData()
      }
      
      // Fallback timeout
      const timeoutId = setTimeout(() => {
        console.log('Fallback: Setting loading to false after timeout')
        setLoading(false)
      }, 10000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      console.log('Starting fetchDashboardData...')
      setLoading(true)
      
      // Parallel data fetching
      const [booksResult, reportsResult] = await Promise.all([
        fetchBooks(),
        fetchRecentReports()
      ])

      console.log('Dashboard data fetched:', { books: booksResult.length, reports: reportsResult.length })
      setBooks(booksResult)
      setRecentReports(reportsResult)
      
      // Cache the books data
      if (booksResult.length > 0) {
        cacheDashboardData(booksResult)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
      setIsLoadingFromCache(false)
    }
  }

  const fetchDashboardDataInBackground = async () => {
    try {
      // Fetch fresh data without showing loading state
      const [booksResult, reportsResult] = await Promise.all([
        fetchBooks(),
        fetchRecentReports()
      ])

      console.log('✅ Background fetch complete, updating data smoothly')
      
      // Smooth update: only update if data changed
      setBooks(booksResult)
      setRecentReports(reportsResult)
      
      // Update cache with fresh data
      if (booksResult.length > 0) {
        cacheDashboardData(booksResult)
      }
      
      setIsLoadingFromCache(false)
    } catch (error) {
      console.error('Error in background fetch:', error)
      setIsLoadingFromCache(false)
    }
  }

  const fetchBooks = async (): Promise<BookSourceWithStats[]> => {
    try {
      setBooksLoading(true)
      console.log('Fetching books with statistics...')
      
      // Request books with statistics included
      const response = await fetch('/api/books?includeStats=true')
      const result = await response.json()

      console.log('Books API result:', result)

      if (!response.ok) {
        console.error('Books API error:', result.error)
        return []
      }
      
      console.log('Books with statistics fetched successfully:', result.data)
      return result.data || []
    } catch (error) {
      console.error('Error fetching books:', error)
      return []
    } finally {
      setBooksLoading(false)
    }
  }

  const fetchRecentReports = async (): Promise<TestResult[]> => {
    // Since test_results table doesn't exist, return empty array
    setReportsLoading(false)
    return []
  }

  const handleSessionStart = async (config: PracticeSessionConfig) => {
    console.log('Starting practice session with config:', config)
    setCurrentSessionConfig(config)
    setSessionLoading(true)
    
    const startTime = Date.now()
    
    try {
      // Fetch question IDs based on the configuration
      const questionIds = await fetchQuestionIds(config)
      const fetchTime = Date.now() - startTime
      console.log(`Fetched question IDs in ${fetchTime}ms:`, questionIds)
      
      if (questionIds.length === 0) {
        alert('No questions found for the selected configuration. Please try different chapters or settings.')
        setSessionLoading(false)
        return
      }
      
      // For now, use shuffle as default - the premium setup will handle this
      const sequencedQuestionIds = [...questionIds].sort(() => Math.random() - 0.5)
      console.log('Sequenced question IDs:', sequencedQuestionIds)
      
      // Navigate to practice session with complete payload
      const queryParams: Record<string, string> = {
        questions: sequencedQuestionIds.join(','),
        testMode: config.testMode || 'practice',
        fresh: 'true' // Signal that this is a fresh start
      }
      
      // Add time limit if in timed mode
      if (config.testMode === 'timed' && config.timeLimitInMinutes) {
        queryParams.timeLimit = config.timeLimitInMinutes.toString()
      }
      
      // Add hideMetadata setting
      if (config.hideMetadata) {
        queryParams.hideMetadata = 'true'
      }
      
      const queryString = new URLSearchParams(queryParams).toString()
      
      const totalTime = Date.now() - startTime
      console.log(`Total session startup time: ${totalTime}ms`)
      
      router.push(`/practice?${queryString}`)
    } catch (error) {
      console.error('Error starting practice session:', error)
      setSessionLoading(false)
    }
  }

  const handleFooterSessionStart = async () => {
    console.log('Footer session start clicked')
    console.log('Current session config:', currentSessionConfig)
    console.log('Total questions:', totalQuestions)
    
    if (!currentSessionConfig) {
      console.log('No session config available')
      alert('Please select chapters and configure your practice session first.')
      return
    }
    
    await handleSessionStart(currentSessionConfig)
  }

  const handleResumeSession = (sessionState: any) => {
    console.log('Resuming saved session:', sessionState)
    
    // Navigate to practice page with the saved session state
    const queryParams = new URLSearchParams({
      savedSession: 'true',
      sessionData: JSON.stringify(sessionState)
    })
    
    router.push(`/practice?${queryParams.toString()}`)
  }


  const fetchQuestionIds = async (config: PracticeSessionConfig): Promise<string[]> => {
    const allQuestionIds: string[] = []
    
    try {
      // Create array of API calls for parallel execution
      const apiCalls = Object.entries(config.chapters)
        .filter(([_, chapterConfig]) => chapterConfig.selected)
        .map(([chapterName, chapterConfig]) => 
          fetch('/api/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookCode: config.bookCode,
              chapterName,
              mode: chapterConfig.mode,
              values: chapterConfig.values
            })
          }).then(async (response) => {
            const result = await response.json()
            if (!response.ok) {
              console.error(`Error fetching questions for ${chapterName}:`, result.error)
              return []
            }
            return result.data || []
          }).catch((error) => {
            console.error(`Error fetching questions for ${chapterName}:`, error)
            return []
          })
        )

      // Execute all API calls in parallel
      const results = await Promise.all(apiCalls)
      
      // Flatten all results into single array
      results.forEach(questionIds => {
        allQuestionIds.push(...questionIds)
      })
      
      return allQuestionIds
    } catch (error) {
      console.error('Error in fetchQuestionIds:', error)
      return []
    }
  }

  console.log('Dashboard render state:', { authLoading, loading, user: !!user, books: books.length })

  if (authLoading || loading) {
    return <DashboardSkeletonLoader />
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {booksLoading ? (
        <DashboardSkeletonLoader />
      ) : books.length === 0 ? (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-warm-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-charcoal-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-serif font-semibold text-charcoal mb-2">
              No Books Available
            </h3>
            <p className="text-charcoal-mid">
              Books will appear here once they are added to the system.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full">


          {/* Tab Content */}
          {activeTab === 'practice' ? (
            <PremiumPracticeSetup
              books={books}
              onSessionStart={handleSessionStart}
              onTotalQuestionsChange={(total) => {
                console.log('Dashboard: Total questions changed to:', total)
                setTotalQuestions(total)
              }}
              onSessionConfigChange={(config) => {
                console.log('Dashboard: Session config changed:', config)
                setCurrentSessionConfig(config)
              }}
              sessionLoading={sessionLoading}
              sidebarCollapsed={sidebarCollapsed}
            />
          ) : (
            <div className="w-full pb-24">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-semibold text-charcoal mb-2">
                  Saved Practice Sessions
                </h2>
                <p className="text-charcoal-mid">
                  Resume your saved practice sessions or manage them here.
                </p>
              </div>
              <SavedSessionsManager onResumeSession={handleResumeSession} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
