'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { PlusIcon, TrashIcon, BookOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface CustomBook {
  book_name: string
  question_count: number
  created_at: string
}

export default function MyContentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<CustomBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingBook, setDeletingBook] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchBooks()
  }, [user, authLoading, router])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      console.log('Fetching custom books for user:', user?.id)

      const response = await fetch(`/api/user-content?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch custom books')
      }

      console.log('Custom books fetched successfully:', result.data)
      setBooks(result.data || [])
    } catch (error) {
      console.error('Error fetching custom books:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch custom books')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookName: string) => {
    if (!user) return

    try {
      setDeletingBook(bookName)
      console.log('Deleting custom book:', bookName)

      const response = await fetch(`/api/user-content/${encodeURIComponent(bookName)}?userId=${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete custom book')
      }

      console.log('Custom book deleted successfully')
      
      // Refresh the books list
      await fetchBooks()
    } catch (error) {
      console.error('Error deleting custom book:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete custom book')
    } finally {
      setDeletingBook(null)
    }
  }

  const handleStartPractice = (bookName: string) => {
    // Navigate to practice setup with custom book
    router.push(`/dashboard?customBook=${encodeURIComponent(bookName)}`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your custom content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Content</h2>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                My Content
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your custom question sets and practice materials
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/my-content/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New Book/Sheet</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Books List */}
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center py-12"
          >
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Custom Content Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Upload your own question sets to create personalized practice sessions with your own content.
              </p>
              <button
                onClick={() => router.push('/my-content/upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Upload Your First Book
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {books.map((book, index) => (
                <motion.div
                  key={book.book_name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {book.book_name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <DocumentTextIcon className="h-4 w-4" />
                            <span>{book.question_count} questions</span>
                          </div>
                          <div>
                            Added {new Date(book.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartPractice(book.book_name)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <span>Start Practice</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteBook(book.book_name)}
                          disabled={deletingBook === book.book_name}
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Book"
                        >
                          {deletingBook === book.book_name ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            About Custom Content
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• Upload your own question sets in JSONL format</p>
            <p>• Use the same advanced practice and analysis tools with your content</p>
            <p>• Create personalized study materials for any subject</p>
            <p>• Download the template file to see the required format</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
