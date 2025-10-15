'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Clock, Globe, Save, Loader2 } from 'lucide-react'

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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Notification Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure how and when you receive review reminders
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}

        {/* In-App Reminders Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Enable In-App Reminders
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Show notifications within the app when reviews are due
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreferences(prev => ({ ...prev, enable_in_app_reminders: !prev.enable_in_app_reminders }))}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-colors
              ${preferences.enable_in_app_reminders 
                ? 'bg-blue-600' 
                : 'bg-slate-300 dark:bg-slate-600'
              }
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                ${preferences.enable_in_app_reminders ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Email Reminders Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enable Email Reminders
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Receive email notifications for due reviews
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreferences(prev => ({ ...prev, enable_email_reminders: !prev.enable_email_reminders }))}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-colors
              ${preferences.enable_email_reminders 
                ? 'bg-blue-600' 
                : 'bg-slate-300 dark:bg-slate-600'
              }
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                ${preferences.enable_email_reminders ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Reminder Time Input */}
        <div>
          <label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Preferred Reminder Time
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Choose what time you&apos;d like to receive daily reminders
          </p>
          <input
            type="time"
            value={preferences.reminder_time}
            onChange={(e) => setPreferences(prev => ({ ...prev, reminder_time: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Timezone Selector */}
        <div>
          <label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Your Timezone
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Select your local timezone for accurate reminder delivery
          </p>
          <select
            value={preferences.user_timezone}
            onChange={(e) => setPreferences(prev => ({ ...prev, user_timezone: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <span className="font-semibold">Preview:</span> You will receive reminders at{' '}
            <span className="font-bold">{preferences.reminder_time}</span> {preferences.user_timezone}
            {preferences.enable_in_app_reminders && preferences.enable_email_reminders && ' via both in-app and email notifications'}
            {preferences.enable_in_app_reminders && !preferences.enable_email_reminders && ' via in-app notifications only'}
            {!preferences.enable_in_app_reminders && preferences.enable_email_reminders && ' via email notifications only'}
            {!preferences.enable_in_app_reminders && !preferences.enable_email_reminders && ' (no notifications enabled)'}
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Preferences
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

