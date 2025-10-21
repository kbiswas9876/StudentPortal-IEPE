'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Database } from '@/types/database'
import RevisionChapterNav from '@/components/RevisionChapterNav'
import BookmarkedQuestionCard from '@/components/BookmarkedQuestionCard'
import RevisionSessionModal from '@/components/RevisionSessionModal'
import AdvancedRevisionSessionModal from '@/components/AdvancedRevisionSessionModal'
import DifficultyBreakdown from '@/components/DifficultyBreakdown'
import BookmarkRemovalModal from '@/components/BookmarkRemovalModal'
import DueQuestionsCard from '@/components/DueQuestionsCard'
import { FunnelIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Archive, Play } from 'lucide-react'
import type { DueQuestion } from '@/lib/srs/types'

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
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [chapters, setChapters] = useState<ChapterData[]>([])
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([])
  
  const [loadingChapters, setLoadingChapters] = useState(true)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SRS Due Questions state
  const [dueQuestions, setDueQuestions] = useState<DueQuestion[]>([])
  const [loadingDueQuestions, setLoadingDueQuestions] = useState(true)
  const [showLibrary, setShowLibrary] = useState(false)

  // Filter and Sort states
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<'none' | 'high-to-low' | 'low-to-high'>('none')

  // Revision Session states
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [useAdvancedModal, setUseAdvancedModal] = useState(true) // Toggle between simple and advanced modal
  
  // Bookmark removal states
  const [showRemovalModal, setShowRemovalModal] = useState(false)
  const [removalQuestionId, setRemovalQuestionId] = useState<string | null>(null)
  const [removalQuestionText, setRemovalQuestionText] = useState('')
  const [removalUserRating, setRemovalUserRating] = useState<number>(1)
  const [isBulkRemoval, setIsBulkRemoval] = useState(false)
  const [bulkDifficultyBreakdown, setBulkDifficultyBreakdown] = useState<{ [rating: number]: number }>({})
  
  // Bulk selection states
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  // State persistence - prevent unnecessary reloads
  const dataFetchedRef = React.useRef(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isFilterDropdownOpen && !target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false)
      }
    }

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterDropdownOpen])

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
      fetchDueQuestions()
      dataFetchedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  // Fetch due questions for SRS
  const fetchDueQuestions = async () => {
    try {
      setLoadingDueQuestions(true)
      console.log('Fetching due questions for user:', user?.id)

      const response = await fetch(`/api/revision-hub/due-questions?userId=${user?.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch due questions')
      }

      console.log('Due questions fetched successfully:', result)
      setDueQuestions(result.questions || [])
    } catch (error) {
      console.error('Error fetching due questions:', error)
      // Don't show error to user - just log it and continue
      setDueQuestions([])
    } finally {
      setLoadingDueQuestions(false)
    }
  }

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
    // Reset filters when changing chapters
    setSelectedRatingFilter(null)
    setSortOrder('none')
  }

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let result = [...bookmarkedQuestions]

    // Apply rating filter
    if (selectedRatingFilter !== null) {
      result = result.filter(q => q.user_difficulty_rating === selectedRatingFilter)
    }

    // Apply sorting
    if (sortOrder === 'high-to-low') {
      result.sort((a, b) => {
        const ratingA = a.user_difficulty_rating || 0
        const ratingB = b.user_difficulty_rating || 0
        return ratingB - ratingA
      })
    } else if (sortOrder === 'low-to-high') {
      result.sort((a, b) => {
        const ratingA = a.user_difficulty_rating || 0
        const ratingB = b.user_difficulty_rating || 0
        return ratingA - ratingB
      })
    }

    return result
  }, [bookmarkedQuestions, selectedRatingFilter, sortOrder])

  // Toggle rating filter
  const handleRatingFilterClick = (rating: number) => {
    if (selectedRatingFilter === rating) {
      setSelectedRatingFilter(null) // Clear filter if clicking the same rating
    } else {
      setSelectedRatingFilter(rating)
    }
  }

  // Handle bookmark removal - show confirmation modal
  const handleRemoveBookmark = (questionId: string) => {
    const question = bookmarkedQuestions.find(q => q.question_id === questionId)
    if (!question) return

    setRemovalQuestionId(questionId)
    setRemovalQuestionText(question.questions.question_text)
    setRemovalUserRating(question.user_difficulty_rating || 1)
    setIsBulkRemoval(false)
    setShowRemovalModal(true)
  }

  // Handle bulk bookmark removal
  const handleBulkRemoveBookmarks = () => {
    if (selectedQuestions.size === 0) return

    // Calculate difficulty breakdown for selected questions
    const breakdown: { [rating: number]: number } = {}
    selectedQuestions.forEach(questionId => {
      const question = bookmarkedQuestions.find(q => q.question_id === questionId)
      if (question) {
        const rating = question.user_difficulty_rating || 1
        breakdown[rating] = (breakdown[rating] || 0) + 1
      }
    })

    setBulkDifficultyBreakdown(breakdown)
    setIsBulkRemoval(true)
    setRemovalQuestionId(null)
    setRemovalQuestionText('')
    setShowRemovalModal(true)
  }

  // Confirm bookmark removal
  const handleConfirmRemoval = async () => {
    if (!user || !session) return

    try {
      if (isBulkRemoval) {
        // Remove multiple bookmarks
        const questionIds = Array.from(selectedQuestions)
        for (const questionId of questionIds) {
          const response = await fetch('/api/practice/bookmark', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ questionId }),
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Failed to remove bookmark')
          }
        }
        
        // Clear selection
        setSelectedQuestions(new Set())
        setShowBulkActions(false)
      } else {
        // Remove single bookmark
        if (!removalQuestionId) return

        const response = await fetch('/api/practice/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ questionId: removalQuestionId }),
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Failed to remove bookmark')
        }
      }

      // Refresh the questions to update the UI
      if (selectedChapter) {
        await fetchQuestionsForChapter(selectedChapter)
      }

      setShowRemovalModal(false)
    } catch (error) {
      console.error('Error removing bookmark:', error)
      alert('Failed to remove bookmark. Please try again.')
    }
  }

  // Handle question selection for bulk actions
  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    const newSelected = new Set(selectedQuestions)
    if (selected) {
      newSelected.add(questionId)
    } else {
      newSelected.delete(questionId)
    }
    setSelectedQuestions(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  // Revision Session handlers
  const handleChapterSelectionChange = (chapter: string, selected: boolean) => {
    if (selected) {
      setSelectedChapters(prev => [...prev, chapter])
    } else {
      setSelectedChapters(prev => prev.filter(c => c !== chapter))
    }
  }

  const handleSelectAllChapters = () => {
    setSelectedChapters(chapters.map(c => c.name))
  }

  const handleDeselectAllChapters = () => {
    setSelectedChapters([])
  }

  const handleStartRevisionSession = () => {
    setIsSessionModalOpen(true)
  }

  const handleStartSession = async (config: any) => {
    try {
      // Get all question IDs from selected chapters
      const selectedChapterNames = selectedChapters
      
      const questionPromises = selectedChapterNames.map(async (chapterName) => {
        const response = await fetch(`/api/revision-hub/by-chapter?userId=${user?.id}&chapterName=${encodeURIComponent(chapterName)}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `Failed to fetch questions for chapter: ${chapterName}`)
        }
        
        return result.data || []
      })
      
      const allQuestions = await Promise.all(questionPromises)
      const questionIds = allQuestions.flat().map((q: any) => q.questions.id)
      
      if (questionIds.length === 0) {
        throw new Error('No questions found in the selected chapters. Please select chapters with bookmarked questions.')
      }
      
      // Apply question scope
      let finalQuestionIds = questionIds
      if (config.questionScope === 'random' && config.questionCount) {
        // Shuffle and take the specified number
        const shuffled = [...questionIds].sort(() => Math.random() - 0.5)
        finalQuestionIds = shuffled.slice(0, config.questionCount)
      }
      
      // Navigate to practice with the questions
      const params = new URLSearchParams({
        questions: finalQuestionIds.join(','),
        mode: config.testMode,
        source: 'revision', // Add revision source tracking
        ...(config.timeLimit && { timeLimit: config.timeLimit.toString() })
      })
      
      router.push(`/practice?${params.toString()}`)
      setIsSessionModalOpen(false)
    } catch (error) {
      console.error('Error starting revision session:', error)
      // Re-throw the error so the modal can handle it
      throw error
    }
  }

  const handleStartDailyReview = async () => {
    try {
      if (dueQuestions.length === 0) return

      // Get all question_ids from due questions
      const questionIds = dueQuestions.map(q => q.question_id)

      // Navigate to practice with the due questions
      const params = new URLSearchParams({
        questions: questionIds.join(','),
        mode: 'zen', // Use zen mode for focused review
        source: 'srs-daily-review',
      })

      router.push(`/practice?${params.toString()}`)
    } catch (error) {
      console.error('Error starting daily review:', error)
      alert('Failed to start daily review. Please try again.')
    }
  }

  const handleAdvancedStartSession = async (config: any) => {
    try {
      console.log('🚀 Starting Advanced Session with config:', config)
      const allQuestionIds: string[] = []
      
      // Process each chapter configuration
      for (const chapterConfig of config.chapterConfigs) {
        console.log(`📚 Processing chapter: ${chapterConfig.chapterName}`)
        console.log(`📋 Chapter config:`, chapterConfig)
        
        const response = await fetch(`/api/revision-hub/by-chapter?userId=${user?.id}&chapterName=${encodeURIComponent(chapterConfig.chapterName)}`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `Failed to fetch questions for chapter: ${chapterConfig.chapterName}`)
        }
        
        const chapterQuestions = result.data || []
        
        console.log(`📊 Found ${chapterQuestions.length} questions for ${chapterConfig.chapterName}`)
        console.log('📋 Chapter questions:', chapterQuestions)
        
        let chapterQuestionIds: string[] = []
        
        if (chapterConfig.questionScope === 'all') {
          chapterQuestionIds = chapterQuestions.map((q: any) => q.questions.question_id)
          console.log(`✅ All questions selected: ${chapterQuestionIds.length} questions`)
        } else if (chapterConfig.questionScope === 'random') {
          const shuffled = [...chapterQuestions].sort(() => Math.random() - 0.5)
          chapterQuestionIds = shuffled.slice(0, chapterConfig.questionCount || 0).map((q: any) => q.questions.question_id)
          console.log(`🎲 Random selection: ${chapterQuestionIds.length} questions (requested: ${chapterConfig.questionCount})`)
        } else if (chapterConfig.questionScope === 'difficulty') {
          console.log(`⭐ Difficulty-based selection for ${chapterConfig.chapterName}`)
          console.log('📊 Difficulty breakdown:', chapterConfig.difficultyBreakdown)
          
          // Filter by difficulty ratings
          const difficultyFiltered = chapterQuestions.filter((q: any) => {
            const rating = q.user_difficulty_rating
            return rating && chapterConfig.difficultyBreakdown?.[rating] > 0
          })
          
          console.log(`🔍 Difficulty filtered questions: ${difficultyFiltered.length}`)
          
          // Apply difficulty-based selection
          const selectedByDifficulty: string[] = []
          for (const [rating, count] of Object.entries(chapterConfig.difficultyBreakdown || {})) {
            const ratingNum = parseInt(rating)
            const countNum = typeof count === 'number' ? count : 0
            const questionsOfRating = difficultyFiltered.filter((q: any) => q.user_difficulty_rating === ratingNum)
            const shuffled = [...questionsOfRating].sort(() => Math.random() - 0.5)
            const selected = shuffled.slice(0, countNum).map((q: any) => q.questions.question_id)
            selectedByDifficulty.push(...selected)
            
            console.log(`⭐ Rating ${rating}: ${questionsOfRating.length} available, ${countNum} requested, ${selected.length} selected`)
          }
          chapterQuestionIds = selectedByDifficulty
          console.log(`✅ Difficulty selection result: ${chapterQuestionIds.length} questions`)
        }
        
        console.log(`📝 Final chapter question IDs:`, chapterQuestionIds)
        allQuestionIds.push(...chapterQuestionIds)
      }
      
      console.log(`🎯 Total question IDs collected: ${allQuestionIds.length}`)
      console.log('📋 All question IDs:', allQuestionIds)
      
      // Validate that we have questions
      if (allQuestionIds.length === 0) {
        console.error('❌ No questions found for the selected configuration!')
        console.error('📋 Config that failed:', config)
        throw new Error('No questions found for the selected configuration. Please check your selections and try again.')
      }
      
      // Validate that all question IDs are strings (not numbers)
      const invalidIds = allQuestionIds.filter(id => typeof id !== 'string' || id === '')
      if (invalidIds.length > 0) {
        console.error('❌ Invalid question IDs found:', invalidIds)
        throw new Error('Invalid question data detected. Please try again.')
      }
      
      // Navigate to practice with the questions
      const params = new URLSearchParams({
        questions: allQuestionIds.join(','),
        mode: config.testMode,
        source: 'revision', // Add revision source tracking
        fresh: 'true', // Signal that this is a fresh start
        ...(config.timeLimit && { timeLimit: config.timeLimit.toString() })
      })
      
      console.log(`🔗 Navigating to practice with params:`, params.toString())
      router.push(`/practice?${params.toString()}`)
      setIsSessionModalOpen(false)
    } catch (error) {
      console.error('❌ Error starting advanced revision session:', error)
      // Re-throw the error so the modal can handle it
      throw error
    }
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

  // Empty state - show two-column layout even when empty
  if (chapters.length === 0 && !loadingChapters) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Two-Column Layout - Empty State */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Left Column - Chapter Navigation (Empty) */}
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
                  selectedChapters={selectedChapters}
                  onChapterSelectionChange={handleChapterSelectionChange}
                  onSelectAllChapters={handleSelectAllChapters}
                  onDeselectAllChapters={handleDeselectAllChapters}
                  onStartRevisionSession={handleStartRevisionSession}
                />
              </div>
            </motion.div>

            {/* Right Column - Empty State */}
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
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Your Revision Collection is Empty
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Empty State Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                        <BookmarkIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                      Your Revision Collection is Empty
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm leading-relaxed">
                      Start bookmarking questions after your practice sessions. They will appear here, ready for you to review and master!
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <Play className="h-5 w-5" strokeWidth={2.5} />
                      Start Practicing
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-y-auto">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 force-scrollbar" style={{ minHeight: '100vh' }}>
        {/* Compact notification for users with no due questions */}
        {dueQuestions.length === 0 && !loadingDueQuestions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex justify-end"
          >
            <DueQuestionsCard
              dueCount={dueQuestions.length}
              totalBookmarks={bookmarkedQuestions.length}
              isLoading={loadingDueQuestions}
              onStartReview={handleStartDailyReview}
              onBrowseLibrary={() => setShowLibrary(true)}
              compact={true}
            />
          </motion.div>
        )}

        {/* Due Questions Card - Full version only for users with due questions */}
        {dueQuestions.length > 0 && (
          <DueQuestionsCard
            dueCount={dueQuestions.length}
            totalBookmarks={bookmarkedQuestions.length}
            isLoading={loadingDueQuestions}
            onStartReview={handleStartDailyReview}
            onBrowseLibrary={() => setShowLibrary(true)}
          />
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ height: 'calc(100vh - 280px)', maxHeight: 'none', minHeight: '650px' }}>
          {/* Left Column - Chapter Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col h-full"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden">
              <RevisionChapterNav
                chapters={chapters}
                selectedChapter={selectedChapter}
                onSelectChapter={handleSelectChapter}
                isLoading={loadingChapters}
                selectedChapters={selectedChapters}
                onChapterSelectionChange={handleChapterSelectionChange}
                onSelectAllChapters={handleSelectAllChapters}
                onDeselectAllChapters={handleDeselectAllChapters}
                onStartRevisionSession={handleStartRevisionSession}
              />
            </div>
          </motion.div>

          {/* Right Column - Question Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-9 flex flex-col h-full"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col overflow-hidden backdrop-blur-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {selectedChapter ? (
                      <>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                          {selectedChapter}
                        </h2>
                        
                        {/* Difficulty Breakdown */}
                        {bookmarkedQuestions.length > 0 && (
                          <DifficultyBreakdown 
                            questions={bookmarkedQuestions}
                            className="mb-2"
                            onRatingClick={handleRatingFilterClick}
                            selectedRating={selectedRatingFilter}
                          />
                        )}
                        
                        {/* Question Count Summary */}
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>
                            {filteredAndSortedQuestions.length} 
                            {selectedRatingFilter || sortOrder !== 'none' ? ' filtered' : ''} 
                            {' '}question{filteredAndSortedQuestions.length !== 1 ? 's' : ''}
                            {bookmarkedQuestions.length !== filteredAndSortedQuestions.length && (
                              <span className="text-xs text-slate-500"> (of {bookmarkedQuestions.length} total)</span>
                            )}
                          </span>
                          {filteredAndSortedQuestions.length > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              • Click any card to expand
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Select a chapter
                      </h2>
                    )}
                  </div>

                  {/* Filter/Sort Button */}
                  {selectedChapter && bookmarkedQuestions.length > 0 && (
                    <div className="relative filter-dropdown-container">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedRatingFilter || sortOrder !== 'none'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        } hover:shadow-md`}
                        title="Filter and Sort"
                      >
                        <FunnelIcon className="h-5 w-5" />
                      </motion.button>

                      {/* Filter Dropdown */}
                      <AnimatePresence>
                        {isFilterDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                          >
                            <div className="p-4 space-y-4">
                              {/* Filter by Rating */}
                              <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                  Filter by Rating
                                </h3>
                                <div className="flex gap-2 justify-between">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <motion.button
                                      key={rating}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRatingFilterClick(rating)}
                                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                        selectedRatingFilter === rating
                                          ? 'bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500'
                                          : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                                      }`}
                                    >
                                      <StarSolidIcon className={`h-5 w-5 ${
                                        selectedRatingFilter === rating
                                          ? 'text-yellow-500'
                                          : 'text-slate-400 dark:text-slate-500'
                                      }`} />
                                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {rating}
                                      </span>
                                    </motion.button>
                                  ))}
                                </div>
                                {selectedRatingFilter && (
                                  <button
                                    onClick={() => setSelectedRatingFilter(null)}
                                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Clear filter
                                  </button>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-slate-200 dark:border-slate-700"></div>

                              {/* Sort by Rating */}
                              <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                  Sort by Rating
                                </h3>
                                <div className="space-y-2">
                                  <button
                                    onClick={() => setSortOrder('high-to-low')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                      sortOrder === 'high-to-low'
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                                  >
                                    High to Low (5 → 1)
                                  </button>
                                  <button
                                    onClick={() => setSortOrder('low-to-high')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                      sortOrder === 'low-to-high'
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                                  >
                                    Low to High (1 → 5)
                                  </button>
                                  {sortOrder !== 'none' && (
                                    <button
                                      onClick={() => setSortOrder('none')}
                                      className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Clear sorting
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 force-scrollbar" style={{ height: '0px' }}>
                <div className="space-y-4" style={{ paddingBottom: '30px' }}>
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
                ) : filteredAndSortedQuestions.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <p className="text-lg mb-2">No questions match your filters</p>
                      <button
                        onClick={() => {
                          setSelectedRatingFilter(null)
                          setSortOrder('none')
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Contextual Bulk Actions Bar - Only appears when questions are selected */}
                    {showBulkActions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''} Selected
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Choose an action for the selected questions
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05, rotate: 1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedQuestions(new Set())
                                setShowBulkActions(false)
                              }}
                              className="group relative px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg hover:shadow-xl"
                            >
                              {/* Shine effect overlay */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                              
                              <span className="relative z-10">Cancel</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05, rotate: -1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleBulkRemoveBookmarks}
                              className="group relative px-6 py-3 bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 border border-red-400/30"
                            >
                              {/* Shine effect overlay */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                              
                              {/* Subtle glow effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400/30 to-pink-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                              
                              <Archive className="h-5 w-5 drop-shadow-sm relative z-10" strokeWidth={2.5} />
                              <span className="relative z-10 drop-shadow-sm">Remove Selected</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State - Show when no questions */}
                    {filteredAndSortedQuestions.length === 0 && !loadingQuestions ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center py-12 px-6 text-center"
                      >
                        <div className="mb-6">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                            <BookmarkIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                          Your Revision Collection is Empty
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm leading-relaxed">
                          Start bookmarking questions after your practice sessions. They will appear here, ready for you to review and master!
                        </p>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push('/dashboard')}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                          <Play className="h-5 w-5" strokeWidth={2.5} />
                          Start Practicing
                        </motion.button>
                      </motion.div>
                    ) : (
                      /* Questions List */
                      filteredAndSortedQuestions.map((question, index) => (
                        <BookmarkedQuestionCard
                          key={question.id}
                          question={question}
                          index={index}
                          onRemove={handleRemoveBookmark}
                          isSelected={selectedQuestions.has(question.question_id)}
                          onSelect={handleQuestionSelect}
                        />
                      ))
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom spacing to ensure page scrollbar functionality */}
        <div className="h-20"></div>
      </div>

      {/* Revision Session Modal */}
      {useAdvancedModal ? (
        <AdvancedRevisionSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          selectedChapters={selectedChapters}
          chapters={chapters}
          userId={user?.id || ''}
          onStartSession={handleAdvancedStartSession}
        />
      ) : (
        <RevisionSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          selectedChapters={selectedChapters}
          chapters={chapters}
          onStartSession={handleStartSession}
        />
      )}

      {/* Bookmark Removal Confirmation Modal */}
      <BookmarkRemovalModal
        isOpen={showRemovalModal}
        onClose={() => setShowRemovalModal(false)}
        onConfirm={handleConfirmRemoval}
        questionText={removalQuestionText}
        questionId={removalQuestionId || ''}
        isBulk={isBulkRemoval}
        bulkCount={selectedQuestions.size}
        chapterNames={isBulkRemoval ? [selectedChapter || ''] : []}
        userDifficultyRating={removalUserRating}
        bulkDifficultyBreakdown={bulkDifficultyBreakdown}
      />
    </div>
  )
}
