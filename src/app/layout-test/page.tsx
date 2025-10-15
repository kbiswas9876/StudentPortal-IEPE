'use client'

import QuestionDisplayWindow from '@/components/QuestionDisplayWindow'

export default function LayoutTestPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Complete Interface Demo
          </h1>
          <p className="text-gray-600">
            Parts 1-3 Implementation: Design tokens, layout scaffolding, content components, header, and footer
          </p>
        </div>
        <QuestionDisplayWindow />
      </div>
    </div>
  )
}
