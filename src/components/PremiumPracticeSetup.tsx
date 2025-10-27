'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { PracticeSessionConfig, ChapterConfiguration } from '@/types/practice'
import PremiumBookCard from './PremiumBookCard'
import SessionSummaryPanel from './SessionSummaryPanel'
import SegmentedControl from './SegmentedControl'
import StickyActionFooter from './StickyActionFooter'
import { PremiumTimeInput } from './PremiumTimeInput'

type BookSource = Database['public']['Tables']['book_sources']['Row']

// Extended type for books with statistics
type BookSourceWithStats = BookSource & {
  totalChapters?: number
  totalQuestions?: number
}

type ChapterData = {
  chapter_name: string
  count: number
}

interface PremiumPracticeSetupProps {
  books: BookSourceWithStats[]
  onSessionStart: (config: PracticeSessionConfig) => void
  onTotalQuestionsChange: (total: number) => void
  onSessionConfigChange: (config: PracticeSessionConfig | null) => void
  sessionLoading?: boolean
}

export default function PremiumPracticeSetup({
  books,
  onSessionStart,
  onTotalQuestionsChange,
  onSessionConfigChange,
  sessionLoading = false
}: PremiumPracticeSetupProps) {
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Record<string, ChapterData[]>>({})
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({})
  const [chapterConfigs, setChapterConfigs] = useState<Record<string, Record<string, ChapterConfiguration>>>({})
  
  // Final configuration state
  const [questionOrder, setQuestionOrder] = useState<'shuffle' | 'interleaved' | 'sequential'>('shuffle')
  const [testMode, setTestMode] = useState<'practice' | 'timed'>('practice')
  const [timeLimitInSeconds, setTimeLimitInSeconds] = useState(1800) // 30 minutes in seconds
  const [hideMetadata, setHideMetadata] = useState(false) // Show metadata by default

  const questionOrderOptions = [
    { value: 'shuffle', label: 'Shuffle All' },
    { value: 'interleaved', label: 'Interleaved' },
    { value: 'sequential', label: 'Sequential' }
  ]

  const testModeOptions = [
    { value: 'practice', label: 'Practice Mode' },
    { value: 'timed', label: 'Timed Mode' }
  ]

  // Watch for changes in chapterConfigs and update total questions
  useEffect(() => {
    const total = getTotalQuestions()
    onTotalQuestionsChange(total)
    
    const sessionConfig = getCurrentSessionConfig()
    onSessionConfigChange(sessionConfig)
  }, [chapterConfigs, hideMetadata])

  const fetchChapters = async (bookCode: string) => {
    if (chapters[bookCode]) return

    setLoadingChapters(prev => ({ ...prev, [bookCode]: true }))
    
    try {
      const response = await fetch(`/api/chapters?bookCode=${encodeURIComponent(bookCode)}`)
      const result = await response.json()

      if (!response.ok) {
        console.error('Chapters API error:', result.error)
        setChapters(prev => ({ ...prev, [bookCode]: [] }))
        return
      }

      setChapters(prev => ({ ...prev, [bookCode]: result.data || [] }))
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setChapters(prev => ({ ...prev, [bookCode]: [] }))
    } finally {
      setLoadingChapters(prev => ({ ...prev, [bookCode]: false }))
    }
  }

  const handleBookSelect = (bookCode: string) => {
    setSelectedBook(bookCode)
    fetchChapters(bookCode)
  }

  const handleChapterSelect = (bookCode: string, chapterName: string, selected: boolean) => {
    // Get the chapter data to determine the maximum available questions
    const bookChapters = chapters[bookCode] || []
    const chapterData = bookChapters.find(ch => ch.chapter_name === chapterName)
    const maxQuestions = chapterData?.count || 1
    
    const newConfig: ChapterConfiguration = {
      selected,
      mode: 'quantity',
      values: { 
        count: selected ? Math.min(1, maxQuestions) : 0 
      }
    }

    setChapterConfigs(prev => ({
      ...prev,
      [bookCode]: {
        ...prev[bookCode],
        [chapterName]: newConfig
      }
    }))
  }

  const handleChapterConfigChange = (bookCode: string, chapterName: string, config: ChapterConfiguration) => {
    setChapterConfigs(prev => ({
      ...prev,
      [bookCode]: {
        ...prev[bookCode],
        [chapterName]: config
      }
    }))
  }


  const getTotalQuestions = () => {
    let total = 0
    
    Object.values(chapterConfigs).forEach(bookConfigs => {
      Object.values(bookConfigs).forEach(config => {
        if (config.selected) {
          if (config.mode === 'range') {
            const start = config.values.start || 1
            const end = config.values.end || 1
            const rangeTotal = Math.max(0, end - start + 1)
            total += rangeTotal
          } else {
            const count = config.values.count || 0
            total += count
          }
        }
      })
    })
    
    return total
  }

  const getSelectedChaptersByBook = () => {
    const selectedChaptersByBook: Record<string, Array<{ chapter: string; count: number }>> = {}
    
    Object.entries(chapterConfigs).forEach(([bookCode, bookConfigs]) => {
      const bookChapters: Array<{ chapter: string; count: number }> = []
      
      Object.entries(bookConfigs).forEach(([chapterName, config]) => {
        if (config.selected) {
          let count = 0
          if (config.mode === 'range') {
            const start = config.values.start || 1
            const end = config.values.end || 1
            count = Math.max(0, end - start + 1)
          } else {
            count = config.values.count || 0
          }
          
          // Only add if count is greater than 0
          if (count > 0) {
            bookChapters.push({ chapter: chapterName, count })
          }
        }
      })
      
      // Only add book if it has selected chapters
      if (bookChapters.length > 0) {
        selectedChaptersByBook[bookCode] = bookChapters
      }
    })
    
    return selectedChaptersByBook
  }

  const getEstimatedDuration = () => {
    const totalQuestions = getTotalQuestions()
    const averageTimePerQuestion = 60 // seconds
    const totalSeconds = totalQuestions * averageTimePerQuestion
    
    if (totalSeconds < 60) {
      return `~${totalSeconds} seconds`
    } else if (totalSeconds < 3600) {
      const minutes = Math.ceil(totalSeconds / 60)
      return `~${minutes} minute${minutes !== 1 ? 's' : ''}`
    } else {
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.ceil((totalSeconds % 3600) / 60)
      return `~${hours}h ${minutes}m`
    }
  }

  const getCurrentSessionConfig = (): PracticeSessionConfig | null => {
    const selectedConfigs: PracticeSessionConfig[] = []
    
    Object.entries(chapterConfigs).forEach(([bookCode, bookConfigs]) => {
      const selectedChapters = Object.entries(bookConfigs)
        .filter(([_, config]) => config.selected)
        .reduce((acc, [chapterName, config]) => {
          acc[chapterName] = config
          return acc
        }, {} as Record<string, ChapterConfiguration>)

      if (Object.keys(selectedChapters).length > 0) {
        selectedConfigs.push({
          bookCode,
          chapters: selectedChapters,
          testMode,
          questionOrder,
          timeLimitInMinutes: Math.round(timeLimitInSeconds / 60),
          hideMetadata
        })
      }
    })

    return selectedConfigs.length > 0 ? selectedConfigs[0] : null
  }


  const handleStartSession = () => {
    const sessionConfig = getCurrentSessionConfig()
    if (sessionConfig) {
      onSessionStart(sessionConfig)
    }
  }

  return (
    <div className="w-full">
      <div className="w-full px-0 py-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {/* Mobile-First Layout */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:min-h-[calc(100vh-12rem)] pb-24 sm:pb-20">
          {/* Mobile: Books & Chapters First, Desktop: Left Column (wider - 75% of space) */}
          <div className="lg:col-span-9 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Select Books & Chapters
              </h2>
              
              {/* Mobile: Full height, Desktop: Scrollable */}
              <div className="flex-1 lg:overflow-y-auto lg:pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                  {books.map((book) => (
                    <PremiumBookCard
                      key={book.id}
                      book={book}
                      isSelected={selectedBook === book.code}
                      chapters={chapters[book.code] || []}
                      loadingChapters={loadingChapters[book.code] || false}
                      chapterConfigs={chapterConfigs[book.code] || {}}
                      onBookSelect={handleBookSelect}
                      onChapterSelect={handleChapterSelect}
                      onChapterConfigChange={handleChapterConfigChange}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile: Settings Second, Desktop: Right Column (narrower - 25% of space) */}
          <div className="lg:col-span-3 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col space-y-4 lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto lg:pr-2 lg:border-t lg:border-b lg:border-slate-200 dark:lg:border-slate-700 lg:pt-4 lg:pb-4"
            >
              {/* Card 1: Session Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-lg"
              >
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                  Session Settings
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {/* Question Order */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Question Order
                    </label>
                    <SegmentedControl
                      options={questionOrderOptions}
                      value={questionOrder}
                      onChange={(value) => setQuestionOrder(value as 'shuffle' | 'interleaved' | 'sequential')}
                      className="w-full"
                    />
                  </div>

                  {/* Test Mode */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Test Mode
                    </label>
                    <SegmentedControl
                      options={testModeOptions}
                      value={testMode}
                      onChange={(value) => setTestMode(value as 'practice' | 'timed')}
                      className="w-full"
                    />
                    
                    {/* Time Limit Input */}
                    <AnimatePresence>
                      {testMode === 'timed' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="space-y-3"
                        >
                          <motion.div
                            className="flex items-center justify-between w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <motion.label
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              Time Limit
                            </motion.label>
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                            >
                              <PremiumTimeInput
                                defaultValue={timeLimitInSeconds}
                                onChange={(totalSeconds) => setTimeLimitInSeconds(totalSeconds)}
                              />
                            </motion.div>
                          </motion.div>
                          <motion.div 
                            className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Set the time limit for your practice session (HH:MM:SS format)</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Question Metadata Toggle */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Question Metadata
                    </label>
                    <button
                      onClick={() => setHideMetadata(!hideMetadata)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {!hideMetadata ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          )}
                        </svg>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Show Question Metadata
                        </span>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!hideMetadata ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!hideMetadata ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{!hideMetadata ? 'Metadata is shown' : 'Metadata is hidden'} during practice</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Session Summary */}
              <div className="flex-shrink-0">
                <SessionSummaryPanel
                  selectedChaptersByBook={getSelectedChaptersByBook()}
                  questionOrder={questionOrder}
                  testMode={testMode}
                  timeLimitInMinutes={Math.round(timeLimitInSeconds / 60)}
                  estimatedDuration={getEstimatedDuration()}
                />
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer - Always Visible on All Screen Sizes */}
      <StickyActionFooter
        totalQuestions={getTotalQuestions()}
        onStartSession={handleStartSession}
        disabled={getTotalQuestions() === 0}
        loading={sessionLoading}
      />
    </div>
  )
}
