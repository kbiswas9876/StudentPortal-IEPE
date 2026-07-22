'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface CustomSelectDropdownProps {
  label?: string
  options: (string | Option)[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: React.ReactNode
  direction?: 'down' | 'up'
}

export function CustomSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  icon,
  direction = 'down',
}: CustomSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Normalize options array to { label, value }
  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative w-full ${isOpen ? 'z-[999999]' : 'z-10'}`} ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white border text-left text-xs rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
          isOpen
            ? 'border-[#2cb67d] ring-2 ring-[#2cb67d]/20 bg-white z-[999999]'
            : 'border-slate-200 hover:border-emerald-400'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {icon && <span className="text-slate-400 group-hover:text-[#2cb67d] transition-colors shrink-0">{icon}</span>}
          <span className={`truncate text-xs font-medium ${selectedOption ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2cb67d]' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu with ultra-high elevated z-index and 100% solid opacity */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 right-0 ${
              direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } z-[999999] bg-white opacity-100 border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/25 max-h-48 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-300 isolate`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3.5 py-2 text-xs text-slate-400">No options available</div>
            ) : (
              normalizedOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-[#2cb67d] font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2cb67d] shrink-0" />}
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
