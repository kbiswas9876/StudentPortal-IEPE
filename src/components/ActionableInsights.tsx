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
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">Actionable Insights</h2>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-amber-800 dark:text-amber-300 list-disc list-inside">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionableInsights
