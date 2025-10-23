'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Clock, Globe, Save, Loader2, Mail, CheckCircle2 } from 'lucide-react'

interface NotificationPreferences {
  enable_email_reminders: boolean
  enable_in_app_reminders: boolean
  reminder_time: string
  user_timezone: string
}

interface NotificationSettingsFormProps {
  userId: string
}

// Common IANA timezones for easier selection
const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST - Asia/Kolkata)', offset: 'UTC+5:30' },
  { value: 'America/New_York', label: 'Eastern Time (America/New_York)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (America/Chicago)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (America/Denver)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (America/Los_Angeles)', offset: 'UTC-8' },
  { value: 'Europe/London', label: 'London (Europe/London)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (Europe/Berlin)', offset: 'UTC+1' },
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai)', offset: 'UTC+4' },
  { value: 'Asia/Singapore', label: 'Singapore (Asia/Singapore)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'Auckland (Pacific/Auckland)', offset: 'UTC+12' },
];

export default function NotificationSettingsForm({ userId }: NotificationSettingsFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enable_email_reminders: true,
    enable_in_app_reminders: true,
    reminder_time: '09:00',
    user_timezone: 'Asia/Kolkata',
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/user/notification-preferences?userId=${userId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch preferences')
      }

      setPreferences(result.data)
    } catch (err) {
      console.error('Error fetching notification preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...preferences,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save preferences')
      }

      setSuccessMessage('Notification preferences saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving notification preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-8 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Notification Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Configure how and when you receive review reminders
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8 space-y-6">
        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/60 text-red-800 dark:text-red-200 rounded-xl backdrop-blur-sm flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="p-4 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 rounded-xl backdrop-blur-sm flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-App Reminders Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Enable In-App Reminders
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Show notifications within the app when reviews are due
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreferences(prev => ({ ...prev, enable_in_app_reminders: !prev.enable_in_app_reminders }))}
              className={`
                relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300
                ${preferences.enable_in_app_reminders 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25' 
                  : 'bg-slate-300 dark:bg-slate-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
                  ${preferences.enable_in_app_reminders ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Email Reminders Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="group"
        >
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Enable Email Reminders
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Receive email notifications for due reviews
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreferences(prev => ({ ...prev, enable_email_reminders: !prev.enable_email_reminders }))}
              className={`
                relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300
                ${preferences.enable_email_reminders 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-300 dark:bg-slate-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
                  ${preferences.enable_email_reminders ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Reminder Time Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-5 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Preferred Reminder Time
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Choose what time you&apos;d like to receive daily reminders
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="time"
                value={preferences.reminder_time}
                onChange={(e) => setPreferences(prev => ({ ...prev, reminder_time: e.target.value }))}
                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Timezone Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-5 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Your Timezone
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Select your local timezone for accurate reminder delivery
                </p>
              </div>
            </div>
            <div className="relative">
              <select
                value={preferences.user_timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, user_timezone: e.target.value }))}
                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Preview</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                You will receive reminders at{' '}
                <span className="font-bold text-blue-900 dark:text-blue-100">{preferences.reminder_time}</span>{' '}
                <span className="font-medium">{preferences.user_timezone.split('/')[1]}</span>
                {preferences.enable_in_app_reminders && preferences.enable_email_reminders && ' via both in-app and email notifications'}
                {preferences.enable_in_app_reminders && !preferences.enable_email_reminders && ' via in-app notifications only'}
                {!preferences.enable_in_app_reminders && preferences.enable_email_reminders && ' via email notifications only'}
                {!preferences.enable_in_app_reminders && !preferences.enable_email_reminders && ' (no notifications enabled)'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Save Preferences</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

