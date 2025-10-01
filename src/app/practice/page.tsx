'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import PracticeInterface from '@/components/PracticeInterface'
import PracticeSkeletonLoader from '@/components/PracticeSkeletonLoader'

type Question = Database['public']['Tables']['questions']['Row']

function PracticePageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mockTestData, setMockTestData] = useState<any>(null)
  const questionsFetchedRef = useRef(false)

  // Get parameters from URL
  const questionIds = searchParams.get('questions')?.split(',') || []
  const testMode = searchParams.get('testMode') as 'practice' | 'timed' | 'mock' || 'practice'
  const timeLimit = searchParams.get('timeLimit')
  const mockTestId = searchParams.get('mockTestId')
  const isSavedSession = searchParams.get('savedSession') === 'true'
  const savedSessionData = searchParams.get('sessionData')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Check if this is a saved session, mock test, or regular practice
    if (isSavedSession && savedSessionData) {
      // Saved session mode
      if (!questionsFetchedRef.current) {
        questionsFetchedRef.current = true
        restoreSavedSession()
      }
    } else if (mockTestId) {
      // Mock test mode
      if (!questionsFetchedRef.current) {
        questionsFetchedRef.current = true
        fetchMockTestData()
      }
    } else {
      // Regular practice mode
      if (questionIds.length === 0) {
        setError('No questions selected for practice session')
        setLoading(false)
        return
      }

      if (!questionsFetchedRef.current) {
        questionsFetchedRef.current = true
        fetchQuestions()
      }
    }
  }, [user, authLoading, questionIds, router])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      console.log('Fetching questions for practice session:', questionIds)

      const response = await fetch('/api/practice/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionIds })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch questions')
      }

      console.log('Questions fetched successfully:', result.data)
      setQuestions(result.data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchMockTestData = async () => {
    try {
      setLoading(true)
      console.log('Fetching mock test data for test ID:', mockTestId)

      const response = await fetch(`/api/mock-tests/${mockTestId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch mock test data')
      }

      console.log('Mock test data fetched successfully:', result.data)
      setMockTestData(result.data)
      setQuestions(result.data.questions)
    } catch (error) {
      console.error('Error fetching mock test data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch mock test data')
    } finally {
      setLoading(false)
    }
  }

  const restoreSavedSession = () => {
    try {
      setLoading(true)
      console.log('Restoring saved session:', savedSessionData)

      if (!savedSessionData) {
        throw new Error('No saved session data provided')
      }

      const sessionData = JSON.parse(savedSessionData)
      
      // Validate session data structure
      if (!sessionData.questions || !Array.isArray(sessionData.questions)) {
        throw new Error('Invalid session data: missing questions array')
      }
      
      // Validate that we have the required state data
      if (!sessionData.questionStatuses || !sessionData.userAnswers) {
        console.warn('Saved session missing some state data, but proceeding with restoration')
      }
      
      // Restore questions from saved session
      setQuestions(sessionData.questions)
      
      // Restore mock test data if it was a mock test
      if (sessionData.mockTestData) {
        setMockTestData(sessionData.mockTestData)
      }
      
      // Store the complete session state for the PracticeInterface to use
      // This will be passed as a prop to enable state restoration
      if (typeof window !== 'undefined') {
        (window as any).__SAVED_SESSION_STATE__ = sessionData
      }
      
      console.log('Saved session restored successfully with state:', {
        questionsCount: sessionData.questions?.length || 0,
        currentIndex: sessionData.currentIndex || 0,
        userAnswersCount: Object.keys(sessionData.userAnswers || {}).length,
        questionStatusesCount: Object.keys(sessionData.questionStatuses || {}).length,
        hasMockTestData: !!sessionData.mockTestData
      })
    } catch (error) {
      console.error('Error restoring saved session:', error)
      setError(`Failed to restore saved session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <PracticeSkeletonLoader />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Practice Session Error</h2>
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">No Questions Available</h2>
            <p>No questions were found for this practice session.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PracticeInterface 
        questions={questions} 
        testMode={testMode === 'mock' ? 'timed' : testMode}
        timeLimitInMinutes={mockTestData ? mockTestData.test.total_time_minutes : (timeLimit ? parseInt(timeLimit) : undefined)}
        mockTestData={mockTestData}
        savedSessionState={isSavedSession ? (window as any).__SAVED_SESSION_STATE__ : null}
      />
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeSkeletonLoader />}>
      <PracticePageContent />
    </Suspense>
  )
}