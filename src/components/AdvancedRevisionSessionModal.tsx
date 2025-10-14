'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Clock, Shuffle, BookOpen, Star, Target, CheckCircle } from 'lucide-react'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

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
  questions: any
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

interface ChapterConfig {
  chapterName: string
  questionScope: 'all' | 'random' | 'difficulty'
  questionCount?: number
  difficultyBreakdown?: {
    [rating: number]: number
  }
}

interface AdvancedRevisionSessionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedChapters: string[]
  chapters: ChapterData[]
  bookmarkedQuestions: BookmarkedQuestion[]
  onStartSession: (config: AdvancedSessionConfig) => void
}

interface AdvancedSessionConfig {
  chapterConfigs: ChapterConfig[]
  testMode: 'practice' | 'timed'
  timeLimit?: number
}

export default function AdvancedRevisionSessionModal({
  isOpen,
  onClose,
  selectedChapters,
  chapters,
  bookmarkedQuestions,
  onStartSession
}: AdvancedRevisionSessionModalProps) {
  const [chapterConfigs, setChapterConfigs] = useState<ChapterConfig[]>([])
  const [testMode, setTestMode] = useState<'practice' | 'timed'>('practice')
  const [timeLimit, setTimeLimit] = useState<number>(60)

  // Initialize chapter configurations
  useEffect(() => {
    if (isOpen && selectedChapters.length > 0) {
      const initialConfigs: ChapterConfig[] = selectedChapters.map(chapterName => ({
        chapterName,
        questionScope: 'all' as const,
        questionCount: 10,
        difficultyBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }))
      setChapterConfigs(initialConfigs)
    }
  }, [isOpen, selectedChapters])

  // Get questions for a specific chapter
  const getQuestionsForChapter = (chapterName: string) => {
    return bookmarkedQuestions.filter(q => q.questions.chapter_name === chapterName)
  }

  // Get difficulty breakdown for a chapter
  const getDifficultyBreakdown = (chapterName: string) => {
    const questions = getQuestionsForChapter(chapterName)
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    questions.forEach(question => {
      const rating = question.user_difficulty_rating
      if (rating && rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++
      }
    })
    
    return breakdown
  }

  // Update chapter configuration
  const updateChapterConfig = (chapterName: string, updates: Partial<ChapterConfig>) => {
    setChapterConfigs(prev => 
      prev.map(config => 
        config.chapterName === chapterName 
          ? { ...config, ...updates }
          : config
      )
    )
  }

  // Calculate total questions selected
  const totalQuestionsSelected = useMemo(() => {
    return chapterConfigs.reduce((total, config) => {
      const chapterQuestions = getQuestionsForChapter(config.chapterName)
      const difficultyBreakdown = getDifficultyBreakdown(config.chapterName)
      
      if (config.questionScope === 'all') {
        return total + chapterQuestions.length
      } else if (config.questionScope === 'random') {
        return total + (config.questionCount || 0)
      } else if (config.questionScope === 'difficulty') {
        const difficultyTotal = Object.values(config.difficultyBreakdown || {}).reduce((sum, count) => sum + count, 0)
        return total + difficultyTotal
      }
      return total
    }, 0)
  }, [chapterConfigs, bookmarkedQuestions])

  const handleStartSession = () => {
    const config: AdvancedSessionConfig = {
      chapterConfigs,
      testMode,
      ...(testMode === 'timed' && { timeLimit })
    }
    onStartSession(config)
  }

  const selectedChaptersData = selectedChapters.map(chapterName => 
    chapters.find(c => c.name === chapterName)
  ).filter(Boolean) as ChapterData[]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      🚀 Start Revision Session
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Advanced configuration for targeted practice
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              <div className="p-6 space-y-6">
                {/* Chapter Configuration Cards */}
                {chapterConfigs.map((config, index) => {
                  const chapterQuestions = getQuestionsForChapter(config.chapterName)
                  const difficultyBreakdown = getDifficultyBreakdown(config.chapterName)
                  
                  return (
                    <ChapterConfigurationCard
                      key={config.chapterName}
                      config={config}
                      chapterQuestions={chapterQuestions}
                      difficultyBreakdown={difficultyBreakdown}
                      onUpdate={(updates) => updateChapterConfig(config.chapterName, updates)}
                    />
                  )
                })}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between">
                {/* Left Side - Summary */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total Questions Selected:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {totalQuestionsSelected}
                    </span>
                  </div>
                </div>

                {/* Middle - Test Mode */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Test Mode:</span>
                  <div className="flex bg-slate-200 dark:bg-slate-600 rounded-lg p-1">
                    <button
                      onClick={() => setTestMode('practice')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        testMode === 'practice'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      Practice Mode
                    </button>
                    <button
                      onClick={() => setTestMode('timed')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        testMode === 'timed'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      Timed Mode
                    </button>
                  </div>
                  
                  {/* Time Input for Timed Mode */}
                  {testMode === 'timed' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                        min="1"
                        max="300"
                        className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
                    </div>
                  )}
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartSession}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" strokeWidth={2.5} />
                    Begin Session
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Chapter Configuration Card Component
interface ChapterConfigurationCardProps {
  config: ChapterConfig
  chapterQuestions: BookmarkedQuestion[]
  difficultyBreakdown: { [rating: number]: number }
  onUpdate: (updates: Partial<ChapterConfig>) => void
}

function ChapterConfigurationCard({ 
  config, 
  chapterQuestions, 
  difficultyBreakdown, 
  onUpdate 
}: ChapterConfigurationCardProps) {
  const [showDifficultySelector, setShowDifficultySelector] = useState(false)

  const handleQuestionScopeChange = (scope: 'all' | 'random' | 'difficulty') => {
    onUpdate({ questionScope: scope })
    if (scope === 'difficulty') {
      setShowDifficultySelector(true)
    } else {
      setShowDifficultySelector(false)
    }
  }

  const handleDifficultyCountChange = (rating: number, count: number) => {
    const maxAvailable = difficultyBreakdown[rating] || 0
    const newCount = Math.min(Math.max(0, count), maxAvailable)
    
    onUpdate({
      difficultyBreakdown: {
        ...config.difficultyBreakdown,
        [rating]: newCount
      }
    })
  }

  const handleSelectAllDifficulty = (rating: number) => {
    const maxAvailable = difficultyBreakdown[rating] || 0
    handleDifficultyCountChange(rating, maxAvailable)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 p-6"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {config.chapterName}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {chapterQuestions.length} questions available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
        </div>
      </div>

      {/* Question Scope Selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Question Scope Rule
        </h4>
        
        <div className="space-y-3">
          {/* Practice All */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={`scope-${config.chapterName}`}
              checked={config.questionScope === 'all'}
              onChange={() => handleQuestionScopeChange('all')}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={2.5} />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Practice All ({chapterQuestions.length} questions)
              </span>
            </div>
          </label>

          {/* Practice Random Subset */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={`scope-${config.chapterName}`}
              checked={config.questionScope === 'random'}
              onChange={() => handleQuestionScopeChange('random')}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-purple-500" strokeWidth={2.5} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Practice</span>
                <input
                  type="number"
                  value={config.questionCount || 10}
                  onChange={(e) => onUpdate({ questionCount: Math.min(parseInt(e.target.value) || 1, chapterQuestions.length) })}
                  min="1"
                  max={chapterQuestions.length}
                  disabled={config.questionScope !== 'random'}
                  className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">random questions</span>
              </div>
            </div>
          </label>

          {/* Practice by Difficulty */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={`scope-${config.chapterName}`}
              checked={config.questionScope === 'difficulty'}
              onChange={() => handleQuestionScopeChange('difficulty')}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" strokeWidth={2.5} />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Practice by Difficulty (Advanced)
              </span>
            </div>
          </label>
        </div>

        {/* Difficulty-Based Selector (Progressive Disclosure) */}
        <AnimatePresence>
          {showDifficultySelector && config.questionScope === 'difficulty' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Difficulty-Based Selection
              </h5>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const available = difficultyBreakdown[rating] || 0
                  const selected = config.difficultyBreakdown?.[rating] || 0
                  
                  return (
                    <div key={rating} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rating }, (_, i) => (
                            <StarSolidIcon key={i} className="h-4 w-4 text-yellow-500" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {available} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={selected}
                          onChange={(e) => handleDifficultyCountChange(rating, parseInt(e.target.value) || 0)}
                          min="0"
                          max={available}
                          className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={() => handleSelectAllDifficulty(rating)}
                          disabled={available === 0}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          All
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
