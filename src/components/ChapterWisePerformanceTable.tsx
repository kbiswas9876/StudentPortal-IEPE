'use client'

import React, { useMemo } from 'react'
import { SessionResult } from './PerformanceAnalysisDashboard'
import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']

export interface ChapterPerformance {
  chapterName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timePerQuestion: number;
}

export interface ChapterWisePerformanceTableProps {
  sessionResult: SessionResult;
  className?: string;
}

function calculateChapterPerformance(session: SessionResult): ChapterPerformance[] {
  const { answerLog, questions } = session
  if (!answerLog || !questions) return []

  const questionById = new Map<number, Question>()
  questions.forEach(q => questionById.set(q.id, q))

  const chapterMap = new Map<string, { totalQuestions: number; attempted: number; correct: number; incorrect: number; timeSum: number }>()
  questions.forEach(q => {
    const chapterName = q.chapter_name || 'Unknown'
    if (!chapterMap.has(chapterName)) {
      chapterMap.set(chapterName, { totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSum: 0 })
    }
    chapterMap.get(chapterName)!.totalQuestions += 1
  })

  answerLog.forEach(a => {
    const q = questionById.get(a.question_id)
    if (!q) return
    const chapterName = q.chapter_name || 'Unknown'
    const agg = chapterMap.get(chapterName)!
    if (a.status !== 'skipped') {
      agg.attempted += 1
      agg.timeSum += a.time_taken || 0
    }
    if (a.status === 'correct') agg.correct += 1
    if (a.status === 'incorrect') agg.incorrect += 1
  })

  const result: ChapterPerformance[] = Array.from(chapterMap.entries()).map(([chapterName, agg]) => ({
    chapterName,
    totalQuestions: agg.totalQuestions,
    attempted: agg.attempted,
    correct: agg.correct,
    incorrect: agg.incorrect,
    accuracy: agg.attempted > 0 ? (agg.correct / agg.attempted) * 100 : 0,
    timePerQuestion: agg.attempted > 0 ? agg.timeSum / agg.attempted : 0,
  }))

  return result.sort((a, b) => b.accuracy - a.accuracy)
}

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 70) return '#22c55e'; // green-500
  if (accuracy >= 40) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

export default function ChapterWisePerformanceTable({ sessionResult, className }: ChapterWisePerformanceTableProps) {
  const chapters = useMemo(() => calculateChapterPerformance(sessionResult), [sessionResult])

  return (
    <div className={className || ''}>
      <div className="flex items-center space-x-3 mb-5">
        <div className="h-8 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chapter-wise Performance</h2>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-700/80">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Chapter</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Performance</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Accuracy</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Correct</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Incorrect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {chapters.map((item, idx) => (
              <tr key={idx} className="group odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-all duration-200">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{item.chapterName}</td>
                <td className="px-6 py-4">
                  <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{
                        width: `${item.accuracy}%`,
                        backgroundColor: getAccuracyColor(item.accuracy)
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold" style={{ 
                    color: getAccuracyColor(item.accuracy),
                    backgroundColor: `${getAccuracyColor(item.accuracy)}15`
                  }}>
                    {item.accuracy.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30">
                    {item.correct}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
                    {item.incorrect}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}