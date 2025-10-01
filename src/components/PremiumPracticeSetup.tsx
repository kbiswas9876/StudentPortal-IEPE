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
type ChapterData = {
  chapter_name: string
  count: number
}

interface PremiumPracticeSetupProps {
  books: BookSource[]
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
  }, [chapterConfigs])

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
          timeLimitInMinutes: Math.round(timeLimitInSeconds / 60)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-4">
            Start a New Practice Session
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Select your books and chapters, then configure your practice session with our premium interface
          </p>
        </motion.div>

        {/* Mobile-First Layout */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8 lg:min-h-[calc(100vh-16rem)] pb-24 sm:pb-20 lg:pb-0">
          {/* Mobile: Books & Chapters First, Desktop: Left Column */}
          <div className="lg:col-span-3 flex flex-col">
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

          {/* Mobile: Settings Second, Desktop: Right Column */}
          <div className="lg:col-span-2 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col space-y-4 lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto lg:pr-2"
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

      {/* Sticky Action Footer */}
      <StickyActionFooter
        totalQuestions={getTotalQuestions()}
        onStartSession={handleStartSession}
        disabled={getTotalQuestions() === 0}
        loading={sessionLoading}
      />
    </div>
  )
}
