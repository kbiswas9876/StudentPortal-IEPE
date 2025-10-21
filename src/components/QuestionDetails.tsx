'use client'

import React from 'react'
import '../styles/QuestionDetails.css'

interface QuestionDetailsProps {
  source?: string
  tags?: string[]
  hideMetadata?: boolean
}

const QuestionDetails: React.FC<QuestionDetailsProps> = ({ source, tags, hideMetadata = false }) => {
  // If hideMetadata is true, don't render anything
  if (hideMetadata) {
    return null
  }
  
  if (!source && (!tags || tags.length === 0)) {
    return null
  }

  return (
    <div className="question-details-card">
      {source && (
        <div className="detail-item">
          <span className="detail-label">Source:</span>
          <span className="detail-value">{source}</span>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="detail-item">
          <span className="detail-label">Tags:</span>
          <div className="tags-container">
            {tags.map((tag, index) => (
              <span key={index} className="tag-pill">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionDetails
