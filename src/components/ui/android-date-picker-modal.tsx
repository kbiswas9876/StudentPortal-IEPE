'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface AndroidDatePickerModalProps {
  value: string // YYYY-MM-DD
  onChange: (dateStr: string) => void
  label?: string
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function AndroidDatePickerModal({ value, onChange, label = 'Date of Birth' }: AndroidDatePickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'year'>('calendar')

  // Parse initial date
  const initialDate = value ? new Date(value) : new Date(2002, 0, 15)
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate())

  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear())
        setSelectedMonth(d.getMonth())
        setSelectedDay(d.getDate())
      }
    }
  }, [value])

  const startYear = 1965
  const endYear = 2012
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const totalDays = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const handleConfirmDate = () => {
    const formattedMonth = String(selectedMonth + 1).padStart(2, '0')
    const formattedDay = String(selectedDay).padStart(2, '0')
    const dateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`
    onChange(dateStr)
    setIsOpen(false)
  }

  const formatDisplayValue = (dateStr: string) => {
    if (!dateStr) return 'Select Date of Birth'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
  }

  // Selected Day Name
  const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDay)
  const dayOfWeekName = DAY_NAMES_SHORT[selectedDateObj.getDay()]

  return (
    <div className="relative">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}

      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => {
          setViewMode('calendar')
          setIsOpen(true)
        }}
        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-400 focus:border-[#2cb67d] rounded-xl text-xs text-left font-semibold text-slate-900 flex items-center justify-between transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-[#2cb67d] group-hover:scale-110 transition-transform absolute left-3.5" />
          <span>{formatDisplayValue(value)}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#2cb67d] border border-emerald-100">
          Change
        </span>
      </button>

      {/* Android / Material Style Date Picker Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-80 overflow-hidden"
            >
              {/* Android Top Header Banner */}
              <div className="bg-gradient-to-br from-[#2cb67d] to-[#1cb075] text-white p-5">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')}
                  className="text-xs font-medium text-emerald-100 hover:text-white uppercase tracking-wider block transition-colors mb-0.5"
                >
                  {selectedYear} {viewMode === 'year' ? '▲' : '▼'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className="text-xl font-bold tracking-tight text-white block hover:opacity-90 transition-opacity"
                >
                  {dayOfWeekName}, {MONTH_SHORT[selectedMonth]} {selectedDay}
                </button>
              </div>

              {/* View 1: Calendar Grid View */}
              {viewMode === 'calendar' ? (
                <div className="p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-800">
                      {MONTH_NAMES[selectedMonth]} {selectedYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Names Header */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {DAYS_OF_WEEK.map((d, i) => (
                      <span key={i} className="text-[10px] font-bold text-slate-400">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8" />
                    ))}

                    {Array.from({ length: totalDays }).map((_, i) => {
                      const dayNum = i + 1
                      const isSelected = selectedDay === dayNum

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => setSelectedDay(dayNum)}
                          className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#2cb67d] text-white shadow-md font-bold scale-105'
                              : 'hover:bg-emerald-50 text-slate-800'
                          }`}
                        >
                          {dayNum}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* View 2: Material Year Picker Grid */
                <div className="p-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="grid grid-cols-3 gap-2">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setSelectedYear(y)
                          setViewMode('calendar')
                        }}
                        className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                          selectedYear === y
                            ? 'bg-[#2cb67d] text-white shadow-sm font-bold'
                            : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-[#2cb67d]'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDate}
                  className="px-4 py-1.5 text-xs font-bold bg-[#2cb67d] hover:bg-[#24b47e] text-white rounded-xl shadow-xs transition-colors"
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
