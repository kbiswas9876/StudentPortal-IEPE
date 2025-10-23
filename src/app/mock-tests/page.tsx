'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tab } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabaseClient'
import TestCard from '@/components/TestCard'

type Test = {
  id: number
  name: string
  description: string | null
  start_time: string
  end_time: string
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

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchMockTestData()
  }, [user, authLoading, router])

  const fetchMockTestData = async () => {
    try {
      setLoading(true)
      console.log('Fetching mock test data for user:', user?.id)

      const response = await fetch(`/api/mock-tests?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch mock test data')
      }

      console.log('Mock test data fetched successfully:', result.data)
      setMockTestData(result.data)
    } catch (error) {
      console.error('Error fetching mock test data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch mock test data')
    } finally {
      setLoading(false)
    }
  }

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
          table: 'tests',
          filter: 'status=in.(scheduled,live,completed)'
        },
        (payload) => {
          console.log('Test status update received:', payload)
          
          // Update the test in our local state
          setMockTestData((currentData) => {
            if (!currentData) return currentData

            const updatedTests = currentData.tests.map((test) => {
              if (test.id === payload.new.id) {
                console.log(`Updating test ${test.id} from status '${test.status}' to '${payload.new.status}'`)
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

  // Filter and sort helper
  const filterAndSortTests = useMemo(() => {
    return (tests: any[], type: 'upcoming' | 'live' | 'completed') => {
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
  }, [searchQuery, sortBy])

  const categorizeTests = () => {
    if (!mockTestData) return { upcoming: [], live: [], completed: [] }

    const { tests, userAttempts } = mockTestData
    const userAttemptMap = new Map(userAttempts.map(attempt => [attempt.mock_test_id, attempt]))

    const upcoming: Test[] = []
    const live: Test[] = []
    const completed: (Test & { userScore?: number; resultId?: number })[] = []

    tests.forEach(test => {
      const userAttempt = userAttemptMap.get(test.id)
      
      if (userAttempt) {
        // User has attempted this test
        completed.push({
          ...test,
          userScore: userAttempt.score_percentage,
          resultId: userAttempt.id
        })
      } else if (test.status === 'scheduled') {
        upcoming.push(test)
      } else if (test.status === 'live') {
        live.push(test)
      } else if (test.status === 'completed') {
        // Test is completed but user hasn't attempted it
        completed.push(test)
      }
    })

    // Apply filtering and sorting
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

  const { upcoming, live, completed } = categorizeTests()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Mock Tests
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Official mock tests to help you prepare for your exams
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tests by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sm:w-64">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name (A-Z)</option>
                  <option value="score">Sort by Score</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active filters indicator */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 text-sm text-slate-600 dark:text-slate-400"
            >
              Showing results for: <span className="font-semibold text-slate-900 dark:text-slate-100">"{searchQuery}"</span>
            </motion.div>
          )}
        </motion.div>

        {/* Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-8">
              {[
                { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
                { key: 'live', label: 'Live', count: live.length },
                { key: 'completed', label: 'Completed', count: completed.length }
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
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tab.count > 0 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="upcoming"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {upcoming.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                          <div className="text-7xl mb-6">📅</div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                            No Upcoming Tests
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {searchQuery 
                              ? `No tests match "${searchQuery}". Try a different search term.`
                              : "Check back soon for new mock tests, or explore practice mode to sharpen your skills!"}
                          </p>
                          {!searchQuery && (
                            <button
                              onClick={() => router.push('/practice')}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              Go to Practice Mode
                            </button>
                          )}
                        </div>
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
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {live.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                          <div className="text-7xl mb-6">⏰</div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                            No Live Tests
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {searchQuery 
                              ? `No live tests match "${searchQuery}".`
                              : "No tests are currently live. Upcoming tests will appear here automatically when they start."}
                          </p>
                        </div>
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
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {completed.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                          <div className="text-7xl mb-6">📊</div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                            No Completed Tests Yet
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {searchQuery 
                              ? `No completed tests match "${searchQuery}".`
                              : "You haven't taken any tests yet. Start your first mock test to see your performance analysis here!"}
                          </p>
                          {!searchQuery && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Check the Upcoming tab for available tests
                            </p>
                          )}
                        </div>
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