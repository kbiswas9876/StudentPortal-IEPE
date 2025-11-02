'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SecureAgreementPage from '@/components/SecureAgreementPage'

export default function InstructionsPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
  const [hasMixedMarking, setHasMixedMarking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading test instructions...</p>
        </div>
      </div>
    )
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

  return <SecureAgreementPage test={test} hasMixedMarking={hasMixedMarking} />
}
