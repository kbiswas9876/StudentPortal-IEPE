'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import RevisionChapterNav from '@/components/RevisionChapterNav'
import BookmarkedQuestionCard from '@/components/BookmarkedQuestionCard'

interface ChapterData {
  name: string
  count: number
}

interface BookmarkedQuestion {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  user_difficulty_rating: number | null
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
  performance: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

export default function RevisionHubPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [chapters, setChapters] = useState<ChapterData[]>([])
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([])
  
  const [loadingChapters, setLoadingChapters] = useState(true)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State persistence - prevent unnecessary reloads
  const dataFetchedRef = React.useRef(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Only fetch if we haven't already
    if (!dataFetchedRef.current) {
      fetchChapters()
      dataFetchedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  // Fetch unique chapters with bookmarks
  const fetchChapters = async () => {
    try {
      setLoadingChapters(true)
      console.log('Fetching chapters for user:', user?.id)

      const response = await fetch(`/api/revision-hub/chapters?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch chapters')
      }

      console.log('Chapters fetched successfully:', result.data)
      setChapters(result.data || [])

      // Auto-select first chapter
      if (result.data && result.data.length > 0) {
        const firstChapter = result.data[0].name
        setSelectedChapter(firstChapter)
        fetchQuestionsForChapter(firstChapter)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch chapters')
    } finally {
      setLoadingChapters(false)
    }
  }

  // Fetch bookmarked questions for a specific chapter
  const fetchQuestionsForChapter = async (chapter: string) => {
    try {
      setLoadingQuestions(true)
      console.log('Fetching questions for chapter:', chapter)

      const response = await fetch(
        `/api/revision-hub/by-chapter?userId=${user?.id}&chapterName=${encodeURIComponent(chapter)}`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch questions')
      }

      console.log('Questions fetched successfully:', result.data)
      setBookmarkedQuestions(result.data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch questions')
    } finally {
      setLoadingQuestions(false)
    }
  }

  // Handle chapter selection
  const handleSelectChapter = (chapter: string) => {
    setSelectedChapter(chapter)
    fetchQuestionsForChapter(chapter)
  }

  // Loading state
  if (authLoading || loadingChapters) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your revision hub...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-6 rounded-xl mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Revision Hub</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              My Revision Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your personal collection of questions for focused revision
            </p>
          </motion.div>

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center py-20"
          >
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md text-center">
              <div className="text-7xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                No Bookmarked Questions Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Start bookmarking questions during practice sessions to build your personal revision collection.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Start Practicing
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            My Revision Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and master your bookmarked questions, organized by chapter
          </p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Chapter Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
              <RevisionChapterNav
                chapters={chapters}
                selectedChapter={selectedChapter}
                onSelectChapter={handleSelectChapter}
                isLoading={loadingChapters}
              />
            </div>
          </motion.div>

          {/* Right Column - Question Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-9"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedChapter ? (
                      <>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {selectedChapter}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {bookmarkedQuestions.length} bookmarked question{bookmarkedQuestions.length !== 1 ? 's' : ''}
                          {bookmarkedQuestions.length > 0 && (
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-500">
                              • Click any card to expand
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Select a chapter
                      </h2>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingQuestions ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 mx-auto mb-3"></div>
                      <p className="text-slate-500 dark:text-slate-400">Loading questions...</p>
                    </div>
                  </div>
                ) : bookmarkedQuestions.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <p className="text-lg">No questions found for this chapter</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedQuestions.map((question, index) => (
                      <BookmarkedQuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
