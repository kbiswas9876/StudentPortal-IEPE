'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import PracticeInterface from '@/components/PracticeInterface'

type Question = Database['public']['Tables']['questions']['Row']

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const questionsFetchedRef = useRef(false)

  // Get parameters from URL
  const questionIds = searchParams.get('questions')?.split(',') || []
  const testMode = searchParams.get('testMode') as 'practice' | 'timed' || 'practice'
  const timeLimit = searchParams.get('timeLimit')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (questionIds.length === 0) {
      setError('No questions selected for practice session')
      setLoading(false)
      return
    }

    if (!questionsFetchedRef.current) {
      questionsFetchedRef.current = true
      fetchQuestions()
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading practice session...</p>
        </div>
      </div>
    )
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
        testMode={testMode}
        timeLimitInMinutes={timeLimit ? parseInt(timeLimit) : undefined}
      />
    </div>
  )
}