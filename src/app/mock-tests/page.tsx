'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tab } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, ClockIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabaseClient'

// Minimalist Test Card Component
function MinimalistTestCard({ test, type, onStartTest, onViewResult, index }: {
  test: Test & { userScore?: number; resultId?: number }
  type: 'upcoming' | 'live' | 'completed'
  onStartTest: (testId: number) => void
  onViewResult: (resultId: number) => void
  index: number
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    if (type === 'upcoming') {
      const updateCountdown = () => {
        const now = new Date().getTime()
        const startTime = new Date(test.start_time).getTime()
        const difference = startTime - now

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m`)
          } else {
            setTimeRemaining(`${minutes}m`)
          }
        } else {
          setTimeRemaining('Starting now')
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [test.start_time, type])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = () => {
    switch (type) {
      case 'upcoming':
        return 'text-blue-600 dark:text-blue-400'
      case 'live':
        return 'text-green-600 dark:text-green-400'
      case 'completed':
        return 'text-slate-600 dark:text-slate-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getStatusIcon = () => {
    switch (type) {
      case 'upcoming':
        return <ClockIcon className="h-5 w-5" />
      case 'live':
        return <PlayIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return null
    }
  }

  const getActionButton = () => {
    switch (type) {
      case 'upcoming':
        return (
          <button
            disabled
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed text-sm"
          >
            {timeRemaining === 'Starting now' ? 'Starting Soon' : 'Coming Soon'}
          </button>
        )
      case 'live':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartTest(test.id)}
            className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold transition-all duration-200 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm"
          >
            Start Test
          </motion.button>
        )
      case 'completed':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => test.resultId && onViewResult(test.resultId)}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm"
          >
            View Results
          </motion.button>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
    >
      {/* Live Status Badge */}
      {type === 'live' && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </motion.div>
        </div>
      )}

      <div className="p-6">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {test.name}
            </h3>
            {test.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {test.description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              type === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
              type === 'live' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {type === 'upcoming' && timeRemaining}
              {type === 'live' && 'Available'}
              {type === 'completed' && test.userScore !== undefined && `${test.userScore.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Key Metrics - Admin Panel Style */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{test.total_questions}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Questions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatTime(test.total_time_minutes)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l-2.83 2.83M6 7l2.83 2.83m6-2.83a5.002 5.002 0 01-9.002 0" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">+{test.marks_per_correct} / {test.negative_marks_per_incorrect || 0}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Marking</div>
            </div>
          </div>
        </div>

        {/* Time Information - Admin Panel Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-slate-500 dark:text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 01-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {type === 'upcoming' ? 'Starts' : type === 'live' ? 'Started' : 'Completed'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'upcoming' ? new Date(test.start_time).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true 
                }) : 
                type === 'live' ? 'Now' :
                'Finished'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-slate-500 dark:text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Ends</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'upcoming' ? new Date(test.end_time).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true 
                }) : 
                type === 'live' ? 'Ongoing' :
                'Completed'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {getActionButton()}
      </div>
    </motion.div>
  )
}

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
      } else if (test.status === 'live') {
        live.push(test)
      } else if (test.status === 'completed') {
        // Test is completed but user hasn't attempted it
        completed.push(test)
      } else if (test.status === 'scheduled') {
        upcoming.push(test)
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
            {/* Search Bar */}
          <div className="mb-8">
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
                        <MinimalistTestCard
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
                        <MinimalistTestCard
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
                        <MinimalistTestCard
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