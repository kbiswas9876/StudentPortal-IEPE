'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import RevisionHubFilters from '@/components/RevisionHubFilters'
import RevisionHubBookAccordion from '@/components/RevisionHubBookAccordion'
import QuestionSummaryCard from '@/components/QuestionSummaryCard'
import EditBookmarkModal from '@/components/EditBookmarkModal'
import { Database } from '@/types/database'

type BookmarkedQuestion = {
  id: number
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  questions: Database['public']['Tables']['questions']['Row']
}

type FilterState = {
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

  const handleUpdateBookmark = async (bookmarkId: number, personalNote: string, customTags: string[]) => {
    try {
      const response = await fetch('/api/revision-hub/bookmarks/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId,
          personalNote,
          customTags,
          userId: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update bookmark')
      }

      console.log('Bookmark updated successfully:', result.data)
      
      // Update the local state
      setBookmarkedQuestions(prev => 
        prev.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { ...bookmark, personal_note: personalNote, custom_tags: customTags }
            : bookmark
        )
      )
      
      setEditingBookmark(null)
    } catch (error) {
      console.error('Error updating bookmark:', error)
    }
  }

  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      const response = await fetch(`/api/revision-hub/bookmarks/delete?bookmarkId=${bookmarkId}&userId=${user?.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete bookmark')
      }

      console.log('Bookmark deleted successfully')
      
      // Update the local state
      setBookmarkedQuestions(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const getFilteredQuestions = () => {
    let filtered = bookmarkedQuestions

    if (filters.bookSource) {
      filtered = filtered.filter(bookmark => bookmark.questions.book_source === filters.bookSource)
    }

    if (filters.chapter) {
      filtered = filtered.filter(bookmark => bookmark.questions.chapter_name === filters.chapter)
    }

    if (filters.customTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        bookmark.custom_tags && 
        filters.customTags.some(tag => bookmark.custom_tags?.includes(tag))
      )
    }

    return filtered
  }

  const getUniqueBookSources = () => {
    const sources = [...new Set(bookmarkedQuestions.map(bookmark => bookmark.questions.book_source))]
    return sources.sort()
  }

  const getUniqueChapters = () => {
    const chapters = [...new Set(bookmarkedQuestions.map(bookmark => bookmark.questions.chapter_name))]
    return chapters.sort()
  }

  const getUniqueCustomTags = () => {
    const allTags = bookmarkedQuestions
      .filter(bookmark => bookmark.custom_tags && bookmark.custom_tags.length > 0)
      .flatMap(bookmark => bookmark.custom_tags!)
    return [...new Set(allTags)].sort()
  }

  const handleStartRevisionSession = () => {
    const filteredQuestions = getFilteredQuestions()
    const questionIds = filteredQuestions.map(bookmark => bookmark.questions.question_id)
    
    if (questionIds.length === 0) {
      alert('No questions selected for revision session. Please adjust your filters.')
      return
    }

    // Navigate to practice setup with pre-selected questions
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

  const filteredQuestions = getFilteredQuestions()

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
            Manage and re-practice your bookmarked questions
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
            filters={filters}
            onFiltersChange={setFilters}
            bookSources={getUniqueBookSources()}
            chapters={getUniqueChapters()}
            customTags={getUniqueCustomTags()}
            onStartRevisionSession={handleStartRevisionSession}
            totalQuestions={filteredQuestions.length}
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
                Start bookmarking questions during practice sessions to build your personal revision hub.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Start Practicing
              </button>
            </div>
          </motion.div>
        ) : filteredQuestions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">No Questions Match Current Filters</h3>
              <p className="text-sm">
                Try adjusting your filter criteria to see more questions.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <RevisionHubBookAccordion
              bookmarkedQuestions={filteredQuestions}
              onEditBookmark={setEditingBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
          </motion.div>
        )}

        {/* Edit Bookmark Modal */}
        <AnimatePresence>
          {editingBookmark && (
            <EditBookmarkModal
              bookmark={editingBookmark}
              onClose={() => setEditingBookmark(null)}
              onSave={handleUpdateBookmark}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
