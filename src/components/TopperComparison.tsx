'use client'

import React from 'react'
import { SessionResult } from './PerformanceAnalysisDashboard'
import { Check, X, Award, TrendingUp, Shield, Swords } from 'lucide-react'

// Define a more specific type for the topper comparison data
interface TopperComparisonData {
  summary: {
    user: { score: number; accuracy: number; correct: number; incorrect: number; skipped: number; };
    topper: { score: number; accuracy: number; correct: number; incorrect: number; skipped: number; };
  };
  strategicAnalysis: {
    userRightTopperRight: number[];
    userWrongTopperRight: number[];
    userRightTopperWrong: number[];
    userWrongTopperWrong: number[];
  };
}

interface TopperComparisonProps {
  sessionResult: SessionResult & { topperComparison?: TopperComparisonData }
  className?: string
}

const TopperComparison: React.FC<TopperComparisonProps> = ({ sessionResult, className }) => {
  const { topperComparison } = sessionResult

  if (!topperComparison) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-8">
        Topper comparison is not available for this test. This may be because you are the topper!
      </div>
    )
  }

  const { summary, strategicAnalysis } = topperComparison

  const MetricRow = ({ label, userValue, topperValue }) => (
    <tr className="odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/50">
      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{label}</td>
      <td className="px-4 py-3 text-center font-medium text-indigo-600 dark:text-indigo-400">{userValue}</td>
      <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-100">{topperValue}</td>
    </tr>
  )

  const StrategicCard = ({ icon, title, description, count, colorClass }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 ${colorClass}`}>
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">{icon}</div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="ml-auto text-2xl font-bold text-slate-800 dark:text-slate-100">{count}</div>
      </div>
    </div>
  )

  return (
    <div className={className || ''}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Metrics Comparison Table */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Metrics vs. Topper</h3>
          <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Metric</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">You</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Topper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <MetricRow label="Score" userValue={summary.user.score.toFixed(2)} topperValue={summary.topper.score.toFixed(2)} />
                <MetricRow label="Accuracy" userValue={`${summary.user.accuracy.toFixed(1)}%`} topperValue={`${summary.topper.accuracy.toFixed(1)}%`} />
                <MetricRow label="Correct" userValue={summary.user.correct} topperValue={summary.topper.correct} />
                <MetricRow label="Incorrect" userValue={summary.user.incorrect} topperValue={summary.topper.incorrect} />
                <MetricRow label="Skipped" userValue={summary.user.skipped} topperValue={summary.topper.skipped} />
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Strategic Analysis */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Strategic Analysis</h3>
          <div className="space-y-4">
            <StrategicCard 
              icon={<Award className="w-6 h-6 text-yellow-500" />}
              title="Golden Questions"
              description="You got wrong, topper got right. Review these!"
              count={strategicAnalysis.userWrongTopperRight.length}
              colorClass="border-yellow-500"
            />
            <StrategicCard 
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
              title="Confidence Boosters"
              description="You got right, topper got wrong. Well done!"
              count={strategicAnalysis.userRightTopperWrong.length}
              colorClass="border-green-500"
            />
            <StrategicCard 
              icon={<Shield className="w-6 h-6 text-blue-500" />}
              title="Shared Strengths"
              description="You both got these right. Keep it up."
              count={strategicAnalysis.userRightTopperRight.length}
              colorClass="border-blue-500"
            />
            <StrategicCard 
              icon={<Swords className="w-6 h-6 text-red-500" />}
              title="Common Hurdles"
              description="You both struggled here. These are tough questions."
              count={strategicAnalysis.userWrongTopperWrong.length}
              colorClass="border-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopperComparison
