'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import RevisionHubFilters from '@/components/RevisionHubFilters'
import RevisionHubBookAccordion from '@/components/RevisionHubBookAccordion'
import EditBookmarkModal from '@/components/EditBookmarkModal'

type BookmarkedQuestion = Database['public']['Tables']['bookmarked_questions']['Row'] & {
  questions: Database['public']['Tables']['questions']['Row']
}

interface FilterState {
  bookSource: string
  chapter: string
  customTags: string[]
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
    customTags: []
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

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleEditBookmark = (bookmark: BookmarkedQuestion) => {
    setEditingBookmark(bookmark)
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
    const questionIds = filteredQuestions.map(bookmark => bookmark.questions.question_id)
    router.push(`/practice?questions=${questionIds.join(',')}&testMode=practice&fromRevision=true`)
  }

  // Get unique book sources and chapters for filters
  const bookSources = Array.from(new Set(bookmarkedQuestions.map(b => b.questions.book_source)))
  const chapters = Array.from(new Set(bookmarkedQuestions.map(b => b.questions.chapter_name)))
  const allCustomTags = Array.from(new Set(
    bookmarkedQuestions.flatMap(b => b.custom_tags || [])
  ))

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
            bookSources={bookSources}
            chapters={chapters}
            customTags={allCustomTags}
            filters={filters}
            onFilterChange={handleFilterChange}
            onStartRevision={handleStartRevisionSession}
            totalQuestions={bookmarkedQuestions.length}
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
          >
            <RevisionHubBookAccordion
              bookmarkedQuestions={bookmarkedQuestions}
              filters={filters}
              onEditBookmark={handleEditBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
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