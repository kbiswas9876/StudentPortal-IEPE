'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
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

type BookSource = Database['public']['Tables']['book_sources']['Row']

// Extended type for books with statistics
type BookSourceWithStats = BookSource & {
  totalChapters?: number
  totalQuestions?: number
}
type TestResult = Database['public']['Tables']['test_results']['Row']

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<BookSourceWithStats[]>([])
  const [recentReports, setRecentReports] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [booksLoading, setBooksLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [currentSessionConfig, setCurrentSessionConfig] = useState<PracticeSessionConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'practice' | 'saved'>('practice')
  
  // Ref to track if data has been fetched to prevent duplicate calls
  const dataFetchedRef = useRef(false)
  
  // Reset loading state on component mount
  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && !dataFetchedRef.current) {
      console.log('Triggering fetchDashboardData for user:', user.id)
      dataFetchedRef.current = true
      fetchDashboardData()
      
      // Fallback timeout to ensure loading state doesn't get stuck
      const timeoutId = setTimeout(() => {
        console.log('Fallback: Setting loading to false after timeout')
        setLoading(false)
      }, 10000) // 10 second timeout
      
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
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
      
      // Add hideMetadata setting (always add it to make behavior explicit)
      queryParams.hideMetadata = config.hideMetadata ? 'true' : 'false'
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {booksLoading ? (
        <DashboardSkeletonLoader />
      ) : books.length === 0 ? (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No Books Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Books will appear here once they are added to the system.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full px-6 py-8 max-w-[1920px] mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'practice'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Practice Setup
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Saved Sessions
              </button>
            </div>
          </div>

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
            />
          ) : (
            <div className="w-full max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Saved Practice Sessions
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
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
