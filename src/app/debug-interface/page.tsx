'use client'

import QuestionDisplayWindow from '@/components/QuestionDisplayWindow'

export default function DebugInterfacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔧 Debug Interface - CSS Loading Test
          </h1>
          <p className="text-gray-600">
            This page tests if the new QuestionDisplayWindow component is loading correctly
          </p>
        </div>
        
        <QuestionDisplayWindow />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ✅ CSS Loading Diagnostic
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">If you see the new design above:</h3>
                <ul className="text-green-600 text-sm space-y-1">
                  <li>✅ Design tokens are loading correctly</li>
                  <li>✅ Component CSS files are being imported</li>
                  <li>✅ New components are rendering</li>
                  <li>✅ The interface redesign is working!</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">If you still see the old design:</h3>
                <ul className="text-red-600 text-sm space-y-1">
                  <li>❌ Browser cache needs clearing (Ctrl+Shift+R)</li>
                  <li>❌ Development server needs restart</li>
                  <li>❌ CSS files may not be loading</li>
                  <li>❌ Check browser Network tab for CSS files</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
