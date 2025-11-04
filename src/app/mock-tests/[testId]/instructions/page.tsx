'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SecureAgreementPage from '@/components/SecureAgreementPage'
import InstructionsPageSkeleton from '@/components/InstructionsPageSkeleton'
import { useAuth } from '@/lib/auth-context'
import nextDynamic from 'next/dynamic'

// Dynamically import PracticeInterface to avoid SSR issues
const DynamicPracticeInterface = nextDynamic(() => import('@/components/PracticeInterface'), { ssr: false })

export default function InstructionsPage() {
  const params = useParams()
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
  const [hasMixedMarking, setHasMixedMarking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTestActive, setIsTestActive] = useState(false)
  const [fullscreenError, setFullscreenError] = useState<string | null>(null)
  const [mockTestData, setMockTestData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [accessDenied, setAccessDenied] = useState(false)

  // CRITICAL SECURITY CHECK: Verify test submission status before rendering
  // This runs immediately on mount to prevent showing instructions page for submitted tests
  useEffect(() => {
    if (!testId || authLoading) return

    const checkTestStatus = async () => {
      try {
        // Include auth headers if available
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        // Check if test is already submitted by attempting to fetch test data
        // The API endpoint will return 403 if already submitted
        const response = await fetch(`/api/mock-tests/${testId}`, {
          headers,
          credentials: 'same-origin'
        })

        const text = await response.text()
        let result: any = null
        try {
          result = JSON.parse(text)
        } catch {
          // If parsing fails, continue to metadata fetch
          console.warn('Could not parse response, continuing...')
        }

        // CRITICAL SECURITY CHECK: Handle already submitted status
        if (response.status === 403 && result?.status === 'already_submitted') {
          console.warn('⚠️ Test already submitted. Redirecting to results page.')
          setAccessDenied(true)
          
          // Redirect immediately - don't show instructions page
          if (result.result_url) {
            router.replace(result.result_url)
          } else if (result.result_id) {
            router.replace(`/analysis/${result.result_id}`)
          } else {
            // Fallback: redirect to mock tests hub
            router.replace('/mock-tests')
          }
          return
        }

        // If check passes, continue with normal metadata fetch
        // (This will be handled by the next useEffect)
      } catch (error) {
        console.error('Error checking test status:', error)
        // Continue anyway - don't block access due to check error
        // The metadata fetch will handle actual errors
      }
    }

    checkTestStatus()
  }, [testId, session, router, authLoading])

  // Fetch test metadata (only if access is not denied)
  useEffect(() => {
    if (accessDenied || !testId) return

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

    fetchTestMetadata()
  }, [testId, accessDenied])

  // Fetch mock test data and questions when test is activated
  useEffect(() => {
    if (!isTestActive || !testId) return

    const fetchMockTestData = async () => {
      try {
        console.log('Fetching mock test data for test ID:', testId)
        
        // Include auth headers if available
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        
        const response = await fetch(`/api/mock-tests/${testId}`, {
          headers,
          credentials: 'same-origin'
        })
        
        const text = await response.text()
        let result: any = null
        try { 
          result = JSON.parse(text) 
        } catch {
          throw new Error(`Failed to fetch mock test data (${response.status})`)
        }
        
        // CRITICAL SECURITY CHECK: Handle already submitted status
        if (response.status === 403 && result.status === 'already_submitted') {
          console.warn('⚠️ Test already submitted. Redirecting to results page.')
          if (result.result_url) {
            router.push(result.result_url)
          } else if (result.result_id) {
            router.push(`/analysis/${result.result_id}`)
          } else {
            router.push('/mock-tests')
          }
          return
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
  }, [isTestActive, testId, session, router])

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

  // Show loading skeleton while checking access or loading metadata
  // If access is denied, the redirect will happen during this loading state
  if (loading || accessDenied) {
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
