'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Target, Award, TrendingUp } from 'lucide-react'

interface DeckMasteryData {
  learning: { count: number; percentage: number }
  maturing: { count: number; percentage: number }
  mastered: { count: number; percentage: number }
}

interface DeckMasteryChartProps {
  data: DeckMasteryData
}

export default function DeckMasteryChart({ data }: DeckMasteryChartProps) {
  const stages = [
    {
      key: 'learning',
      label: 'Learning',
      description: '< 7 days',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      count: data.learning.count,
      percentage: data.learning.percentage,
    },
    {
      key: 'maturing',
      label: 'Maturing',
      description: '7-30 days',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500',
      count: data.maturing.count,
      percentage: data.maturing.percentage,
    },
    {
      key: 'mastered',
      label: 'Mastered',
      description: '> 30 days',
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500',
      count: data.mastered.count,
      percentage: data.mastered.percentage,
    },
  ]

  const total = data.learning.count + data.maturing.count + data.mastered.count

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Deck Mastery
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Distribution across learning stages
          </p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="mb-6">
        <div className="flex h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          {data.learning.percentage > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.learning.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
              title={`Learning: ${data.learning.percentage}%`}
            />
          )}
          {data.maturing.percentage > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.maturing.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
              title={`Maturing: ${data.maturing.percentage}%`}
            />
          )}
          {data.mastered.percentage > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.mastered.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
              title={`Mastered: ${data.mastered.percentage}%`}
            />
          )}
        </div>
      </div>

      {/* Stage Cards */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br ${stage.color} rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {stage.label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {stage.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {stage.count}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stage.percentage}%
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-600/30 rounded-lg">
          <p className="text-xs text-center text-slate-700 dark:text-slate-300">
            {data.mastered.percentage >= 50
              ? "🎉 Over half your questions are mastered!"
              : data.maturing.percentage >= 40
              ? "📈 Great progress! Questions are maturing well."
              : "🌱 Keep reviewing to move questions through the stages."}
          </p>
        </div>
      )}
    </motion.div>
  )
}

