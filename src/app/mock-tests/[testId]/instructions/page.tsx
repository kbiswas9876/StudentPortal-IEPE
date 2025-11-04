'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SecureAgreementPage from '@/components/SecureAgreementPage'
import InstructionsPageSkeleton from '@/components/InstructionsPageSkeleton'
import nextDynamic from 'next/dynamic'

// Dynamically import PracticeInterface to avoid SSR issues
const DynamicPracticeInterface = nextDynamic(() => import('@/components/PracticeInterface'), { ssr: false })

export default function InstructionsPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
  const [hasMixedMarking, setHasMixedMarking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTestActive, setIsTestActive] = useState(false)
  const [fullscreenError, setFullscreenError] = useState<string | null>(null)
  const [mockTestData, setMockTestData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])

  // Fetch test metadata
  useEffect(() => {
    const fetchTestMetadata = async () => {
      try {
        const response = await fetch(`/api/mock-tests/${testId}/metadata`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load test')
        }

        const testData = result.data.test
        const mixedMarking = result.data.hasMixedMarking || false
        console.log('Test metadata received:', testData)
        console.log('Negative marking value:', testData.negative_marks_per_incorrect)
        console.log('Has mixed marking:', mixedMarking)
        setTest(testData)
        setHasMixedMarking(mixedMarking)
      } catch (err) {
        console.error('Error loading test:', err)
        setError(err instanceof Error ? err.message : 'Failed to load test')
      } finally {
        setLoading(false)
      }
    }

    if (testId) {
      fetchTestMetadata()
    }
  }, [testId])

  // Fetch mock test data and questions when test is activated
  useEffect(() => {
    if (!isTestActive || !testId) return

    const fetchMockTestData = async () => {
      try {
        console.log('Fetching mock test data for test ID:', testId)
        const response = await fetch(`/api/mock-tests/${testId}`)
        const text = await response.text()
        let result: any = null
        try { 
          result = JSON.parse(text) 
        } catch {
          throw new Error(`Failed to fetch mock test data (${response.status})`)
        }
        
        if (!response.ok) {
          throw new Error(result?.error || `Failed to fetch mock test data (${response.status})`)
        }
        
        console.log('Mock test data fetched successfully:', result.data)
        setMockTestData(result.data)
        setQuestions(result.data.questions || [])
      } catch (error) {
        console.error('Error fetching mock test data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch mock test data')
        setIsTestActive(false) // Revert to instructions if fetch fails
      }
    }

    fetchMockTestData()
  }, [isTestActive, testId])

  // DEFINITIVE SOLUTION: Promise-based pattern (not async/await)
  // The request is fired immediately and synchronously within the click handler.
  // This preserves the user gesture context for Chrome's security model.
  const handleStartTest = useCallback(() => {
    setFullscreenError(null)

    // Determine which fullscreen API to use (cross-browser support)
    const requestFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        // Standard API - Chrome, Firefox, Edge
        return document.documentElement.requestFullscreen()
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        // Safari support
        return (document.documentElement as any).webkitRequestFullscreen()
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        // Firefox support (legacy)
        return (document.documentElement as any).mozRequestFullScreen()
      } else if ((document.documentElement as any).msRequestFullscreen) {
        // IE/Edge support (legacy)
        return (document.documentElement as any).msRequestFullscreen()
      } else {
        // No fullscreen support
        return Promise.reject(new Error('Fullscreen API not supported in this browser'))
      }
    }

    // The request is fired immediately and synchronously within the click handler.
    // Chrome sees this as part of the direct user gesture.
    requestFullscreen()
      .then(() => {
        // SUCCESS CALLBACK: This code runs only AFTER the browser has
        // successfully entered fullscreen. The gesture context is preserved.
        // Now it is safe to change state.
        console.log('SUCCESS: Fullscreen entered via promise-based handler.')
        setIsTestActive(true)
      })
      .catch((err) => {
        // FAILURE CALLBACK: This code runs if the request is denied or fails.
        console.error('FAILURE: Fullscreen failed in promise-based handler.', err)
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setFullscreenError('Fullscreen permission was denied. Please allow fullscreen access and try again.')
        } else {
          setFullscreenError('Unable to enter fullscreen mode. Check browser settings.')
        }
      })
  }, []) // Note: setIsTestActive and setFullscreenError are stable setState functions from useState

  const handleCancel = useCallback(() => {
    router.push('/mock-tests')
  }, [router])

  if (loading) {
    return <InstructionsPageSkeleton />
  }

  if (error || !test) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">{error || 'Test not found'}</p>
          <button
            onClick={() => router.push('/mock-tests')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    )
  }

  // Once the test is active and we have questions, render the main test interface
  if (isTestActive && questions.length > 0 && mockTestData) {
    return (
      <DynamicPracticeInterface
        questions={questions}
        testMode="timed"
        timeLimitInMinutes={mockTestData.test.total_time_minutes}
        mockTestData={mockTestData}
        savedSessionState={null}
        source="mock-test"
        hideMetadata={false}
      />
    )
  }

  // By default, render the agreement page
  return (
    <SecureAgreementPage
      test={test}
      hasMixedMarking={hasMixedMarking}
      fullscreenError={fullscreenError}
      onStartTest={handleStartTest}
      onCancel={handleCancel}
    />
  )
}
