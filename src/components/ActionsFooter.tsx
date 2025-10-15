'use client'

import React from 'react'
import '../styles/ActionsFooter.css'

interface ActionsFooterProps {
  onClearResponse?: () => void
  onMarkForReview?: () => void
  onSaveAndNext?: () => void
  hasSelection?: boolean
}

const ActionsFooter: React.FC<ActionsFooterProps> = ({
  onClearResponse,
  onMarkForReview,
  onSaveAndNext,
  hasSelection = false
}) => {
  return (
    <footer className="actions-footer">
      <div className="footer-left-zone">
        <button 
          className="action-button secondary"
          onClick={onMarkForReview}
          // Mark for Review should always be enabled - user can mark unanswered questions
        >
          Mark for Review & Next
        </button>
        <button 
          className="action-button tertiary"
          onClick={onClearResponse}
          disabled={!hasSelection}
        >
          Clear Response
        </button>
      </div>
      <div className="footer-right-zone">
        <button 
          className="action-button primary"
          onClick={onSaveAndNext}
          // Save & Next should always be enabled - user can save unanswered questions
        >
          Save & Next
        </button>
      </div>
    </footer>
  )
}

export default ActionsFooter
