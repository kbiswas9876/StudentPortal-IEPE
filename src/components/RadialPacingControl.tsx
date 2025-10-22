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

  const size = 220
  const center = size / 2
  const radius = 85 // ⬆️ Increased for smoother larger arc
  const strokeWidth = 12

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

  // Pointer Control with proper boundary enforcement
  const getAngleFromPosition = (clientX: number, clientY: number): number => {
    if (!svgRef.current) return valueToAngle(value)
    const rect = svgRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    
    // Calculate angle from center (0° is at 3 o'clock, 90° is at 6 o'clock)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    
    // Convert to our coordinate system where 0° is at the start of our arc
    // Our arc starts at 0° and goes to 270°, so we need to adjust
    angle = (angle + 90) % 360
    if (angle < 0) angle += 360
    
    // Now we have angle in 0-360 range, but our arc only goes 0-270
    // Clamp to our arc range
    if (angle > 270) {
      return 270 // End of arc
    } else if (angle < 0) {
      return 0 // Start of arc
    }
    
    return angle
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
    
    const newAngle = getAngleFromPosition(e.clientX, e.clientY)
    const newValue = angleToValue(newAngle)
    
    // Strict boundary enforcement - prevent wrap around
    const clampedValue = Math.max(-1, Math.min(1, newValue))
    
    // Additional check: if we're at the boundaries, don't allow jumping
    if (clampedValue === -1 && value > -0.9) {
      // If we're trying to go to -1 but current value is not close to -1, ignore
      return
    }
    if (clampedValue === 1 && value < 0.9) {
      // If we're trying to go to 1 but current value is not close to 1, ignore
      return
    }
    
    onChange(clampedValue)
  }, [isDragging, onChange, value])

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
            {/* Premium gradient like the reference */}
            <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e0ff" />
              <stop offset="50%" stopColor="#00ff95" />
              <stop offset="100%" stopColor="#ffe66d" />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.7" />
            </linearGradient>
            {/* Brushed Metal Texture */}
            <radialGradient id="metalRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#d9d9d9" />
              <stop offset="100%" stopColor="#a6a6a6" />
            </radialGradient>

            {/* Conical highlight effect to simulate brushed metal */}
            <linearGradient id="metalSweep" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#bcbcbc" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#707070" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#bcbcbc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
            </linearGradient>

            {/* Rim gradient for edge lighting */}
            <radialGradient id="metalEdge" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </radialGradient>

            {/* Soft shadow filter */}
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={trackPath}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Progress path with premium gradient */}
          <motion.path
            d={progressPath}
            stroke="url(#premiumGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            animate={{
              filter: isDragging
                ? 'drop-shadow(0 0 12px rgba(0,224,255,0.7))'
                : 'drop-shadow(0 0 6px rgba(0,224,255,0.4))',
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 25 }}
            className="drop-shadow-md"
          />

           {/* Brushed Metal Button */}
           <g filter="url(#softShadow)">
             <circle
               cx={handlePos.x}
               cy={handlePos.y}
               r={13}
               fill="url(#metalRadial)"
               style={{
                 cursor: isDragging ? 'grabbing' : 'grab',
               }}
             />
             <circle
               cx={handlePos.x}
               cy={handlePos.y}
               r={13}
               fill="url(#metalSweep)"
               style={{ mixBlendMode: "overlay" }}
             />
             <circle
               cx={handlePos.x}
               cy={handlePos.y}
               r={13}
               fill="url(#metalEdge)"
             />
           </g>
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            key={getPacingLabel(value)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 drop-shadow-sm text-center">
              {getPacingLabel(value)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
              {Math.round(((value + 1) / 2) * 100)}% Intensity
            </p>
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