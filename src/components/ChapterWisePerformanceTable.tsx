'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
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
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Chapter-wise Performance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chapters} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="chapterName" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(240, 240, 240, 0.1)' }}
                contentStyle={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
              />
              <Bar dataKey="accuracy">
                {chapters.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getAccuracyColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-700/80">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Chapter</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Accuracy</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Correct</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Incorrect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {chapters.map((item, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{item.chapterName}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: getAccuracyColor(item.accuracy) }}>{item.accuracy.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">{item.correct}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600">{item.incorrect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}