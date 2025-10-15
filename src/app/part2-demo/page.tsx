'use client'

import QuestionDisplayWindow from '@/components/QuestionDisplayWindow'

export default function Part2DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Part 2 Implementation Demo
          </h1>
          <p className="text-gray-600">
            Core content components with premium interaction design
          </p>
        </div>
        
        <QuestionDisplayWindow />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Part 2 Features Implemented
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">QuestionCard Component</h3>
                <ul className="text-blue-600 text-sm space-y-1">
                  <li>• Clean, readable question display</li>
                  <li>• Optimal line length (920px max-width)</li>
                  <li>• Premium card styling with shadows</li>
                  <li>• Typography using design tokens</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">OptionCard Component</h3>
                <ul className="text-green-600 text-sm space-y-1">
                  <li>• Physical button interaction model</li>
                  <li>• Hover: subtle lift effect</li>
                  <li>• Active: scale-down press feedback</li>
                  <li>• Selected: clear visual state</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">State Management</h3>
                <ul className="text-purple-600 text-sm space-y-1">
                  <li>• React state for option selection</li>
                  <li>• TypeScript interfaces</li>
                  <li>• Clean component composition</li>
                  <li>• Mock data integration</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Design System</h3>
                <ul className="text-orange-600 text-sm space-y-1">
                  <li>• All styles use design tokens</li>
                  <li>• Consistent spacing & colors</li>
                  <li>• Smooth transitions</li>
                  <li>• Professional visual hierarchy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
