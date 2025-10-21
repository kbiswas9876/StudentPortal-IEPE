'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { ClockIcon, CheckCircleIcon, XCircleIcon, TagIcon, DocumentTextIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface BookmarkData {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  user_difficulty_rating: number | null
  created_at: string
  updated_at: string
}

interface AttemptHistoryItem {
  status: string
  time_taken: number
  created_at: string
}

interface HistoryData {
  bookmark: BookmarkData | null
  attemptHistory: AttemptHistoryItem[]
}

interface BookmarkHistoryProps {
  questionId: string
}

const difficultyLabels = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard'
}

const difficultyColors = {
  1: 'text-green-600 bg-green-50 border-green-200',
  2: 'text-green-600 bg-green-50 border-green-200',
  3: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  4: 'text-orange-600 bg-orange-50 border-orange-200',
  5: 'text-red-600 bg-red-50 border-red-200'
}

export default function BookmarkHistory({ questionId }: BookmarkHistoryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  
  // Edit mode states
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  
  // Temporary edit values
  const [tempRating, setTempRating] = useState<number>(0)
  const [tempTags, setTempTags] = useState<string>('')
  const [tempNote, setTempNote] = useState<string>('')
  
  // Loading states for individual edits
  const [isSavingRating, setIsSavingRating] = useState(false)
  const [isSavingTags, setIsSavingTags] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/revision-hub/history?questionId=${questionId}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch bookmark history')
        }
        
        setHistoryData(result.data)
      } catch (err) {
        console.error('Error fetching bookmark history:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch bookmark history')
      } finally {
        setIsLoading(false)
      }
    }

    if (questionId) {
      fetchHistoryData()
    }
  }, [questionId])

  // API call functions for updating bookmark data
  const updateBookmarkField = async (field: string, value: any) => {
    if (!historyData?.bookmark) return

    try {
      // Map field names to API expected names
      const apiFieldMap: Record<string, string> = {
        'user_difficulty_rating': 'rating',
        'custom_tags': 'customTags',
        'personal_note': 'personalNote'
      }

      const apiField = apiFieldMap[field] || field
      const requestBody: any = {
        bookmarkId: historyData.bookmark.id
      }
      requestBody[apiField] = value

      const response = await fetch(`/api/revision-hub/bookmarks/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update bookmark')
      }

      return true
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      throw error
    }
  }

  // Edit handlers
  const handleStartEditRating = () => {
    if (historyData?.bookmark) {
      setTempRating(historyData.bookmark.user_difficulty_rating || 0)
      setIsEditingRating(true)
    }
  }

  const handleSaveRating = async () => {
    if (!historyData?.bookmark) return

    try {
      setIsSavingRating(true)
      
      // Optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            user_difficulty_rating: tempRating
          }
        }
      })

      await updateBookmarkField('user_difficulty_rating', tempRating)
      setIsEditingRating(false)
    } catch (error) {
      // Revert optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            user_difficulty_rating: historyData.bookmark?.user_difficulty_rating ?? null
          }
        }
      })
      alert('Failed to update rating. Please try again.')
    } finally {
      setIsSavingRating(false)
    }
  }

  const handleCancelRating = () => {
    setIsEditingRating(false)
    setTempRating(0)
  }

  const handleStartEditTags = () => {
    if (historyData?.bookmark) {
      setTempTags(historyData.bookmark.custom_tags?.join(', ') || '')
      setIsEditingTags(true)
    }
  }

  const handleSaveTags = async () => {
    if (!historyData?.bookmark) return

    try {
      setIsSavingTags(true)
      const tagsArray = tempTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      // Optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            custom_tags: tagsArray
          }
        }
      })

      await updateBookmarkField('custom_tags', tagsArray)
      setIsEditingTags(false)
    } catch (error) {
      // Revert optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            custom_tags: historyData.bookmark?.custom_tags ?? null
          }
        }
      })
      alert('Failed to update tags. Please try again.')
    } finally {
      setIsSavingTags(false)
    }
  }

  const handleCancelTags = () => {
    setIsEditingTags(false)
    setTempTags('')
  }

  const handleStartEditNote = () => {
    if (historyData?.bookmark) {
      setTempNote(historyData.bookmark.personal_note || '')
      setIsEditingNote(true)
    }
  }

  const handleSaveNote = async () => {
    if (!historyData?.bookmark) return

    try {
      setIsSavingNote(true)
      
      // Optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            personal_note: tempNote
          }
        }
      })

      await updateBookmarkField('personal_note', tempNote)
      setIsEditingNote(false)
    } catch (error) {
      // Revert optimistic update
      setHistoryData(prev => {
        if (!prev?.bookmark) return prev
        return {
          ...prev,
          bookmark: {
            ...prev.bookmark,
            personal_note: historyData.bookmark?.personal_note ?? null
          }
        }
      })
      alert('Failed to update note. Please try again.')
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleCancelNote = () => {
    setIsEditingNote(false)
    setTempNote('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'incorrect':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      case 'skipped':
        return <ClockIcon className="h-4 w-4 text-gray-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'incorrect':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'skipped':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 mb-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <XCircleIcon className="h-5 w-5" />
          <span className="font-medium">Error loading bookmark history</span>
        </div>
        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
      </motion.div>
    )
  }

  if (!historyData || !historyData.bookmark) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <ClockIcon className="h-5 w-5" />
          <span className="font-medium">No bookmark data found</span>
        </div>
        <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
          This question hasn&apos;t been bookmarked yet.
        </p>
      </motion.div>
    )
  }

  const { bookmark, attemptHistory } = historyData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            My Bookmark Details & History
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your personal insights and performance history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Initial Assessment & Personalization */}
        <div className="space-y-6">
          {/* My Rating (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                My Rating
              </h4>
              {!isEditingRating ? (
                <button
                  onClick={handleStartEditRating}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Edit rating"
                >
                  <PencilIcon className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveRating}
                    disabled={isSavingRating}
                    className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                    title="Save rating"
                  >
                    <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelRating}
                    disabled={isSavingRating}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    title="Cancel editing"
                  >
                    <XMarkIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            
            {!isEditingRating ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <StarSolidIcon
                      key={rating}
                      className={`h-5 w-5 ${
                        rating <= (bookmark.user_difficulty_rating || 0)
                          ? 'text-yellow-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  difficultyColors[bookmark.user_difficulty_rating as keyof typeof difficultyColors] || 'text-gray-600 bg-gray-50 border-gray-200'
                }`}>
                  {difficultyLabels[bookmark.user_difficulty_rating as keyof typeof difficultyLabels] || 'Not rated'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setTempRating(rating)}
                      disabled={isSavingRating}
                      className="transition-colors disabled:opacity-50"
                    >
                      {rating <= tempRating ? (
                        <StarSolidIcon className="h-6 w-6 text-yellow-500 hover:text-yellow-600" />
                      ) : (
                        <StarOutlineIcon className="h-6 w-6 text-slate-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  difficultyColors[tempRating as keyof typeof difficultyColors] || 'text-gray-600 bg-gray-50 border-gray-200'
                }`}>
                  {difficultyLabels[tempRating as keyof typeof difficultyLabels] || 'Not rated'}
                </span>
                {isSavingRating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                )}
              </div>
            )}
          </div>

          {/* Personal Tags (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-blue-500" />
                My Tags
              </h4>
              {!isEditingTags ? (
                <button
                  onClick={handleStartEditTags}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Edit tags"
                >
                  <PencilIcon className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveTags}
                    disabled={isSavingTags}
                    className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                    title="Save tags"
                  >
                    <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelTags}
                    disabled={isSavingTags}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    title="Cancel editing"
                  >
                    <XMarkIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            
            {!isEditingTags ? (
              bookmark.custom_tags && bookmark.custom_tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {bookmark.custom_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">No tags added</p>
              )
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempTags}
                  onChange={(e) => setTempTags(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., important, review, difficult)"
                  disabled={isSavingTags}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Separate multiple tags with commas
                </p>
                {isSavingTags && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Saving tags...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Personal Note (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 text-purple-500" />
                My Note
              </h4>
              {!isEditingNote ? (
                <button
                  onClick={handleStartEditNote}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Edit note"
                >
                  <PencilIcon className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                    title="Save note"
                  >
                    <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelNote}
                    disabled={isSavingNote}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    title="Cancel editing"
                  >
                    <XMarkIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            
            {!isEditingNote ? (
              bookmark.personal_note ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {bookmark.personal_note}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">No note added</p>
              )
            ) : (
              <div className="space-y-2">
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="Add your personal notes about this question..."
                  disabled={isSavingNote}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
                />
                {isSavingNote && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Saving note...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attempt History & SRS State */}
        <div className="space-y-6">
          {/* Attempt History */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-green-500" />
              Attempt History
            </h4>
            {attemptHistory && attemptHistory.length > 0 ? (
              <div className="space-y-3">
                {attemptHistory.map((attempt, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Attempt on {formatDate(attempt.created_at)}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attempt.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                          {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>Time taken: {formatTime(attempt.time_taken)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">No attempt history found</p>
            )}
          </div>

          {/* SRS State - NEW SECTION */}
          {(bookmark as any).srs_interval !== undefined && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                SRS Status
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reviews</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {(bookmark as any).srs_repetitions || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Interval</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {(bookmark as any).srs_interval || 0} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ease Factor</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {((bookmark as any).srs_ease_factor || 2.5).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next Review</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {(bookmark as any).next_review_date 
                        ? formatDate((bookmark as any).next_review_date + 'T00:00:00')
                        : 'Today'}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                    {(bookmark as any).srs_interval === 0 
                      ? "🌱 New question - Complete your first review!"
                      : (bookmark as any).srs_interval < 7
                      ? "📚 Learning stage - Building familiarity"
                      : (bookmark as any).srs_interval < 30
                      ? "📈 Maturing - Making great progress!"
                      : "🎓 Mastered - Long-term retention achieved!"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
