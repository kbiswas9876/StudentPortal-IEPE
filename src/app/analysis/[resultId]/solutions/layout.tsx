import React from 'react'

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 solutions-page-wrapper">
      {children}
    </div>
  )
}
