'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayIcon, TrashIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { formatTimeHumanReadable, formatTimeHHMMSS } from '@/lib/timeUtils'
import DeleteSessionModal from './DeleteSessionModal'
import StatusLegend from './StatusLegend'

interface SavedSession {
  id: number
  session_name: string
  session_state: any
  created_at: string
  updated_at: string
}

interface SavedSessionsManagerProps {
  onResumeSession: (sessionState: any) => void
}

export default function SavedSessionsManager({ onResumeSession }: SavedSessionsManagerProps) {
  const { user } = useAuth()
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<SavedSession | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchSavedSessions(user.id)
    } else {
      setSavedSessions([])
    }
  }, [user?.id])

  const fetchSavedSessions = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('saved_practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved sessions:', error)
        return
      }

      setSavedSessions(data || [])
    } catch (error) {
      console.error('Error fetching saved sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSession = async (session: SavedSession) => {
    try {
      // Delete the saved session (one-time resume)
      const { error: deleteError } = await supabase
        .from('saved_practice_sessions')
        .delete()
        .eq('id', session.id)

      if (deleteError) {
        console.error('Error deleting saved session:', deleteError)
        return
      }

      // Remove from local state
      setSavedSessions(prev => prev.filter(s => s.id !== session.id))

      // Resume the session
      onResumeSession(session.session_state)
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  const handleDeleteSession = (session: SavedSession) => {
    setSessionToDelete(session)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return

    try {
      setDeletingId(sessionToDelete.id)
      
      const { error } = await supabase
        .from('saved_practice_sessions')
        .delete()
        .eq('id', sessionToDelete.id)

      if (error) {
        console.error('Error deleting saved session:', error)
        return
      }

      // Remove from local state
      setSavedSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))
      
      // Close modal and reset state
      setShowDeleteModal(false)
      setSessionToDelete(null)
    } catch (error) {
      console.error('Error deleting saved session:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setSessionToDelete(null)
  }

  const getProgressSummary = (sessionState: any) => {
    if (!sessionState || !sessionState.questionStatuses) {
      return {
        answeredCount: 0,
        notAnsweredCount: 0,
        markedCount: 0,
        notVisitedCount: 0,
        markedAndAnsweredCount: 0,
        total: 0
      }
    }

    // Parse the questionStatuses object to get detailed counts
    const questionStatuses = sessionState.questionStatuses
    const userAnswers = sessionState.userAnswers || {}
    const total = Object.keys(questionStatuses).length

    const answeredCount = Object.values(questionStatuses).filter((status: any) => status === 'answered').length
    const notAnsweredCount = Object.values(questionStatuses).filter((status: any) => status === 'unanswered').length
    const markedCount = Object.values(questionStatuses).filter((status: any) => status === 'marked_for_review').length
    const notVisitedCount = Object.values(questionStatuses).filter((status: any) => status === 'not_visited').length

    // Calculate marked and answered count - questions that are both marked and have answers
    const markedAndAnsweredCount = Object.entries(questionStatuses).filter(([questionId, status]: [string, any]) => {
      return status === 'marked_for_review' && userAnswers[questionId]
    }).length

    return {
      answeredCount,
      notAnsweredCount,
      markedCount,
      notVisitedCount,
      markedAndAnsweredCount,
      total
    }
  }

  const getTimerMode = (sessionState: any) => {
    return sessionState?.sessionConfig?.testMode || 'practice'
  }

  const getTimeDisplayInfo = (sessionState: any) => {
    const mode = getTimerMode(sessionState)
    // Fix: Timer data is stored in timerState.mainTimerElapsedMs, not directly in sessionState
    const elapsedMs = sessionState?.timerState?.mainTimerElapsedMs || sessionState?.mainTimerElapsedMs || 0

    if (mode === 'practice') {
      // Practice mode: count-up, show elapsed time
      return {
        mode: 'Practice Mode',
        label: 'Time Elapsed:',
        time: formatTimeHHMMSS(Math.floor(elapsedMs / 1000)),
        showTotal: false
      }
    } else {
      // Timed mode: countdown, show remaining time and total
      const timeLimitMinutes = sessionState?.sessionConfig?.timeLimitInMinutes || 30
      const timeLimitMs = timeLimitMinutes * 60 * 1000
      const remainingMs = Math.max(0, timeLimitMs - elapsedMs)

      return {
        mode: 'Timed Mode',
        label: 'Time Remaining:',
        time: formatTimeHHMMSS(Math.floor(remainingMs / 1000)),
        showTotal: true,
        total: formatTimeHHMMSS(Math.floor(timeLimitMs / 1000))
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (savedSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Saved Sessions
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Your saved practice sessions will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {savedSessions.map((session) => {
          const progress = getProgressSummary(session.session_state)
          const timeInfo = getTimeDisplayInfo(session.session_state)
          const isDeleting = deletingId === session.id

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Section 1: Header */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight mb-1">
                      {session.session_name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Saved {formatDate(session.updated_at)}
                      </p>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {progress.total} questions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session)}
                    disabled={isDeleting}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 ml-2 flex-shrink-0"
                    title="Delete session"
                  >
                    {isDeleting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Mode & Time Status (CRITICAL) */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-750 border-b border-slate-100 dark:border-slate-700 min-h-[80px] flex flex-col justify-center">
                <div className="space-y-2">
                  {/* Mode Badge */}
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      timeInfo.mode === 'Practice Mode'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {timeInfo.mode}
                    </span>
                  </div>
                  
                  {/* Time Display */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {timeInfo.label}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {timeInfo.time}
                      </span>
                    </div>
                    {timeInfo.showTotal && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Total: {timeInfo.total}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Exact Status Legend (same as exit session modal) */}
              <div className="p-3 flex-1">
                <StatusLegend
                  answeredCount={progress.answeredCount}
                  notAnsweredCount={progress.notAnsweredCount}
                  notVisitedCount={progress.notVisitedCount}
                  markedCount={progress.markedCount}
                  markedAndAnsweredCount={progress.markedAndAnsweredCount}
                  className="!bg-transparent !border-none !p-0"
                />
              </div>

              {/* Section 4: Action Button */}
              <div className="px-4 pb-4 mt-auto">
                <motion.button
                  onClick={() => handleResumeSession(session)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium text-xs shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span>Resume Session</span>
                </motion.button>
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSessionModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        sessionName={sessionToDelete?.session_name || ''}
        isDeleting={deletingId !== null}
      />
    </div>
  )
}
