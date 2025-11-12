'use client'

import React, { useMemo } from 'react'
import { SessionResult } from './PerformanceAnalysisDashboard'
import { Lightbulb } from 'lucide-react'

interface ActionableInsightsProps {
  sessionResult: SessionResult
  className?: string
}

// --- Rule-Based Insights Engine ---
function generateInsights(session: SessionResult): string[] {
  const insights: string[] = []
  const { answerLog, questions, testResult, topperResult } = session

  // Helper to get stats for a subset of questions
  const getStats = (qIds: number[]) => {
    const relevantAnswers = answerLog.filter(a => qIds.includes(a.question_id))
    const attempted = relevantAnswers.filter(a => a.status !== 'skipped').length
    const correct = relevantAnswers.filter(a => a.status === 'correct').length
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0
    return { attempted, correct, accuracy }
  }

  // Rule 1: Low accuracy on Easy questions
  const easyQuestionIds = questions.filter(q => (q as any).difficulty === 'Easy').map(q => q.id)
  if (easyQuestionIds.length > 0) {
    const easyStats = getStats(easyQuestionIds)
    if (easyStats.attempted > 3 && easyStats.accuracy < 80) {
      insights.push(`Your accuracy on 'Easy' questions is ${easyStats.accuracy.toFixed(0)}%. Focusing on fundamentals could be a quick win.`)
    }
  }

  // Rule 2: High accuracy on Hard questions
  const hardQuestionIds = questions.filter(q => (q as any).difficulty === 'Hard').map(q => q.id)
  if (hardQuestionIds.length > 0) {
    const hardStats = getStats(hardQuestionIds)
    if (hardStats.attempted > 2 && hardStats.accuracy > 60) {
      insights.push(`You're performing well on 'Hard' questions (${hardStats.accuracy.toFixed(0)}% accuracy). Great job tackling complex problems!`)
    }
  }

  // Rule 3: Accuracy vs. Topper's Accuracy
  if (topperResult) {
    const userCorrect = answerLog.filter(a => a.status === 'correct').length
    const userAttempted = answerLog.filter(a => a.status !== 'skipped').length
    const userAccuracy = userAttempted > 0 ? (userCorrect / userAttempted) * 100 : 0

    const topperCorrect = topperResult.answerLog.filter(a => a.status === 'correct').length
    const topperAttempted = topperResult.answerLog.filter(a => a.status !== 'skipped').length
    const topperAccuracy = topperAttempted > 0 ? (topperCorrect / topperAttempted) * 100 : 0
    
    if (userAccuracy < topperAccuracy - 15) {
      insights.push(`The topper's accuracy was ${topperAccuracy.toFixed(0)}%, while yours was ${userAccuracy.toFixed(0)}%. Reviewing your incorrect answers is key to closing this gap.`)
    }
  }
  
  // Rule 4: Time Management
  const totalTime = answerLog.reduce((sum, a) => sum + (a.time_taken || 0), 0)
  const timePerQuestion = totalTime / (answerLog.length || 1)
  if (timePerQuestion > 120) { // If avg time is over 2 mins
      insights.push(`Your average time per question is over 2 minutes. Identifying which topics are slowing you down can improve your overall pace.`)
  }

  if (insights.length === 0) {
    insights.push("You've completed the test. Dig into the detailed analysis above to find your own insights!")
  }

  return insights
}


// --- Main Component ---
const ActionableInsights: React.FC<ActionableInsightsProps> = ({ sessionResult, className }) => {
  const insights = useMemo(() => generateInsights(sessionResult), [sessionResult])

  return (
    <div className={className || ''}>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-4 flex items-center space-x-2">
              <span>Actionable Insights</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                {insights.length}
              </span>
            </h2>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-amber-200/50 dark:border-amber-700/50 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionableInsights
