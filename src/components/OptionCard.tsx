'use client'

import React from 'react'
import '../styles/OptionCard.css'
import KatexRenderer from './ui/KatexRenderer'

interface OptionCardProps {
  optionText: string
  isSelected: boolean
  onClick: () => void
  optionId: string
}

const OptionCard: React.FC<OptionCardProps> = ({ optionText, isSelected, onClick, optionId }) => {
  const cardClasses = `option-card ${isSelected ? 'selected' : ''}`

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      <div className="radio-icon">
        {isSelected && <div className="radio-dot"></div>}
      </div>
      <span className="option-text">
        <KatexRenderer content={optionText} />
      </span>
    </div>
  )
}

export default OptionCard
