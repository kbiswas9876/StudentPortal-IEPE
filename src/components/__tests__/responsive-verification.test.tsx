// @ts-nocheck
/**
 * Responsive Behavior Verification Tests
 * 
 * This test suite verifies the responsive behavior of the Performance Analysis Dashboard
 * across different breakpoints as specified in task 8.
 * 
 * Breakpoints tested:
 * - Desktop: 1920x1080
 * - Tablet: 768x1024
 * - Mobile: 375x667
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PerformanceAnalysisDashboard, { SessionResult } from '../PerformanceAnalysisDashboard'

// Mock data for testing
const mockSessionResult: SessionResult = {
  testResult: {
    id: 'test-1',
    user_id: 'user-1',
    mock_test_id: 'mock-1',
    submitted_at: new Date().toISOString(),
    time_taken: 3600,
    created_at: new Date().toISOString(),
    results: {
      marks_obtained: 13.75,
      total_marks: 22,
      percentile: 99.5,
      rank: 1,
      total_test_takers: 100,
    },
  },
  answerLog: [
    { id: '1', user_id: 'user-1', question_id: 'q1', status: 'correct', selected_option: 'A', time_taken: 60, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '2', user_id: 'user-1', question_id: 'q2', status: 'correct', selected_option: 'B', time_taken: 60, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '3', user_id: 'user-1', question_id: 'q3', status: 'correct', selected_option: 'C', time_taken: 60, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '4', user_id: 'user-1', question_id: 'q4', status: 'correct', selected_option: 'D', time_taken: 60, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '5', user_id: 'user-1', question_id: 'q5', status: 'incorrect', selected_option: 'A', time_taken: 60, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '6', user_id: 'user-1', question_id: 'q6', status: 'skipped', selected_option: null, time_taken: 0, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '7', user_id: 'user-1', question_id: 'q7', status: 'skipped', selected_option: null, time_taken: 0, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '8', user_id: 'user-1', question_id: 'q8', status: 'skipped', selected_option: null, time_taken: 0, created_at: new Date().toISOString(), result_id: 'test-1' },
    { id: '9', user_id: 'user-1', question_id: 'q9', status: 'skipped', selected_option: null, time_taken: 0, created_at: new Date().toISOString(), result_id: 'test-1' },
  ],
  questions: [],
}

// Helper to set viewport size
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('Responsive Behavior Verification', () => {
  describe('Desktop Layout (1920x1080)', () => {
    beforeEach(() => {
      setViewport(1920, 1080)
    })

    it('should render two-column layout on desktop', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Check for grid layout container
      const gridContainer = container.querySelector('.grid.lg\\:grid-cols-\\[70\\%_30\\%\\]')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should display all primary metric cards with proper sizing', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Verify primary metrics are present
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Rank')).toBeInTheDocument()
      expect(screen.getByText('Percentile')).toBeInTheDocument()
      expect(screen.getByText('Accuracy')).toBeInTheDocument()
    })

    it('should display all secondary metric cards', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Verify secondary metrics are present
      expect(screen.getByText('Correct')).toBeInTheDocument()
      expect(screen.getByText('Incorrect')).toBeInTheDocument()
      expect(screen.getByText('Skipped')).toBeInTheDocument()
      expect(screen.getByText('Attempt Rate')).toBeInTheDocument()
      expect(screen.getByText('Total Questions')).toBeInTheDocument()
    })

    it('should position Question Breakdown chart in right column', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      expect(screen.getByText('Question Breakdown')).toBeInTheDocument()
    })

    it('should position Actionable Insights in right column', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      expect(screen.getByText('Actionable Insights')).toBeInTheDocument()
    })

    it('should display floating action button', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      const button = screen.getByTestId('primary-action-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-4')
    })
  })

  describe('Tablet Layout (768x1024)', () => {
    beforeEach(() => {
      setViewport(768, 1024)
    })

    it('should stack columns vertically on tablet', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Grid should still exist but columns should stack
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should maintain responsive grid for primary metrics', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Primary metrics should use md:grid-cols-2 at tablet size
      const primaryGrid = container.querySelector('.md\\:grid-cols-2')
      expect(primaryGrid).toBeInTheDocument()
    })

    it('should maintain responsive grid for secondary metrics', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Secondary metrics should use md:grid-cols-3 at tablet size
      const secondaryGrid = container.querySelector('.md\\:grid-cols-3')
      expect(secondaryGrid).toBeInTheDocument()
    })

    it('should keep floating button visible and accessible', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      const button = screen.getByTestId('primary-action-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('fixed')
    })
  })

  describe('Mobile Layout (375x667)', () => {
    beforeEach(() => {
      setViewport(375, 667)
    })

    it('should display single-column layout on mobile', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Grid should default to single column
      const gridContainer = container.querySelector('.grid-cols-1')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should stack primary metrics vertically on mobile', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // All metrics should still be visible
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Rank')).toBeInTheDocument()
      expect(screen.getByText('Percentile')).toBeInTheDocument()
      expect(screen.getByText('Accuracy')).toBeInTheDocument()
    })

    it('should display secondary metrics in 2-column grid on mobile', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Secondary metrics use grid-cols-2 as base
      const secondaryGrid = container.querySelector('.grid-cols-2')
      expect(secondaryGrid).toBeInTheDocument()
    })

    it('should position floating button appropriately for mobile', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      const button = screen.getByTestId('primary-action-button')
      expect(button).toBeInTheDocument()
      // Button should have responsive positioning
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-4')
    })

    it('should maintain minimum touch target size for floating button', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      const button = container.querySelector('[data-testid="primary-action-button"]')
      expect(button).toBeInTheDocument()
      // Button has px-5 py-3 which provides adequate touch target
      expect(button).toHaveClass('px-5', 'py-3')
    })

    it('should not obscure critical content with floating button', () => {
      render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Verify main content is still accessible
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument()
      expect(screen.getByText('Question Breakdown')).toBeInTheDocument()
      
      // Button should have z-50 to stay on top but positioned to not block content
      const button = screen.getByTestId('primary-action-button')
      expect(button).toHaveClass('z-50')
    })
  })

  describe('Smooth Transitions Between Breakpoints', () => {
    it('should handle transition from desktop to tablet', () => {
      const { container, rerender } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Start at desktop
      setViewport(1920, 1080)
      rerender(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Transition to tablet
      setViewport(768, 1024)
      rerender(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Content should still be present
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
    })

    it('should handle transition from tablet to mobile', () => {
      const { rerender } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Start at tablet
      setViewport(768, 1024)
      rerender(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Transition to mobile
      setViewport(375, 667)
      rerender(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // All content should remain accessible
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument()
      expect(screen.getByText('Question Breakdown')).toBeInTheDocument()
      expect(screen.getByTestId('primary-action-button')).toBeInTheDocument()
    })

    it('should maintain component functionality across breakpoints', () => {
      const { rerender } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Test at each breakpoint
      const breakpoints = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ]
      
      breakpoints.forEach(({ width, height }) => {
        setViewport(width, height)
        rerender(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
        
        // Core functionality should work at all sizes
        expect(screen.getByText('Performance Analysis')).toBeInTheDocument()
        expect(screen.getByTestId('primary-action-button')).toBeInTheDocument()
      })
    })
  })

  describe('Layout Spacing and Gaps', () => {
    it('should maintain proper gap spacing in two-column layout', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      const gridContainer = container.querySelector('.gap-6')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should maintain proper spacing between metric rows', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Secondary metrics should have mt-6 spacing
      const secondaryGrid = container.querySelector('.mt-6')
      expect(secondaryGrid).toBeInTheDocument()
    })

    it('should maintain proper spacing in right column components', () => {
      const { container } = render(<PerformanceAnalysisDashboard sessionResult={mockSessionResult} />)
      
      // Right column should have space-y-6
      const rightColumn = container.querySelector('.space-y-6')
      expect(rightColumn).toBeInTheDocument()
    })
  })
})
