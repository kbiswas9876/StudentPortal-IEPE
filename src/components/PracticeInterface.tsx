'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import { useTimerSystem } from '@/hooks/useTimerSystem'
// Removed TimerDisplay - now using QuestionDisplayWindow
import QuestionPalette from './QuestionPalette'
import PremiumStatusPanel from './PremiumStatusPanel'
import QuestionDisplayWindow from './QuestionDisplayWindow'
// Removed old ActionBar and ProgressBar - now using QuestionDisplayWindow
import EndSessionModal from './EndSessionModal'
import ReportErrorModal from './ReportErrorModal'
import ExitSessionModal from './ExitSessionModal'
// Removed ZenModeBackButton - now using QuestionDisplayWindow back button
import PauseOverlay from './PauseOverlay'
import PauseModal from './PauseModal'
import SubmissionConfirmationModal from './SubmissionConfirmationModal'
import AutoSubmissionOverlay from './AutoSubmissionOverlay'
import KatexRenderer from './ui/KatexRenderer'
import { FlagIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

type Question = Database['public']['Tables']['questions']['Row']

export type QuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'marked_for_review'

export type SessionState = {
  status: QuestionStatus
  user_answer: string | null
  is_bookmarked: boolean
}

interface PracticeInterfaceProps {
  questions: Question[]
  testMode?: 'practice' | 'timed'
  timeLimitInMinutes?: number
  mockTestData?: {
    test: {
      id: number
      name: string
      total_time_minutes: number
      marks_per_correct: number
      negative_marks_per_incorrect: number
    }
  }
  savedSessionState?: any
  source?: string | null
  hideMetadata?: boolean
}

export default function PracticeInterface({ questions, testMode = 'practice', timeLimitInMinutes, mockTestData, savedSessionState, source, hideMetadata = false }: PracticeInterfaceProps) {
  // Hide metadata by default for mock tests
  const shouldHideMetadata = hideMetadata || mockTestData !== undefined
  const { user, session } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if this is a fresh start
  const isFreshStart = searchParams.get('fresh') === 'true'
  
  // B-2: Use saved session config when restoring (override props)
  const effectiveTestMode = savedSessionState?.sessionConfig?.testMode || testMode
  const effectiveTimeLimitInMinutes = savedSessionState?.sessionConfig?.timeLimitInMinutes || timeLimitInMinutes
  
  
  // Extract stable primitive values from auth context to prevent unnecessary effect re-runs
  const userId = user?.id
  const sessionToken = session?.access_token
  
  // Generate unique session key based on question set for sessionStorage
  const sessionKey = useRef(`practice_session_${questions.map(q => q.id).join('_')}`).current
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStates, setSessionStates] = useState<SessionState[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEndSessionModal, setShowEndSessionModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showAutoSubmissionOverlay, setShowAutoSubmissionOverlay] = useState(false)
  
  // C-1: Track saved session ID for updates (not duplicates)
  const [savedSessionId, setSavedSessionId] = useState<number | null>(
    savedSessionState?.savedSessionId || null
  )
  
  // Memoize questionIds for stable dependency in bookmark checks
  const questionIds = useMemo(() => questions.map(q => q.question_id), [questions]);
  
  const bookmarkInProgressRef = useRef(false); // Prevent concurrent bookmark requests (race condition fix)
  
  // Ref to store the auto-submission handler to avoid circular dependency
  const handleAutoSubmissionRef = useRef<(() => void) | null>(null)
  
  // FR-3.1: Extract timer restoration data from savedSessionState
  const initialTimerState = useMemo(() => {
    if (savedSessionState?.timerState) {
      const { mainTimerElapsedMs, questionTimes } = savedSessionState.timerState
      
      // Convert questionTimes object to Map
      const questionTimeMap = new Map<number, number>()
      if (questionTimes) {
        Object.entries(questionTimes).forEach(([index, time]) => {
          questionTimeMap.set(Number(index), time as number)
        })
      }
      
      return {
        initialSessionElapsedMs: mainTimerElapsedMs || 0,
        initialQuestionTimeMap: questionTimeMap
      }
    }
    return {
      initialSessionElapsedMs: 0,
      initialQuestionTimeMap: undefined
    }
  }, [savedSessionState])
  
  // === TIMER SYSTEM ===
  const {
    mainTimerDisplay,
    inQuestionTime,
    isLowTime,
    isPaused,
    togglePause,
    getTotalSessionTime,
    getQuestionTimeMap
  } = useTimerSystem({
    testMode: effectiveTestMode,
    timeLimitInMinutes: effectiveTimeLimitInMinutes,
    currentQuestionIndex: currentIndex,
    totalQuestions: questions.length,
    onTimeUp: () => handleAutoSubmissionRef.current?.(),
    isSessionActive: isInitialized && !isSubmitting,
    initialSessionElapsedMs: initialTimerState.initialSessionElapsedMs,
    initialQuestionTimeMap: initialTimerState.initialQuestionTimeMap
  })
  
  // Pause functionality
  const handlePauseSession = () => {
    togglePause();
    setShowPauseModal(true);
  };

  const handleResumeSession = () => {
    togglePause();
    setShowPauseModal(false);
  };

  const handlePauseExit = () => {
    setShowPauseModal(false);
    // Resume if paused
    if (isPaused) {
      togglePause();
    }
    setShowExitModal(true);
  };

  // FR-1.1: Open exit modal and instantly pause timers
  const handleOpenExitModal = () => {
    if (!isPaused) {
      togglePause()
    }
    setShowExitModal(true)
  }

  
  // ===== CRITICAL FIX: State Persistence Functions =====
  // These functions save and restore ALL session state to sessionStorage
  // This prevents state loss on tab switches, re-mounts, or page refreshes
  
  const saveStateToSessionStorage = useCallback(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    
    try {
      const persistedState = {
        currentIndex,
        sessionStates,
        timestamp: Date.now(),
        testMode: effectiveTestMode,
        timeLimitInMinutes: effectiveTimeLimitInMinutes,
      };
      
      sessionStorage.setItem(sessionKey, JSON.stringify(persistedState));
      console.log('💾 State persisted to sessionStorage');
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }, [currentIndex, sessionStates, isInitialized, sessionKey, effectiveTestMode, effectiveTimeLimitInMinutes]);
  
  const restoreStateFromSessionStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem(sessionKey);
      if (!stored) return null;
      
      const persistedState = JSON.parse(stored);
      console.log('🔄 Restoring state from sessionStorage:', persistedState);
      
      return persistedState;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return null;
    }
  }, [sessionKey]);
  
  const clearSessionStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(sessionKey);
      console.log('🗑️ Session storage cleared');
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }, [sessionKey]);
  


  // D-1: Initialize session states with STRICT ISOLATION
  useEffect(() => {
    if (questions.length > 0) {
      let restored = false;

      // D-1: EXPLICIT RESUME - Only restore if savedSessionState is provided AND not a fresh start
      if (!isFreshStart && savedSessionState && Object.keys(savedSessionState).length > 0) {
        console.log('%c 🔄 RESTORATION: Applying state from explicitly resumed session.', 'color: blue; font-weight: bold;');
        
        // B-1: Perfect state restoration from saved session
        const restoredStates: SessionState[] = questions.map((q, index) => {
          const questionId = q.id
          return {
            status: (savedSessionState?.questionStatuses?.[questionId] as QuestionStatus) || 'not_visited',
            user_answer: savedSessionState?.userAnswers?.[questionId] || null,
            is_bookmarked: savedSessionState?.bookmarkedQuestions?.[questionId] || false
          }
        })
        
        // Restore all state
        setSessionStates(restoredStates)
        setCurrentIndex(savedSessionState?.currentIndex || 0)
        
        setIsInitialized(true)
        restored = true;
        
        console.log('✅ Session restored:', {
          currentIndex: savedSessionState?.currentIndex || 0,
          answeredCount: restoredStates.filter(s => s.user_answer).length,
          totalQuestions: questions.length
        })
      } 
      // Tab switch recovery (only if NOT resuming a saved session)
      else if (!isFreshStart && !savedSessionState) {
        // Check sessionStorage for tab switch recovery
        const persistedState = restoreStateFromSessionStorage();
        
        if (persistedState) {
          console.log('%c 🔄 RESTORATION: Applying state from sessionStorage (tab switch recovery).', 'color: green; font-weight: bold;');
          
          setSessionStates(persistedState.sessionStates);
          setCurrentIndex(persistedState.currentIndex);
          
          // Clear after restoring
          clearSessionStorage();
          setIsInitialized(true)
          restored = true;
        }
      }

      // D-1: FRESH START - Start with clean slate
      if (!restored) {
        console.log('%c 🆕 INITIALIZATION: Starting a completely new, fresh session.', 'color: orange; font-weight: bold;');
        
        // Initialize with default state
        const initialStates: SessionState[] = questions.map(() => ({
          status: 'not_visited',
          user_answer: null,
          is_bookmarked: false
        }))
        setSessionStates(initialStates)
        
        setIsInitialized(true)
      }
    }
  }, [questions, savedSessionState, isFreshStart, restoreStateFromSessionStorage, clearSessionStorage])

