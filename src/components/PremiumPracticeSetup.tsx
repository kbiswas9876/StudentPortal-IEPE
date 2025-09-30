'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { PracticeSessionConfig, ChapterConfiguration } from '@/types/practice'
import PremiumBookCard from './PremiumBookCard'
import SessionSummaryPanel from './SessionSummaryPanel'
import SegmentedControl from './SegmentedControl'

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
}

export default function PremiumPracticeSetup({
  books,
  onSessionStart,
  onTotalQuestionsChange,
  onSessionConfigChange
}: PremiumPracticeSetupProps) {
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Record<string, ChapterData[]>>({})
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({})
  const [chapterConfigs, setChapterConfigs] = useState<Record<string, Record<string, ChapterConfiguration>>>({})
  
  // Final configuration state
  const [questionOrder, setQuestionOrder] = useState<'shuffle' | 'interleaved' | 'sequential'>('shuffle')
  const [testMode, setTestMode] = useState<'practice' | 'timed'>('practice')
  const [timeLimitInMinutes, setTimeLimitInMinutes] = useState(30)

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
          chapters: selectedChapters
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Start a New Practice Session
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Select your books and chapters, then configure your practice session with our premium interface
          </p>
        </motion.div>

        {/* Two-Column Layout with Equal Heights */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-12rem)]">
          {/* Left Column - Selection Zone */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Select Books & Chapters
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-2">
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

          {/* Right Column - Configuration Zone */}
          <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Card 1: Session Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Session Settings
                </h3>

                <div className="space-y-4">
                  {/* Question Order */}
                  <div className="space-y-3">
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
                  <div className="space-y-3">
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
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Time Limit (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={timeLimitInMinutes}
                            onChange={(e) => setTimeLimitInMinutes(parseInt(e.target.value) || 30)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Session Summary */}
              <SessionSummaryPanel
                totalQuestions={getTotalQuestions()}
                selectedChaptersByBook={getSelectedChaptersByBook()}
                questionOrder={questionOrder}
                testMode={testMode}
                timeLimitInMinutes={timeLimitInMinutes}
                estimatedDuration={getEstimatedDuration()}
              />

              {/* Card 3: Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-lg"
              >
                <motion.button
                  onClick={handleStartSession}
                  disabled={getTotalQuestions() === 0}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    getTotalQuestions() === 0
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={getTotalQuestions() > 0 ? { scale: 1.02 } : {}}
                  whileTap={getTotalQuestions() > 0 ? { scale: 0.98 } : {}}
                >
                  Start Practice Session
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
