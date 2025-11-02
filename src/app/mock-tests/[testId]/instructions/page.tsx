'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PreTestInstructions from '@/components/PreTestInstructions'

export default function InstructionsPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<any>(null)
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

        setTest(result.data.test)
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading test instructions...</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Test not found'}</p>
          <button
            onClick={() => router.push('/mock-tests')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    )
  }

  return <PreTestInstructions test={test} />
}
