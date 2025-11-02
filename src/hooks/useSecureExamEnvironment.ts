'use client'

import { useEffect } from 'react'
import { useToast } from '@/lib/toast-context'

// Define the props the hook will accept
interface UseSecureExamEnvironmentProps {
  isEnabled: boolean // Hook is only active if this is true (i.e., for mock tests)
  onViolation: (violationType: string) => void // Function to call when a violation occurs
}

export function useSecureExamEnvironment({ isEnabled, onViolation }: UseSecureExamEnvironmentProps) {
  const { showToast } = useToast()
  
  // This effect runs only once when the hook is mounted if enabled
  useEffect(() => {
    if (!isEnabled) return

    // NOTE: Fullscreen is now requested in SecureAgreementPage.tsx's handleStartTest
    // This ensures it's triggered by a direct user gesture (click), which is required
    // by modern browsers like Chrome and Firefox for security reasons.
    // The hook's responsibility is only to MONITOR fullscreen exits, not to request it.

    // --- ACTIVE MONITORING EVENT LISTENERS ---

    // 1. Monitor for Fullscreen Exit (Primary job)
    const handleFullscreenChange = () => {
      // Check for all vendor-specific fullscreen states
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )

      // If the test is supposed to be active but we are no longer in fullscreen, it's a violation.
      if (!isFullscreen) {
        onViolation('fullscreen_exit')
      }
    }
    
    // Support multiple fullscreen change events for cross-browser compatibility
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // 2. Disable Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      showToast({
        type: 'warning',
        title: 'Right-click Disabled',
        message: 'Right-click is disabled during the exam.',
        duration: 2000,
      })
    }
    document.addEventListener('contextmenu', handleContextMenu)

    // 3. Monitor for Losing Focus (Tab/App Switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // THE FIX: Use the same violation type as fullscreen exit to reuse the proven working logic
        onViolation('fullscreen_exit')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 'blur' is a fallback for older browsers or specific cases
    const handleWindowBlur = () => {
      // Only trigger if the page is actually hidden (not just losing focus temporarily)
      if (document.visibilityState === 'hidden') {
        onViolation('window_blur')
      }
    }
    window.addEventListener('blur', handleWindowBlur)

    // 4. Monitor for Prohibited Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Developer Tools
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.altKey && e.key === 'I') // Mac: Cmd+Option+I
      ) {
        e.preventDefault()
        showToast({
          type: 'warning',
          title: 'Developer Tools Disabled',
          message: 'Developer tools are disabled during the exam.',
          duration: 3000,
        })
      }
      
      // Refresh
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'R') {
        e.preventDefault()
        onViolation('refresh_attempt_ctrl_r')
      }
      if (e.key === 'F5') {
        e.preventDefault()
        onViolation('refresh_attempt_f5')
      }
      
      // Copy/Paste
      if ((e.ctrlKey || e.metaKey) && ['C', 'V', 'X', 'A'].includes(e.key.toUpperCase())) {
        e.preventDefault()
        showToast({
          type: 'warning',
          title: 'Copy/Paste Disabled',
          message: 'Copy/Paste is disabled during the exam.',
          duration: 2000,
        })
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    // --- CLEANUP FUNCTION ---
    // This is crucial. It runs when the test is over to remove all listeners.
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('keydown', handleKeyDown)
      
      // Optional: automatically exit fullscreen when the component unmounts (test ends)
      if (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          ;(document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          ;(document as any).msExitFullscreen()
        }
      }
    }
  }, [isEnabled, onViolation, showToast])
}
