'use client'

import { useEffect, useState } from 'react'
// Using API routes instead of direct Supabase calls

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [booksCount, setBooksCount] = useState<number>(0)
  const [questionsCount, setQuestionsCount] = useState<number>(0)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test books API
        const booksResponse = await fetch('/api/books')
        const booksResult = await booksResponse.json()

        if (!booksResponse.ok) {
          setConnectionStatus(`Books Error: ${booksResult.error}`)
          console.error('Books error:', booksResult.error)
        } else {
          setBooksCount(booksResult.data?.length || 0)
          setConnectionStatus('Books API accessible')
        }

        // Test chapters API (using a real book code from your admin panel)
        const chaptersResponse = await fetch('/api/chapters?bookCode=Pinnacle_6800_6th_Ed')
        const chaptersResult = await chaptersResponse.json()

        if (!chaptersResponse.ok) {
          setConnectionStatus(prev => `${prev} | Chapters API Error: ${chaptersResult.error}`)
          console.error('Chapters API error:', chaptersResult.error)
        } else {
          setQuestionsCount(chaptersResult.data?.length || 0)
          setConnectionStatus(prev => `${prev} | Chapters API accessible`)
        }

      } catch (error) {
        setConnectionStatus(`Connection Error: ${error}`)
        console.error('Connection error:', error)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">Supabase Connection Test</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
        Status: {connectionStatus}
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Books:</span> {booksCount}
        </div>
        <div>
          <span className="font-medium">Questions:</span> {questionsCount}
        </div>
      </div>
    </div>
  )
}
