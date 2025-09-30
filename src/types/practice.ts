export type PracticeMode = 'range' | 'quantity'

export interface ChapterConfiguration {
  selected: boolean
  mode: PracticeMode
  values: {
    start?: number
    end?: number
    count?: number
  }
}

export interface PracticeSessionConfig {
  bookCode: string
  chapters: Record<string, ChapterConfiguration>
  questionOrder: 'shuffle' | 'interleaved' | 'sequential'
  testMode: 'practice' | 'timed'
  timeLimitInMinutes?: number
}

export interface QuestionSelection {
  questionIds: string[]
  totalQuestions: number
}
