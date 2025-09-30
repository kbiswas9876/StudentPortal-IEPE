'use client'

import React from 'react'
import KatexRenderer from '@/components/ui/KatexRenderer'

export default function LatexTestPage() {
  const testContent = [
    {
      title: "Inline Math",
      content: "The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and it's very useful."
    },
    {
      title: "Block Math",
      content: "Here's a complex equation: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$"
    },
    {
      title: "Mixed Content",
      content: "Solve for $x$: $2x + 3 = 7$. The answer is $x = 2$ because $$2(2) + 3 = 4 + 3 = 7$$"
    },
    {
      title: "Advanced Math",
      content: "The derivative of $f(x) = x^2$ is $f'(x) = 2x$. Using the power rule: $$\\frac{d}{dx}[x^n] = nx^{n-1}$$"
    },
    {
      title: "Error Handling",
      content: "This should show an error: $\\invalid{latex}$ and this should work: $x^2 + y^2 = r^2$"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            LaTeX Rendering Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            This page demonstrates the universal LaTeX rendering capabilities across the application.
          </p>
        </div>

        <div className="space-y-8">
          {testContent.map((item, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {item.title}
              </h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <KatexRenderer 
                  content={item.content}
                  className="text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            LaTeX Support Features
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>✅ Inline math with $...$ delimiters</li>
            <li>✅ Block math with $$...$$ delimiters</li>
            <li>✅ Error handling for invalid LaTeX</li>
            <li>✅ Consistent styling across all components</li>
            <li>✅ Dark mode support</li>
            <li>✅ Responsive design</li>
            <li>✅ Fast rendering with KaTeX</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
