'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'

interface RadialPacingControlProps {
  value: number // -1 to 1
  onChange: (value: number) => void
  disabled?: boolean
}

export default function RadialPacingControl({ value, onChange, disabled = false }: RadialPacingControlProps) {
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const size = 180
  const center = size / 2
  const radius = 68 // ⬆️ Increased for smoother larger arc
  const strokeWidth = 10

  // Label and Description
  const getPacingLabel = (val: number) => {
    if (val <= -0.75) return 'Very Intensive'
    if (val <= -0.25) return 'Intensive'
    if (val <= 0.25) return 'Standard'
    if (val <= 0.75) return 'Relaxed'
    return 'Very Relaxed'
  }

  const getPacingDescription = (val: number) => {
    if (val < -0.5) return 'High review frequency. Ideal for exam prep.'
    if (val < 0) return 'Boosted frequency for tough concepts.'
    if (val === 0) return 'Balanced pace for sustainable learning.'
    if (val < 0.5) return 'Gentle pace for confident topics.'
    return 'Light pace for mastered material.'
  }

  // Math helpers
  const valueToAngle = (val: number) => ((Math.max(-1, Math.min(1, val)) + 1) / 2) * 270
  const angleToValue = (angle: number) => (angle / 270) * 2 - 1

  const polarToCartesian = (angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180
    return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) }
  }

  const createArcPath = (start: number, end: number) => {
    const s = polarToCartesian(start)
    const e = polarToCartesian(end)
    const largeArcFlag = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${e.x} ${e.y}`
  }

  const currentAngle = useSpring(valueToAngle(value), { stiffness: 180, damping: 22, mass: 0.4 })
  const handlePos = polarToCartesian(valueToAngle(value))

  // Pointer Control
  const getAngleFromPosition = (clientX: number, clientY: number): number => {
    if (!svgRef.current) return valueToAngle(value)
    const rect = svgRef.current.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    if (angle < 0) angle += 360
    return Math.max(0, Math.min(270, angle))
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    onChange(angleToValue(getAngleFromPosition(e.clientX, e.clientY)))
  }, [disabled, onChange])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    onChange(angleToValue(getAngleFromPosition(e.clientX, e.clientY)))
  }, [isDragging, onChange])

  const handlePointerUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  // Keyboard control
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return
    let newValue = value
    const step = 0.1
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp': newValue = Math.min(1, value + step); break
      case 'ArrowLeft':
      case 'ArrowDown': newValue = Math.max(-1, value - step); break
      case 'Home': newValue = -1; break
      case 'End': newValue = 1; break
      default: return
    }
    e.preventDefault()
    onChange(newValue)
  }, [disabled, value, onChange])

  const progressPath = createArcPath(0, valueToAngle(value))
  const trackPath = createArcPath(0, 270)

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          className="cursor-pointer select-none"
          style={{ touchAction: 'none' }}
        >
          <defs>
            {/* Premium gradient and subtle lighting */}
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="handleGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </radialGradient>
          </defs>

          {/* Background track */}
          <path
            d={trackPath}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Progress path with glow */}
          <motion.path
            d={progressPath}
            stroke="url(#glowGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            animate={{
              filter: isDragging
                ? 'drop-shadow(0 0 12px rgba(96,165,250,0.7))'
                : 'drop-shadow(0 0 6px rgba(59,130,246,0.4))',
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 25 }}
          />

          {/* Handle */}
          <motion.circle
            cx={handlePos.x}
            cy={handlePos.y}
            r={isDragging ? 14 : 12}
            fill="url(#handleGradient)"
            stroke="#2563eb"
            strokeWidth={isDragging ? 3 : 2}
            animate={{
              scale: isDragging ? 1.18 : 1,
              boxShadow: isDragging
                ? '0 0 18px rgba(96,165,250,0.6)'
                : '0 0 8px rgba(96,165,250,0.4)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              filter: isDragging
                ? 'drop-shadow(0 5px 12px rgba(59,130,246,0.5))'
                : 'drop-shadow(0 3px 6px rgba(59,130,246,0.3))',
            }}
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            key={getPacingLabel(value)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 drop-shadow-sm">
              {getPacingLabel(value)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Description */}
      <motion.p
        key={getPacingDescription(value)}
        className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-xs px-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {getPacingDescription(value)}
      </motion.p>
    </div>
  )
}