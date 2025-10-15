'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
// Removed direct Supabase import - using API routes instead
import { Database } from '@/types/database'
import { ChapterConfiguration, PracticeSessionConfig } from '@/types/practice'
import CustomCheckbox from './CustomCheckbox'
import ChapterConfigPanel from './ChapterConfigPanel'

type BookSource = Database['public']['Tables']['book_sources']['Row']
type ChapterData = {
  chapter_name: string
  count: number
}

interface BookAccordionProps {
  books: BookSource[]
  onSessionStart: (config: PracticeSessionConfig) => void
  onTotalQuestionsChange: (total: number) => void
  onSessionConfigChange: (config: PracticeSessionConfig | null) => void
}

const BookAccordion = forwardRef<any, BookAccordionProps>(({ books, onSessionStart, onTotalQuestionsChange, onSessionConfigChange }, ref) => {
  const [expandedBook, setExpandedBook] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Record<string, ChapterData[]>>({})
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({})
  const [chapterConfigs, setChapterConfigs] = useState<Record<string, Record<string, ChapterConfiguration>>>({})

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentSessionConfig
  }))

  // Watch for changes in chapterConfigs and update total questions
  useEffect(() => {
    const total = getTotalQuestions()
    console.log('Chapter configs changed, updating total questions:', total)
    onTotalQuestionsChange(total)
    
    // Also update session configuration
    const sessionConfig = getCurrentSessionConfig()
    onSessionConfigChange(sessionConfig)
  }, [chapterConfigs]) // Removed onTotalQuestionsChange from dependencies

  const fetchChapters = async (bookCode: string) => {
    if (chapters[bookCode]) return // Already cached

    console.log('Fetching chapters for book:', bookCode)
    setLoadingChapters(prev => ({ ...prev, [bookCode]: true }))
    
    try {
      const response = await fetch(`/api/chapters?bookCode=${encodeURIComponent(bookCode)}`)
      const result = await response.json()

      console.log('Chapters API result:', result)

      if (!response.ok) {
        console.error('Chapters API error:', result.error)
        setChapters(prev => ({ ...prev, [bookCode]: [] }))
        return
      }

      if (!result.data || result.data.length === 0) {
        console.log('No chapters found for book:', bookCode)
        setChapters(prev => ({ ...prev, [bookCode]: [] }))
        return
      }

      console.log('Processed chapters:', result.data)
      setChapters(prev => ({ ...prev, [bookCode]: result.data }))
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setChapters(prev => ({ ...prev, [bookCode]: [] }))
    } finally {
      setLoadingChapters(prev => ({ ...prev, [bookCode]: false }))
    }
  }

  const handleBookClick = (bookCode: string) => {
    if (expandedBook === bookCode) {
      setExpandedBook(null)
    } else {
      setExpandedBook(bookCode)
      fetchChapters(bookCode)
    }
  }

  const handleChapterSelect = (bookCode: string, chapterName: string, selected: boolean) => {
    const newConfig: ChapterConfiguration = {
      selected,
      mode: 'quantity',
      values: { count: 1 }
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
    console.log('Calculating total questions from configs:', chapterConfigs)
    
    Object.values(chapterConfigs).forEach(bookConfigs => {
      Object.values(bookConfigs).forEach(config => {
        console.log('Processing config:', config)
        if (config.selected) {
          if (config.mode === 'range') {
            const start = config.values.start || 1
            const end = config.values.end || 1
            const rangeTotal = Math.max(0, end - start + 1)
            total += rangeTotal
            console.log(`Range mode: ${start}-${end} = ${rangeTotal} questions`)
          } else {
            const count = config.values.count || 0
            total += count
            console.log(`Quantity mode: ${count} questions`)
          }
        }
      })
    })
    
    console.log('Total questions calculated:', total)
    return total
  }

  const getCurrentSessionConfig = (): PracticeSessionConfig | null => {
    const selectedConfigs: PracticeSessionConfig[] = []
    
    console.log('Getting current session config from chapterConfigs:', chapterConfigs)
    
    Object.entries(chapterConfigs).forEach(([bookCode, bookConfigs]) => {
      console.log(`Processing book ${bookCode}:`, bookConfigs)
      const selectedChapters = Object.entries(bookConfigs)
        .filter(([_, config]) => config.selected)
        .reduce((acc, [chapterName, config]) => {
          acc[chapterName] = config
          return acc
        }, {} as Record<string, ChapterConfiguration>)

      console.log(`Selected chapters for ${bookCode}:`, selectedChapters)

      if (Object.keys(selectedChapters).length > 0) {
        selectedConfigs.push({
          bookCode,
          chapters: selectedChapters,
          questionOrder: 'sequential',
          testMode: 'practice'
        })
      }
    })

    console.log('Final selected configs:', selectedConfigs)
    return selectedConfigs.length > 0 ? selectedConfigs[0] : null
  }

  const handleStartSession = () => {
    console.log('Start session button clicked')
    console.log('Current chapter configs:', chapterConfigs)
    
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
          questionOrder: 'sequential',
          testMode: 'practice'
        })
      }
    })

    console.log('Selected configs:', selectedConfigs)

    if (selectedConfigs.length > 0) {
      // For now, we'll use the first book's configuration
      // In a real app, you might want to handle multiple books differently
      console.log('Calling onSessionStart with:', selectedConfigs[0])
      onSessionStart(selectedConfigs[0])
    } else {
      console.log('No chapters selected')
      alert('Please select at least one chapter to start a practice session.')
    }
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <motion.div
          key={book.id}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => handleBookClick(book.code)}
            className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {book.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Code: {book.code}
              </p>
            </div>
            <motion.div
              animate={{ rotate: expandedBook === book.code ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-5 w-5 text-slate-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedBook === book.code && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                <div className="p-6">
                  {loadingChapters[book.code] ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chapters[book.code]?.map((chapter, index) => {
                        const config = chapterConfigs[book.code]?.[chapter.chapter_name] || {
                          selected: false,
                          mode: 'quantity' as const,
                          values: { count: 1 }
                        }

                        return (
                          <motion.div
                            key={chapter.chapter_name}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center p-4">
                              <CustomCheckbox
                                checked={config.selected}
                                onChange={(selected) => handleChapterSelect(book.code, chapter.chapter_name, selected)}
                              />
                              <div className="ml-4 flex-1">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                  {chapter.chapter_name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {chapter.count} questions available
                                </p>
                              </div>
                            </div>

                            <AnimatePresence>
                              {config.selected && (
                                <ChapterConfigPanel
                                  chapterName={chapter.chapter_name}
                                  questionCount={chapter.count}
                                  config={config}
                                  onConfigChange={(newConfig) => 
                                    handleChapterConfigChange(book.code, chapter.chapter_name, newConfig)
                                  }
                                />
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
})

BookAccordion.displayName = 'BookAccordion'

export default BookAccordion
