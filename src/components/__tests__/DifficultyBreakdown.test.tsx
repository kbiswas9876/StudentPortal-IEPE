import React from 'react'
import { render, screen } from '@testing-library/react'
import DifficultyBreakdown from '../DifficultyBreakdown'

// Mock data for testing
const mockQuestions = [
  {
    id: '1',
    user_id: 'user1',
    question_id: 'q1',
    personal_note: null,
    custom_tags: null,
    user_difficulty_rating: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    questions: {},
    performance: {
      total_attempts: 0,
      correct_attempts: 0,
      success_rate: 0,
      last_attempt_status: 'never_attempted',
      last_attempt_time: null,
      last_attempt_date: null,
      time_trend: null
    }
  },
  {
    id: '2',
    user_id: 'user1',
    question_id: 'q2',
    personal_note: null,
    custom_tags: null,
    user_difficulty_rating: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    questions: {},
    performance: {
      total_attempts: 0,
      correct_attempts: 0,
      success_rate: 0,
      last_attempt_status: 'never_attempted',
      last_attempt_time: null,
      last_attempt_date: null,
      time_trend: null
    }
  },
  {
    id: '3',
    user_id: 'user1',
    question_id: 'q3',
    personal_note: null,
    custom_tags: null,
    user_difficulty_rating: 3,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    questions: {},
    performance: {
      total_attempts: 0,
      correct_attempts: 0,
      success_rate: 0,
      last_attempt_status: 'never_attempted',
      last_attempt_time: null,
      last_attempt_date: null,
      time_trend: null
    }
  },
  {
    id: '4',
    user_id: 'user1',
    question_id: 'q4',
    personal_note: null,
    custom_tags: null,
    user_difficulty_rating: null, // Unrated question
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    questions: {},
    performance: {
      total_attempts: 0,
      correct_attempts: 0,
      success_rate: 0,
      last_attempt_status: 'never_attempted',
      last_attempt_time: null,
      last_attempt_date: null,
      time_trend: null
    }
  }
]

describe('DifficultyBreakdown', () => {
  it('renders difficulty breakdown correctly', () => {
    render(<DifficultyBreakdown questions={mockQuestions} />)
    
    // Check that all difficulty levels are displayed
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // 5-star questions
    
    // Check for unrated questions
    expect(screen.getByText('1 unrated')).toBeInTheDocument()
    
    // Check total count
    expect(screen.getByText('4 total')).toBeInTheDocument()
  })

  it('handles empty questions array', () => {
    const { container } = render(<DifficultyBreakdown questions={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays correct counts for each difficulty level', () => {
    render(<DifficultyBreakdown questions={mockQuestions} />)
    
    // Should show 1 question for each of 1, 2, 3 star ratings
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Should show 0 for 4 and 5 star ratings
    expect(screen.getAllByText('0')).toHaveLength(2)
  })
})
