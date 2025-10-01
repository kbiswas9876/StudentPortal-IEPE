'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import RevisionHubFilters from '@/components/RevisionHubFilters'
import RevisionHubBookAccordion from '@/components/RevisionHubBookAccordion'
import EditBookmarkModal from '@/components/EditBookmarkModal'
import QuestionSummaryCard from '@/components/QuestionSummaryCard'

type BookmarkedQuestion = {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
  performance?: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

interface FilterState {
  bookSource: string
  chapter: string
  customTags: string[]
  searchQuery: string
}

export default function RevisionHubPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    bookSource: '',
    chapter: '',
    customTags: [],
    searchQuery: ''
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkedQuestion | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchBookmarkedQuestions()
  }, [user, authLoading, router])

  const fetchBookmarkedQuestions = async () => {
    try {
      setLoading(true)
      console.log('Fetching bookmarked questions for user:', user?.id)

      const response = await fetch(`/api/revision-hub/bookmarks?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookmarked questions')
      }

      console.log('Bookmarked questions fetched successfully:', result.data)
      setBookmarkedQuestions(result.data || [])
    } catch (error) {
      console.error('Error fetching bookmarked questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch bookmarked questions')
    } finally {
      setLoading(false)
    }
  }


  const handleEditBookmark = (question: any) => {
    setEditingBookmark(question)
    setShowEditModal(true)
  }

  const handleSaveBookmark = async (bookmarkData: { personalNote: string; customTags: string[] }) => {
    if (!editingBookmark) return

    try {
      const response = await fetch(`/api/revision-hub/bookmarks/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId: editingBookmark.id,
          personalNote: bookmarkData.personalNote,
          customTags: bookmarkData.customTags
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update bookmark')
      }

      console.log('Bookmark updated successfully:', result.data)
      
      // Refresh the bookmarked questions
      await fetchBookmarkedQuestions()
      setShowEditModal(false)
      setEditingBookmark(null)
    } catch (error) {
      console.error('Error updating bookmark:', error)
    }
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/revision-hub/bookmarks/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete bookmark')
      }

      console.log('Bookmark deleted successfully')
      
      // Refresh the bookmarked questions
      await fetchBookmarkedQuestions()
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const handleStartRevisionSession = () => {
    // Filter questions based on current filters
    const filteredQuestions = bookmarkedQuestions.filter(bookmark => {
      const question = bookmark.questions
      
      // Skip if no question data
      if (!question) {
        return false
      }
      
      // Filter by book source
      if (filters.bookSource && question.book_source !== filters.bookSource) {
        return false
      }
      
      // Filter by chapter
      if (filters.chapter && question.chapter_name !== filters.chapter) {
        return false
      }
      
      // Filter by custom tags
      if (filters.customTags.length > 0) {
        const bookmarkTags = bookmark.custom_tags || []
        const hasMatchingTag = filters.customTags.some(tag => 
          bookmarkTags.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }
      
      return true
    })

    if (filteredQuestions.length === 0) {
      alert('No questions match your current filters. Please adjust your filters and try again.')
      return
    }

    // Extract question IDs and navigate to practice setup
    const questionIds = filteredQuestions
      .filter(bookmark => bookmark.questions) // Filter out bookmarks without questions
      .map(bookmark => bookmark.questions.question_id)
    
    if (questionIds.length === 0) {
      alert('No valid questions found. Please check your bookmarks and try again.')
      return
    }
    
    router.push(`/practice?questions=${questionIds.join(',')}&testMode=practice&fromRevision=true`)
  }


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your revision hub...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Revision Hub</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <RevisionHubFilters
            bookmarkedQuestions={bookmarkedQuestions}
            onFiltersChange={setFilters}
            onStartRevisionSession={handleStartRevisionSession}
            isLoading={loading}
          />
        </motion.div>

        {/* Content */}
        {bookmarkedQuestions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Bookmarked Questions Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start bookmarking questions during practice sessions to build your personal revision collection.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Start Practicing
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {bookmarkedQuestions
              .filter(question => {
                // Skip if no question data
                if (!question.questions) {
                  return false
                }
                
                if (filters.searchQuery && !question.questions.question_text.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
                  return false
                }
                if (filters.bookSource && question.questions.book_source !== filters.bookSource) {
                  return false
                }
                if (filters.chapter && question.questions.chapter_name !== filters.chapter) {
                  return false
                }
                if (filters.customTags.length > 0) {
                  const questionTags = question.custom_tags || []
                  const hasMatchingTag = filters.customTags.some(tag => questionTags.includes(tag))
                  if (!hasMatchingTag) return false
                }
                return true
              })
              .map((bookmark) => {
                // Skip if no question data
                if (!bookmark.questions) {
                  return null
                }
                
                return (
                  <QuestionSummaryCard
                    key={bookmark.id}
                    question={{
                      ...bookmark.questions,
                      personal_note: bookmark.personal_note,
                      custom_tags: bookmark.custom_tags,
                      bookmark_id: bookmark.id,
                      performance: bookmark.performance || {
                        total_attempts: 0,
                        correct_attempts: 0,
                        success_rate: 0,
                        last_attempt_status: 'never',
                        last_attempt_time: null,
                        last_attempt_date: null,
                        time_trend: null
                      }
                    }}
                    onEdit={handleEditBookmark}
                    onDelete={handleDeleteBookmark}
                    onViewSolution={(q) => {
                      // TODO: Implement view solution modal
                      console.log('View solution for question:', q.id)
                    }}
                  />
                )
              })
              .filter(Boolean) // Remove null entries
            }
          </motion.div>
        )}

        {/* Edit Bookmark Modal */}
        {showEditModal && editingBookmark && (
          <EditBookmarkModal
            bookmark={editingBookmark}
            onClose={() => {
              setShowEditModal(false)
              setEditingBookmark(null)
            }}
            onSave={handleSaveBookmark}
          />
        )}
      </div>
    </div>
  )
}