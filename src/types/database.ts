// SRS Feedback Log Types
export interface SrsFeedbackEntry {
  rating: 1 | 2 | 3 | 4
  timestamp: string
  originalSrsState: {
    srs_repetitions: number
    srs_ease_factor: number
    srs_interval: number
    next_review_date: string | null
  }
}

export type SrsFeedbackLog = Record<string, SrsFeedbackEntry>

export interface Database {
  public: {
    Tables: {
      book_sources: {
        Row: {
          id: number
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: number
          question_id: string
          book_source: string
          chapter_name: string
          question_number_in_book: number
          question_text: string
          options: any // jsonb
          correct_option: string
          solution_text: string | null
          exam_metadata: string | null
          admin_tags: string[] | null
          difficulty: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null
          created_at: string
        }
        Insert: {
          id?: number
          question_id: string
          book_source: string
          chapter_name: string
          question_number_in_book: number
          question_text: string
          options: any
          correct_option: string
          solution_text?: string | null
          exam_metadata?: string | null
          admin_tags?: string[] | null
          difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null
          created_at?: string
        }
        Update: {
          id?: number
          question_id?: string
          book_source?: string
          chapter_name?: string
          question_number_in_book?: number
          question_text?: string
          options?: any
          correct_option?: string
          solution_text?: string | null
          exam_metadata?: string | null
          admin_tags?: string[] | null
          difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null
          created_at?: string
        }
      }
      test_results: {
        Row: {
          id: number
          user_id: string
          test_type: string
          mock_test_id: number | null
          score: number | null
          accuracy: number | null
          total_time_taken: number | null
          submitted_at: string
          score_percentage: number | null
          total_questions: number | null
          total_correct: number | null
          total_incorrect: number | null
          total_skipped: number | null
          session_type: string
          srs_feedback_log: SrsFeedbackLog | null
        }
        Insert: {
          id?: number
          user_id: string
          test_type: string
          mock_test_id?: number | null
          score?: number | null
          accuracy?: number | null
          total_time_taken?: number | null
          submitted_at?: string
          score_percentage?: number | null
          total_questions?: number | null
          total_correct?: number | null
          total_incorrect?: number | null
          total_skipped?: number | null
          session_type?: string
          srs_feedback_log?: SrsFeedbackLog | null
        }
        Update: {
          id?: number
          user_id?: string
          test_type?: string
          mock_test_id?: number | null
          score?: number | null
          accuracy?: number | null
          total_time_taken?: number | null
          submitted_at?: string
          score_percentage?: number | null
          total_questions?: number | null
          total_correct?: number | null
          total_incorrect?: number | null
          total_skipped?: number | null
          session_type?: string
          srs_feedback_log?: SrsFeedbackLog | null
        }
      }
      answer_log: {
        Row: {
          id: number
          result_id: number
          question_id: number
          user_id: string
          user_answer: string | null
          status: string
          time_taken: number
          created_at: string
        }
        Insert: {
          id?: number
          result_id: number
          question_id: number
          user_id: string
          user_answer?: string | null
          status: string
          time_taken: number
          created_at?: string
        }
        Update: {
          id?: number
          result_id?: number
          question_id?: number
          user_id?: string
          user_answer?: string | null
          status?: string
          time_taken?: number
          created_at?: string
        }
      }
      bookmarked_questions: {
        Row: {
          id: string
          user_id: string
          question_id: string
          personal_note: string | null
          custom_tags: string[] | null
          user_difficulty_rating: number | null
          created_at: string
          updated_at: string
          // SRS (Spaced Repetition System) fields
          srs_repetitions: number
          srs_ease_factor: number
          srs_interval: number
          next_review_date: string | null
          is_custom_reminder_active: boolean
          custom_next_review_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          personal_note?: string | null
          custom_tags?: string[] | null
          user_difficulty_rating?: number | null
          created_at?: string
          updated_at?: string
          // SRS fields (optional on insert, will use defaults)
          srs_repetitions?: number
          srs_ease_factor?: number
          srs_interval?: number
          next_review_date?: string | null
          is_custom_reminder_active?: boolean
          custom_next_review_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          personal_note?: string | null
          custom_tags?: string[] | null
          user_difficulty_rating?: number | null
          created_at?: string
          updated_at?: string
          // SRS fields
          srs_repetitions?: number
          srs_ease_factor?: number
          srs_interval?: number
          next_review_date?: string | null
          is_custom_reminder_active?: boolean
          custom_next_review_date?: string | null
        }
      }
      practice_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          plan_type: 'daily' | 'weekly' | 'monthly'
          content: any // JSONB - stores structured plan data
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          plan_type: 'daily' | 'weekly' | 'monthly'
          content: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          plan_type?: 'daily' | 'weekly' | 'monthly'
          content?: any
          created_at?: string
          updated_at?: string
        }
      }
      error_reports: {
        Row: {
          id: string // UUID
          question_id: number
          reported_by_user_id: string // UUID string
          report_description: string
          status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: number
          reported_by_user_id: string
          report_description: string
          status?: 'new' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: number
          reported_by_user_id?: string
          report_description?: string
          status?: 'new' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_notification_preferences: {
        Row: {
          user_id: string
          enable_email_reminders: boolean
          enable_in_app_reminders: boolean
          reminder_time: string
          user_timezone: string
          created_at: string
          updated_at: string
          srs_pacing_mode: number
        }
        Insert: {
          user_id: string
          enable_email_reminders?: boolean
          enable_in_app_reminders?: boolean
          reminder_time?: string
          user_timezone?: string
          created_at?: string
          updated_at?: string
          srs_pacing_mode?: number
        }
        Update: {
          user_id?: string
          enable_email_reminders?: boolean
          enable_in_app_reminders?: boolean
          reminder_time?: string
          user_timezone?: string
          created_at?: string
          updated_at?: string
          srs_pacing_mode?: number
        }
      }
      student_notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
