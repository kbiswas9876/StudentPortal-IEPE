'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tab } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, ClockIcon, PlayIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabaseClient'
import TestCard from '@/components/tests/TestCard'


type Test = {
  id: number
  name: string
  description: string | null
  start_time: string
  end_time: string | null
  status: 'scheduled' | 'live' | 'completed'
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  total_questions: number
}

type UserAttempt = {
  mock_test_id: number
  score_percentage: number
  id: number
  total_correct: number
  total_incorrect: number
  total_questions: number
  submitted_at: string
  results?: {
    marks_obtained: number
    total_marks: number
    percentile: number
    rank: number
    total_test_takers: number
  }
}

interface MockTestData {
  tests: Test[]
  userAttempts: UserAttempt[]
}

export default function MockTestHubPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mockTestData, setMockTestData] = useState<MockTestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date')
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0)

  // State persistence - load from localStorage on mount
  useEffect(() => {
    const savedSearchQuery = localStorage.getItem('mockTestSearchQuery')
    const savedSortBy = localStorage.getItem('mockTestSortBy')
    const savedMockTestData = localStorage.getItem('mockTestData')
    
    if (savedSearchQuery) setSearchQuery(savedSearchQuery)
    if (savedSortBy && ['date', 'score', 'name'].includes(savedSortBy)) {
      setSortBy(savedSortBy as 'date' | 'score' | 'name')
    }
    if (savedMockTestData) {
      try {
        const parsedData = JSON.parse(savedMockTestData)
        setMockTestData(parsedData)
        setLoading(false) // Don't show loading if we have cached data
      } catch (error) {
        console.warn('Failed to parse cached mock test data:', error)
      }
    }
  }, [])

  // Save search and sort preferences to localStorage
  useEffect(() => {
    localStorage.setItem('mockTestSearchQuery', searchQuery)
  }, [searchQuery])

  useEffect(() => {
    localStorage.setItem('mockTestSortBy', sortBy)
  }, [sortBy])

  // Save mock test data to localStorage when it changes
  useEffect(() => {
    if (mockTestData) {
      localStorage.setItem('mockTestData', JSON.stringify(mockTestData))
    }
  }, [mockTestData])

  const fetchMockTestData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return
    
    // Check if we need to refresh (only if forced or data is stale)
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTime
    const REFRESH_COOLDOWN = 30000 // 30 seconds
    
    if (!forceRefresh && timeSinceLastRefresh < REFRESH_COOLDOWN) {
      console.log('⏭️ Skipping refresh - data is still fresh')
      return
    }

    try {
      setLoading(true)
      console.log('Fetching mock test data for user:', user.id)

      const response = await fetch(`/api/mock-tests?userId=${user.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch mock test data')
      }

      console.log('Mock test data fetched successfully:', result.data)
      console.log('User attempts with results:', result.data.userAttempts)
      setMockTestData(result.data)
      setLastRefreshTime(now)
    } catch (error) {
      console.error('Error fetching mock test data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch mock test data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, lastRefreshTime])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Only fetch if we don't have cached data or if data is very stale
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTime
    const STALE_DATA_THRESHOLD = 300000 // 5 minutes
    
    if (!mockTestData || timeSinceLastRefresh > STALE_DATA_THRESHOLD) {
      fetchMockTestData()
    } else {
      console.log('📱 Using cached data, skipping initial fetch')
      setLoading(false)
    }
  }, [user, authLoading, router, fetchMockTestData, mockTestData, lastRefreshTime])

  // Disabled automatic refresh on tab visibility change to prevent unwanted refreshes
  // The real-time subscription will handle updates automatically
  // Users can manually refresh using the refresh button if needed

  // Real-time subscription to listen for test status updates
  useEffect(() => {
    if (!mockTestData || !user) return

    console.log('Setting up real-time subscription for test status changes...')

    const channel = supabase
      .channel('tests-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tests'
          // Removed filter to allow all updates - filter on client side instead
        },
        (payload) => {
          console.log('🔄 Test status update received:', payload)
          
          // Only process if it's a status we care about
          if (!['scheduled', 'live', 'completed'].includes(payload.new.status)) {
            console.log('⏭️ Skipping update for status:', payload.new.status)
            return
          }
          
          // Update the test in our local state
          setMockTestData((currentData) => {
            if (!currentData) return currentData

            const updatedTests = currentData.tests.map((test) => {
              if (test.id === payload.new.id) {
                console.log(`🔄 Updating test ${test.id} from status '${test.status}' to '${payload.new.status}'`)
                console.log('📊 Test details:', {
                  id: test.id,
                  name: test.name,
                  oldStatus: test.status,
                  newStatus: payload.new.status,
                  startTime: payload.new.start_time,
                  endTime: payload.new.end_time
                })
                
                // Merge the updated fields from the database
                return {
                  ...test,
                  ...payload.new,
                  // Ensure TypeScript type safety
                  status: payload.new.status as 'scheduled' | 'live' | 'completed',
                  start_time: payload.new.start_time,
                  end_time: payload.new.end_time,
                  total_questions: payload.new.total_questions ?? test.total_questions,
                  negative_marks_per_incorrect: payload.new.negative_marks_per_incorrect ?? test.negative_marks_per_incorrect,
                }
              }
              return test
            })

            console.log('✅ Updated tests array:', updatedTests.map(t => ({ id: t.id, name: t.name, status: t.status })))

            return {
              ...currentData,
              tests: updatedTests,
            }
          })
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for test status changes')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error. This may be due to:')
          console.error('  1. Supabase Realtime not enabled for the tests table')
          console.error('  2. Database replication not configured')
          console.error('  3. RLS policies blocking subscription')
          console.error('Error details:', err)
          console.warn('⚠️ Falling back to manual refresh mode. Tests will still work but won\'t update automatically.')
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Real-time subscription timed out. Retrying...')
        }
      })

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      console.log('Cleaning up real-time subscription...')
      channel.unsubscribe()
    }
  }, [mockTestData, user])

  // Pure function to categorize and filter tests
  function categorizeTests(
    tests: Test[],
    userAttempts: UserAttempt[],
    searchQuery: string,
    sortBy: 'date' | 'score' | 'name'
  ): { upcoming: Test[], live: Test[], completed: (Test & { userScore?: number; resultId?: number; results?: UserAttempt['results'] })[] } {
    const userAttemptMap = new Map(userAttempts.map(attempt => [attempt.mock_test_id, attempt]))

    const upcoming: Test[] = []
    const live: Test[] = []
    const completed: (Test & { userScore?: number; resultId?: number; results?: UserAttempt['results'] })[] = []

    tests.forEach(test => {
      const userAttempt = userAttemptMap.get(test.id)
      
      if (userAttempt) {
        // User has attempted this test
        completed.push({
          ...test,
          userScore: userAttempt.score_percentage,
          resultId: userAttempt.id,
          results: userAttempt.results
        })
      } else if (test.status === 'live') {
        live.push(test)
      } else if (test.status === 'completed') {
        // Test is over but user never attempted - hide from view
        // Do nothing - don't add to any category
      } else if (test.status === 'scheduled') {
        // Check if scheduled test should actually be live based on current time
        const now = new Date().getTime()
        const startTime = new Date(test.start_time).getTime()
        const isPastStartTime = now >= startTime
        
        if (isPastStartTime) {
          // Test should be live but database hasn't been updated yet
          live.push(test)
        } else {
          // Test is still upcoming
          upcoming.push(test)
        }
      }
    })

    // Helper function to filter and sort tests
    const filterAndSortTests = (tests: any[], type: 'upcoming' | 'live' | 'completed') => {
      // Filter by search query
      let filtered = tests.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

      // Sort based on selected option
      switch (sortBy) {
        case 'date':
          if (type === 'completed') {
            // For completed, we don't have submission date easily, so just use ID (newer = higher ID)
            filtered.sort((a, b) => b.id - a.id)
          } else {
            // For upcoming/live, sort by start_time
            filtered.sort((a, b) => 
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            )
          }
          break
        case 'score':
          if (type === 'completed') {
            filtered.sort((a, b) => (b.userScore || 0) - (a.userScore || 0))
          }
          break
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
      }

      return filtered
    }

    // Apply filtering and sorting to each category
    return {
      upcoming: filterAndSortTests(upcoming, 'upcoming'),
      live: filterAndSortTests(live, 'live'),
      completed: filterAndSortTests(completed, 'completed')
    }
  }

  const handleStartTest = (testId: number) => {
    router.push(`/practice?mockTestId=${testId}&testMode=mock`)
  }

  const handleViewResult = (resultId: number) => {
    router.push(`/analysis/${resultId}`)
  }

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    fetchMockTestData(true) // Force refresh
  }

  // Compute categorized tests using useMemo (must be before early returns)
  const { upcoming, live, completed } = useMemo(() => {
    if (!mockTestData) {
      return { upcoming: [], live: [], completed: [] }
    }
    return categorizeTests(mockTestData.tests, mockTestData.userAttempts, searchQuery, sortBy)
  }, [mockTestData, searchQuery, sortBy])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading mock tests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Mock Tests</h2>
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
            {/* Search Bar and Refresh Button */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-full max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                  placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all duration-300 shadow-sm font-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              </div>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-all duration-300 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
          <Tab.Group>
            <Tab.List className="flex space-x-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 max-w-lg shadow-sm">
              {[
                { key: 'upcoming', label: 'Upcoming', count: upcoming.length, icon: ClockIcon },
                { key: 'live', label: 'Live', count: live.length, icon: PlayIcon },
                { key: 'completed', label: 'Completed', count: completed.length, icon: CheckCircleIcon }
              ].map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }) =>
                    `flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                      selected
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`
                  }
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="tracking-wide">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="mt-12">
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="upcoming"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {upcoming.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <ClockIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3 tracking-wide">
                          No Upcoming Tests
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-light leading-relaxed">
                          {searchQuery 
                            ? `No tests match "${searchQuery}". Try a different search term.`
                            : "New mock tests will appear here when they're scheduled."}
                        </p>
                      </div>
                    ) : (
                      upcoming.map((test, index) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          type="upcoming"
                          onStartTest={handleStartTest}
                          onViewResult={handleViewResult}
                          index={index}
                        />
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tab.Panel>

              <Tab.Panel>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {live.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <PlayIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3 tracking-wide">
                          No Live Tests
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-light leading-relaxed">
                          {searchQuery 
                            ? `No live tests match "${searchQuery}".`
                            : "No tests are currently live. Check back when tests start."}
                        </p>
                      </div>
                    ) : (
                      live.map((test, index) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          type="live"
                          onStartTest={handleStartTest}
                          onViewResult={handleViewResult}
                          index={index}
                        />
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tab.Panel>

              <Tab.Panel>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {completed.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <CheckCircleIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3 tracking-wide">
                          No Completed Tests
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-light leading-relaxed">
                          {searchQuery 
                            ? `No completed tests match "${searchQuery}".`
                            : "Your test results will appear here once you complete a mock test."}
                        </p>
                      </div>
                    ) : (
                      completed.map((test, index) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          type="completed"
                          onStartTest={handleStartTest}
                          onViewResult={handleViewResult}
                          index={index}
                        />
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </motion.div>
      </div>
    </div>
  )
}