// Effect: Fetch bookmark statuses ONCE on initialization
// FIX: This should only run once when initialized, not on every session change
// Using a ref to track if we've already fetched bookmarks for this session
const bookmarksFetchedRef = useRef(false);
 
useEffect(() => {
  // Only run once when initialized and user is available
  if (!isInitialized || !userId || bookmarksFetchedRef.current) return;

  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch('/api/practice/check-bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ questionIds }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Bookmark check failed:', data);
        return;
      }

      if (controller.signal.aborted) return;

      if (data.bookmarks) {
        setSessionStates(prevStates =>
          prevStates.map((state, index) => {
            const bookmarkData = data.bookmarks[String(questions[index].question_id)]
            return {
              ...state,
              is_bookmarked: !!bookmarkData?.isBookmarked,
              bookmark_difficulty_rating: bookmarkData?.difficultyRating || null
            }
          })
        );
        // Mark as fetched to prevent re-running
        bookmarksFetchedRef.current = true;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error checking bookmarks:', err);
    }
  };

  run();

  return () => controller.abort();
}, [isInitialized, userId, sessionToken, questionIds, questions])


  // ===== AUTO-SAVE EFFECT: Persist state on every change =====
  useEffect(() => {
    if (!isInitialized) return;
    
    // Save state on every state change
    saveStateToSessionStorage();
  }, [currentIndex, sessionStates, isInitialized, saveStateToSessionStorage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Alt + S: Save and Next
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        handleSaveAndNext()
      }
      // Alt + M: Mark for Review and Next
      else if (event.altKey && event.key === 'm') {
        event.preventDefault()
        handleMarkForReviewAndNext()
      }
      // Alt + C: Clear Response
      else if (event.altKey && event.key === 'c') {
        event.preventDefault()
        handleClearResponse()
      }
      // Alt + B: Bookmark
      else if (event.altKey && event.key === 'b') {
        event.preventDefault()
        handleBookmark()
      }
      // Alt + R: Report Error
      else if (event.altKey && event.key === 'r') {
        event.preventDefault()
        setShowReportModal(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateSessionState = useCallback((index: number, updates: Partial<SessionState>) => {
    setSessionStates(prev => {
      const newStates = [...prev]
      newStates[index] = { ...newStates[index], ...updates }
      return newStates
    })
  }, [])

  // Handle question navigation
  const handleNavigation = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length || newIndex === currentIndex) return;
    
    // Mark as visited (unanswered) if not visited yet
    const currentState = sessionStates[currentIndex]
    if (currentState && currentState.status === 'not_visited') {
      updateSessionState(currentIndex, {
        status: 'unanswered'
      })
    }
    
    // Update to new question
    setCurrentIndex(newIndex);
    
  }, [currentIndex, questions, sessionStates, updateSessionState]);
  const currentState = sessionStates[currentIndex] || {
    status: 'not_visited' as QuestionStatus,
    user_answer: null,
    is_bookmarked: false
  }

  // Mark current question as visited when it's first accessed
  useEffect(() => {
    if (isInitialized && sessionStates.length > 0) {
      const currentState = sessionStates[currentIndex]
      if (currentState && currentState.status === 'not_visited') {
        updateSessionState(currentIndex, {
          status: 'unanswered'
        })
      }
    }
  }, [currentIndex, isInitialized, sessionStates, updateSessionState])

  // Debug logging (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('PracticeInterface render:', {
      questionsLength: questions.length,
      sessionStatesLength: sessionStates.length,
      currentIndex,
      isInitialized,
      currentState
    })
  }


  const handleAnswerChange = (answer: string) => {
    // Only update the user_answer, don't change status until Save & Next is pressed
    // Status should remain as 'unanswered' or 'marked_for_review' until explicitly saved
    updateSessionState(currentIndex, {
      user_answer: answer
      // Don't update status here - it will be updated in handleSaveAndNext
    })
  }

  const handleSaveAndNext = () => {
    // Determine status based on current state and user answer
    let newStatus: QuestionStatus
    if (currentState.status === 'marked_for_review') {
      // If marked for review and has answer, keep as marked_for_review
      // If marked for review and no answer, change to unanswered
      newStatus = currentState.user_answer ? 'marked_for_review' : 'unanswered'
    } else {
      // Regular save logic: answered if has answer, unanswered if no answer
      newStatus = currentState.user_answer ? 'answered' : 'unanswered'
    }
    
    updateSessionState(currentIndex, {
      status: newStatus
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      handleNavigation(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleMarkForReviewAndNext = () => {
    updateSessionState(currentIndex, {
      status: 'marked_for_review'
      // Keep existing user_answer - don't change it
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      handleNavigation(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleClearResponse = () => {
    // Clear the answer but don't change status yet
    // Status will be determined when user clicks Save & Next or Mark for Review & Next
    updateSessionState(currentIndex, {
      user_answer: null
      // Keep existing status - will be updated on next action
    })
  }

  const handleReturnToStart = () => {
    handleNavigation(0)
    setShowEndSessionModal(false)
  }

  const handleStayHere = () => {
    setShowEndSessionModal(false)
  }

  const handleExitWithoutSaving = () => {
    setShowExitModal(false)
    router.push('/dashboard')
  }

  const handleSaveAndExit = async (sessionName: string) => {
    try {
      if (!userId) return

      // A-2: Capture complete timer state at moment of pause
      const totalSessionElapsedMs = getTotalSessionTime()
      const questionTimeMap = getQuestionTimeMap()
      
      // Convert Map to plain object for JSON serialization
      const questionTimesObject: Record<number, number> = {}
      questionTimeMap.forEach((time, index) => {
        questionTimesObject[index] = time
      })

      // A-2: Create comprehensive session state object with complete state serialization
      const sessionState = {
        // Core session configuration
        sessionConfig: {
          testMode: effectiveTestMode,
          timeLimitInMinutes: effectiveTimeLimitInMinutes,
          questionOrder: 'sequential'
        },
        
        // Question set and current position
        questionSet: questions.map(q => q.id),
        currentIndex,
        
        // A-2: Timer state for perfect restoration
        timerState: {
          mainTimerElapsedMs: totalSessionElapsedMs,
          questionTimes: questionTimesObject
        },
        
        // A-2: User progress data - capture ALL live state
        userAnswers: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.user_answer) {
            acc[q.id] = state.user_answer
          }
          return acc
        }, {} as Record<string, string>),
        
        questionStatuses: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          acc[q.id] = state?.status || 'not_visited'
          return acc
        }, {} as Record<string, string>),
        
        bookmarkedQuestions: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.is_bookmarked) {
            acc[q.id] = true
          }
          return acc
        }, {} as Record<string, boolean>),
        
        // Mock test data if applicable
        mockTestData,
        
        // Full question data for restoration
        questions: questions.map((q, index) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_option: q.correct_option,
          solution_text: q.solution_text,
          difficulty: q.difficulty,
          chapter_name: q.chapter_name,
          book_source: q.book_source
        }))
      }

      console.log('💾 Saving session state:', {
        sessionId: savedSessionId,
        testMode: effectiveTestMode,
        timeLimitInMinutes: effectiveTimeLimitInMinutes,
        currentIndex,
        mainTimerElapsedMs: totalSessionElapsedMs,
        questionCount: questions.length,
        answeredCount: sessionStates.filter(s => s.user_answer).length
      })

      // C-1: Determine if UPDATE or CREATE based on savedSessionId
      const isUpdate = savedSessionId !== null
      const endpoint = isUpdate 
        ? `/api/saved-sessions?sessionId=${savedSessionId}`
        : '/api/saved-sessions'
      const method = isUpdate ? 'PUT' : 'POST'

      // Save to database
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionName,
          sessionState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      const result = await response.json()
      
      // Store the session ID for future updates
      if (!isUpdate && result.data?.id) {
        setSavedSessionId(result.data.id)
      }

      showToast({ 
        type: 'success', 
        title: isUpdate ? 'Session Updated' : 'Session Saved', 
        message: `Your progress has been ${isUpdate ? 'updated' : 'saved'} successfully.` 
      })

      // Close modal and redirect
      setShowExitModal(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving session:', error)
      showToast({ type: 'error', title: 'Failed to save session', message: 'Please try again.' })
    }
  }

  const getCurrentProgress = () => {
    const answered = sessionStates.filter(state => state.user_answer !== null).length
    const total = questions.length
    return {
      answered,
      total,
      timeSpent: mainTimerDisplay
    }
  }

  const getStatusCounts = () => {
    const answeredCount = sessionStates.filter(s => s.status === 'answered').length
    const notAnsweredCount = sessionStates.filter(s => s.status === 'unanswered').length
    const notVisitedCount = sessionStates.filter(s => s.status === 'not_visited').length
    const markedCount = sessionStates.filter(s => s.status === 'marked_for_review').length
    const markedAndAnsweredCount = sessionStates.filter(s => s.status === 'marked_for_review' && s.user_answer).length
    const bookmarkedCount = sessionStates.filter(s => s.is_bookmarked).length

    return {
      answeredCount,
      notAnsweredCount,
      notVisitedCount,
      markedCount,
      markedAndAnsweredCount,
      bookmarkedCount
    }
  }

  // Bookmarking removed from practice interface - now only available in solution review
  // This enforces deliberate bookmarking after reviewing solutions
  const handleBookmark = async () => {
    showToast({
      type: 'info',
      title: 'Bookmark in Solution Review',
      message: 'You can bookmark questions after reviewing solutions. Complete this session to access the solution review.',
      duration: 4000,
    });
  }

  const handleSubmitTest = async () => {
    if (isSubmitting) return

    // Show confirmation modal for manual submission
    setShowSubmissionModal(true)
  }

  const handleConfirmSubmission = async () => {
    if (isSubmitting) return

    await submitTest(sessionStates);
  }

  // We will refactor the existing submission logic into a new helper function
  const submitTest = async (finalSessionStates: SessionState[]) => {
    setIsSubmitting(true)
    setShowSubmissionModal(false)

    try {
      

      // Calculate final results based on the Ultimate Rule:
      // Only count GREEN (answered) and PURPLE WITH GREEN TICK (answered and marked for review) questions
      const totalQuestions = questions.length
      
      // Questions that WILL BE COUNTED for evaluation:
      // 1. GREEN (answered) - status === 'answered'
      // 2. PURPLE WITH GREEN TICK (answered and marked for review) - status === 'marked_for_review' AND has user_answer
      const evaluatedQuestions = finalSessionStates.filter((state, index) => {
        return (state.status === 'answered') || 
               (state.status === 'marked_for_review' && state.user_answer)
      })
      
      const correctAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = finalSessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer === question.correct_option
      }).length
      
      const incorrectAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = finalSessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer && state.user_answer !== question.correct_option
      }).length
      
      // Questions that WILL NOT BE COUNTED:
      // RED (unanswered), PURPLE (marked but not answered), GRAY (not visited)
      const skippedAnswers = totalQuestions - evaluatedQuestions.length

      // Calculate score based on mock test rules or default percentage
      // NOTE: This is client-side calculation for UI preview only. The server-side
      // calculation using per-question marking from test_questions table is authoritative.
      let score: number
      if (mockTestData) {
        // Mock test scoring: use actual marks (simplified client-side calculation for preview)
        // Actual score will be recalculated on server using per-question marking scheme
        const totalMarks = (correctAnswers * mockTestData.test.marks_per_correct) + 
                          (incorrectAnswers * mockTestData.test.negative_marks_per_incorrect)
        const maxMarks = totalQuestions * mockTestData.test.marks_per_correct
        score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
      } else {
        // Regular practice scoring: percentage based
        score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      }
      
      const totalTime = Math.floor(getTotalSessionTime() / 1000) // Total time in seconds

      console.log('Submitting practice session:', {
        user_id: userId,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        skipped_answers: skippedAnswers,
        score
      })

      // Get per-question times from the timer system
      const questionTimeMap = getQuestionTimeMap()
      
      // Save test result
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          questions: questions.map((question, index) => {
            // Get time for this specific question from the map
            const questionTime = questionTimeMap.get(index) || 0
            return {
              question_id: question.id, // Use numeric ID from questions table
              user_answer: finalSessionStates[index].user_answer, // <-- USES CLEANED STATE
              status: finalSessionStates[index].user_answer ? 
                (finalSessionStates[index].user_answer === question.correct_option ? 'correct' : 'incorrect') : 
                'skipped',
              time_taken: Math.floor(questionTime / 1000) // Time in seconds
            }
          }),
          score,
          total_time: totalTime,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          skipped_answers: skippedAnswers,
          // Mock test specific fields
          session_type: mockTestData ? 'mock_test' : 'practice',
          mock_test_id: mockTestData ? mockTestData.test.id : null,
          // Include per-attempt order if available from mock test payload
          question_order: (mockTestData as any)?.question_order || undefined,
          option_order: (mockTestData as any)?.option_order || undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test submitted successfully:', result)
        // Clear sessionStorage since session is complete
        clearSessionStorage()
        // Redirect to analysis report with source parameter
        let redirectUrl = `/analysis/${result.test_id}`
        if (source === 'revision') {
          redirectUrl += `?source=revision`
        } else if (source === 'srs-daily-review') {
          redirectUrl += `?source=srs-daily-review`
        }
        console.log('📍 [Practice] Redirecting to analysis with source:', source, '→', redirectUrl)
        router.push(redirectUrl)
      } else {
        const errorData = await response.json()
        console.error('Test submission failed:', errorData)
        throw new Error(errorData.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      setIsSubmitting(false)
      setShowAutoSubmissionOverlay(false)
    }
  }

  const handleAutoSubmission = useCallback(async () => {
    if (isSubmitting) return

    setShowAutoSubmissionOverlay(true)
    await submitTest(sessionStates);
  }, [isSubmitting, sessionStates])
  
  // Set the ref so the timer hook can call it
  handleAutoSubmissionRef.current = handleAutoSubmission

  const handleQuestionNavigation = (index: number) => {
    // CRITICAL: Discard temporary selections when navigating away without saving
    // This only applies to direct navigation (clicking question numbers), NOT Save & Next or Mark for Review & Next
    const currentState = sessionStates[currentIndex]
    if (currentState) {
      // If question has a temporary answer but hasn't been saved, discard it
      if (currentState.user_answer && currentState.status !== 'answered' && currentState.status !== 'marked_for_review') {
        updateSessionState(currentIndex, {
          user_answer: null,
          status: currentState.status === 'not_visited' ? 'unanswered' : currentState.status
        })
      } else if (currentState.status === 'not_visited') {
        // Mark as visited (unanswered) if not visited yet
        updateSessionState(currentIndex, {
          status: 'unanswered'
        })
      }
    }
    
    handleNavigation(index)
    setShowMobileSidebar(false) // Close mobile sidebar
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!isInitialized || sessionStates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Initializing practice session...</p>
        </div>
      </div>
    )
  }

  // Calculate answered questions for progress bar
  const answeredQuestions = sessionStates.filter(state => state.user_answer !== null).length


  return (
    <div className="practice-page-wrapper">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-12 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {mockTestData ? mockTestData.test.name : 'Practice Session'} - Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`question-window-container ${isRightPanelCollapsed ? 'lg:w-full' : 'lg:w-3/4'}`}>
        <QuestionDisplayWindow
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          userAnswer={currentState.user_answer}
          isBookmarked={currentState.is_bookmarked}
          onAnswerChange={handleAnswerChange}
          onBookmark={handleBookmark}
          onReportError={() => setShowReportModal(true)}
          onExit={handleOpenExitModal}
          mainTimer={mainTimerDisplay}
          isLowTime={isLowTime}
          inQuestionTime={inQuestionTime}
          isPaused={isPaused}
          showBookmark={false} // Disable bookmarking in practice interface
          onTogglePause={handlePauseSession}
          // CRITICAL: Pass the real button handlers from PracticeInterface
          onSaveAndNext={handleSaveAndNext}
          onMarkForReviewAndNext={handleMarkForReviewAndNext}
          hideMetadata={shouldHideMetadata}
          correctMarks={mockTestData ? (questions[currentIndex] as any)?.marks_per_correct : undefined}
          negativeMarks={mockTestData ? (questions[currentIndex] as any)?.penalty_per_incorrect : undefined}
        />
      </div>

      {/* Desktop Right Panel - Status Panel */}
      <div className="status-panel-container">
        <PremiumStatusPanel
          questions={questions}
          sessionStates={sessionStates}
          currentIndex={currentIndex}
          onQuestionSelect={handleQuestionNavigation}
          onSubmitTest={handleSubmitTest}
          isSubmitting={isSubmitting}
          mockTestData={mockTestData}
          timePerQuestion={{}}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-80 h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Question Navigation</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                </div>
              </div>
              
              {/* Mobile Question Palette - Full Height with Proper Flex Layout */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                <QuestionPalette
                  questions={questions}
                  sessionStates={sessionStates}
                  currentIndex={currentIndex}
                  onQuestionSelect={handleQuestionNavigation}
                  onSubmitTest={handleSubmitTest}
                  isSubmitting={isSubmitting}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Action Bar removed - now handled by QuestionDisplayWindow */}

      {/* End Session Modal */}
      <EndSessionModal
        isOpen={showEndSessionModal}
        onReturnToStart={handleReturnToStart}
        onStayHere={handleStayHere}
      />

      {/* Report Error Modal */}
      {showReportModal && (
        <ReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestion.id}
          questionText={currentQuestion.question_text}
        />
      )}

      {/* Back button removed - now handled by QuestionDisplayWindow */}

      {/* Exit Session Modal */}
      <ExitSessionModal
        isOpen={showExitModal}
        onClose={() => {
          // FR-1.3: Cancel - Resume timers if they were paused
          if (isPaused) {
            togglePause()
          }
          setShowExitModal(false)
        }}
        onExitWithoutSaving={handleExitWithoutSaving}
        onSaveAndExit={handleSaveAndExit}
        currentProgress={getCurrentProgress()}
        statusCounts={getStatusCounts()}
      />

      {/* Pause Overlay */}
      <PauseOverlay isVisible={showPauseModal}>
        <PauseModal
          isOpen={showPauseModal}
          onResume={handleResumeSession}
          onExit={handlePauseExit}
        />
      </PauseOverlay>

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmationModal
        isOpen={showSubmissionModal}
        onCancel={() => setShowSubmissionModal(false)}
        onSubmit={handleConfirmSubmission}
        timeRemaining={testMode === 'timed' && timeLimitInMinutes ? 
          mainTimerDisplay : 
          undefined
        }
        statusCounts={getStatusCounts()}
        isSubmitting={isSubmitting}
        testType={mockTestData ? 'mock' : testMode}
        testName={mockTestData?.test.name}
      />

      {/* Auto Submission Overlay */}
      <AutoSubmissionOverlay isVisible={showAutoSubmissionOverlay} />

    </div>
  )
}
