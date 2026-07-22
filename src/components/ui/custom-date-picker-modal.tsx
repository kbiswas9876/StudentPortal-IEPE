'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'

interface CustomDatePickerModalProps {
  value: string // YYYY-MM-DD
  onChange: (dateStr: string) => void
  label?: string
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CustomDatePickerModal({ value, onChange, label = 'Date of Birth' }: CustomDatePickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Parse initial date or default to 2002-01-15
  const initialDate = value ? new Date(value) : new Date(2002, 0, 15)
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(value || '')

  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear())
        setCurrentMonth(d.getMonth())
        setSelectedDateStr(value)
      }
    }
  }, [value])

  // Years option (1965 to 2012 for students/aspirants)
  const startYear = 1965
  const endYear = 2012
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const totalDays = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`
    setSelectedDateStr(dateStr)
    onChange(dateStr)
    setIsOpen(false)
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select Date'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl text-xs text-left font-medium text-slate-800 flex items-center justify-between transition-all shadow-xs group"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform absolute left-3" />
          <span className={selectedDateStr ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'}>
            {formatDisplayDate(selectedDateStr)}
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
          {selectedDateStr ? 'Selected' : 'Pick'}
        </span>
      </button>

      {/* Compact Popup Calendar Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-72 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Select Date of Birth</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Month / Year Controls */}
              <div className="flex items-center justify-between mb-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{MONTH_NAMES[currentMonth]}</span>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="bg-white text-xs font-bold text-slate-900 border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 text-center mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <span key={day} className="text-[10px] font-bold text-slate-400 uppercase py-0.5">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-6" />
                ))}

                {Array.from({ length: totalDays }).map((_, i) => {
                  const dayNum = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  const isSelected = selectedDateStr === dateStr

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-6 w-6 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'hover:bg-indigo-50 text-slate-800 hover:text-indigo-600'
                      }`}
                    >
                      {dayNum}
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                <span className="text-slate-500 font-medium">
                  {selectedDateStr ? selectedDateStr : 'No date'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
