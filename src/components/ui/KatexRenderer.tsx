'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface KatexRendererProps {
  content: string
  className?: string
  errorClassName?: string
}

export default function KatexRenderer({ 
  content, 
  className = '', 
  errorClassName = 'text-red-500 text-sm' 
}: KatexRendererProps) {
  if (!content || typeof content !== 'string') {
    return <span className={className}>[No content]</span>
  }

  try {
    // Split content by LaTeX delimiters while preserving the delimiters
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)
    
    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Skip empty parts
          if (!part.trim()) return null
          
          // Handle block math ($$...$$)
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const mathContent = part.slice(2, -2).trim()
            if (!mathContent) return null
            
            return (
              <BlockMath
                key={index}
                math={mathContent}
                errorColor="#ef4444"
                renderError={(error) => (
                  <span className={errorClassName}>
                    [Invalid Formula: {error.name}]
                  </span>
                )}
              />
            )
          }
          
          // Handle inline math ($...$)
          if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$')) {
            const mathContent = part.slice(1, -1).trim()
            if (!mathContent) return null
            
            return (
              <InlineMath
                key={index}
                math={mathContent}
                errorColor="#ef4444"
                renderError={(error) => (
                  <span className={errorClassName}>
                    [Invalid Formula: {error.name}]
                  </span>
                )}
              />
            )
          }
          
          // Regular text (no LaTeX)
          return <span key={index}>{part}</span>
        })}
      </span>
    )
  } catch (error) {
    // Fallback for any unexpected errors
    return (
      <span className={className}>
        <span className={errorClassName}>[LaTeX Error]</span>
        <span className="ml-2">{content}</span>
      </span>
    )
  }
}

// Utility function to check if content contains LaTeX
export function hasLatex(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  return /\$[\s\S]*?\$/.test(content)
}

// Utility function to extract LaTeX from content
export function extractLatex(content: string): string[] {
  if (!content || typeof content !== 'string') return []
  
  const matches = content.match(/\$[\s\S]*?\$/g) || []
  return matches.map(match => match.slice(1, -1).trim()).filter(Boolean)
}
