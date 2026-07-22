'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { EXAM_CATEGORIES, INDIAN_STATES, STUDENT_CATEGORIES } from '@/lib/constants/auth-constants'
import { AndroidDatePickerModal } from '@/components/ui/android-date-picker-modal'
import { CustomSelectDropdown } from '@/components/ui/custom-select-dropdown'
import {
  Hourglass,
  Sparkle,
  Lightning,
  BookOpenText,
  ChartBar,
  BookmarkSimple,
  SignOut,
  EnvelopeSimple,
  WarningCircle,
  ShieldWarning,
  Target,
  ArrowClockwise,
  User as PhosphorUser
} from '@phosphor-icons/react'
import {
  GraduationCap, Mail, Lock, User, MapPin,
  BookOpen, Clock, AlertCircle, ArrowRight,
  RotateCcw, ShieldAlert, LogOut, Eye, EyeOff, Building2, UserCheck
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, userProfile, signOut, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      setSignInEmail('')
      setSignInPassword('')
      setSignUpEmail('')
      setSignUpPassword('')
      setConfirmPassword('')
      setFullName('')
      setError('')
      await signOut()
      setActiveTab('signin')
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Show/Hide Password Toggle States
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Sign Up State
  const [fullName, setFullName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('2002-01-15')
  const [state, setState] = useState('West Bengal')
  const [city, setCity] = useState('')
  const [selectedExamCategory, setSelectedExamCategory] = useState(EXAM_CATEGORIES[0].category)
  const [selectedExam, setSelectedExam] = useState(EXAM_CATEGORIES[0].exams[0])
  const [customExam, setCustomExam] = useState('')
  const [studentCategory, setStudentCategory] = useState(STUDENT_CATEGORIES[0])
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Post Sign Up verification email state
  const [emailSent, setEmailSent] = useState(false)

  // Correction Resubmission State
  const [correctionFullName, setCorrectionFullName] = useState('')
  const [correctionPhone, setCorrectionPhone] = useState('')
  const [correctionDob, setCorrectionDob] = useState('')
  const [correctionState, setCorrectionState] = useState('')
  const [correctionCity, setCorrectionCity] = useState('')
  const [correctionExam, setCorrectionExam] = useState('')
  const [correctionCategory, setCorrectionCategory] = useState('')
  const [isResubmitting, setIsResubmitting] = useState(false)

  useEffect(() => {
    if (userProfile?.status === 'active') {
      router.push('/dashboard')
    } else if (userProfile?.status === 'correction_required') {
      setCorrectionFullName(userProfile.full_name || '')
      setCorrectionPhone(userProfile.phone_number || '')
      setCorrectionDob(userProfile.date_of_birth || '2002-01-15')
      setCorrectionState(userProfile.state || 'West Bengal')
      setCorrectionCity(userProfile.city || '')
      setCorrectionExam(userProfile.target_exam || '')
      setCorrectionCategory(userProfile.student_category || STUDENT_CATEGORIES[0])
    }
  }, [userProfile, router])

  // Phone input sanitizer: Restrict ONLY digits 0-9 up to 10 digits
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10)
    setPhone(digitsOnly)
  }

  const handleCorrectionPhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10)
    setCorrectionPhone(digitsOnly)
  }

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      })

      if (error) throw error

      await refreshProfile()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number.')
      setLoading(false)
      return
    }

    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const finalTargetExam = selectedExam === 'Other (Custom Input)' ? customExam : selectedExam
    if (!finalTargetExam || finalTargetExam.trim() === '') {
      setError('Please specify your Target Exam.')
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phone,
            target_exam: finalTargetExam,
            date_of_birth: dob,
            state,
            city: city.trim(),
            student_category: studentCategory,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            fullName: fullName.trim(),
            email: signUpEmail.trim(),
            phone,
            dob,
            state,
            city: city.trim(),
            targetExam: finalTargetExam,
            studentCategory,
          }),
        })

        const resData = await res.json()
        if (!res.ok) {
          console.warn('Profile register API warning:', resData.error)
        }

        setEmailSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Profile Resubmission (Correction Flow)
  const handleResubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsResubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/auth/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: correctionFullName.trim(),
          phone: correctionPhone,
          dob: correctionDob,
          state: correctionState,
          city: correctionCity.trim(),
          targetExam: correctionExam,
          studentCategory: correctionCategory,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to resubmit profile.')

      await refreshProfile()
    } catch (err: any) {
      setError(err.message || 'Resubmission failed. Please try again.')
    } finally {
      setIsResubmitting(false)
    }
  }

  const activeExamList = EXAM_CATEGORIES.find((c) => c.category === selectedExamCategory)?.exams || []

  // RENDER 1: Email Verification Sent Screen (Dual-Panel Layout)
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffc53d] rounded-full blur-2xl opacity-80 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#f7685b] rounded-full blur-2xl opacity-80 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 max-w-5xl w-full min-h-[640px] flex flex-col md:flex-row overflow-hidden relative border-0 z-10 my-4"
        >
          {/* Left Overlay Panel */}
          <div className="md:w-[42%] bg-gradient-to-tr from-[#2cb67d] via-[#24b47e] to-[#1cb075] p-5 sm:p-7 lg:p-8 text-white flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0 min-h-[600px]">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-xl pointer-events-none" />

            {/* Top Prominent Calcoholics Logo */}
            <div className="relative z-10 w-full flex justify-center items-center pt-1">
              <img
                src="/images/calcoholics-logo.png"
                alt="Calcoholics Logo"
                className="w-80 sm:w-96 lg:w-120 h-auto object-contain brightness-0 invert filter drop-shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                <EnvelopeSimple size={36} weight="fill" className="text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">Check Your Inbox!</h2>
                <p className="text-emerald-50 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                  We sent a verification link to your email. Click the link to activate your student account.
                </p>
              </div>
            </div>
            <div className="h-4 pointer-events-none" />
          </div>

          {/* Right Content Panel */}
          <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
            <div className="max-w-md mx-auto w-full text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#2cb67d]">
                <EnvelopeSimple size={42} weight="fill" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Verification Email Sent</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                We sent an activation link to <strong className="text-[#2cb67d] font-bold">{signUpEmail}</strong>.<br />
                Please check your inbox to confirm your email address.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setActiveTab('signin')
                }}
                className="w-full py-4 bg-[#2cb67d] hover:bg-[#24b47e] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // RENDER 2: Logged-in User Status Gate Screens (Dual-Panel Layout)
  if (user && userProfile) {
    // Pending Admin Approval (DUAL-PANEL LAYOUT MATCHING USER SCREENSHOT)
    if (userProfile.status === 'pending') {
      return (
        <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffc53d] rounded-full blur-2xl opacity-80 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#f7685b] rounded-full blur-2xl opacity-80 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 max-w-6xl w-full min-h-[700px] flex flex-col md:flex-row overflow-hidden relative border-0 z-10 my-4"
          >
            {/* Left Overlay Panel */}
            <div className="md:w-[42%] bg-gradient-to-br from-[#2cb67d] via-[#24b47e] to-[#1cb075] p-5 sm:p-7 lg:p-8 text-white flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0 min-h-[640px]">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-60 h-60 bg-emerald-400/20 rounded-full blur-lg pointer-events-none" />

              {/* Top Prominent Calcoholics Logo */}
              <div className="relative z-10 w-full flex justify-center items-center pt-1">
                <img
                  src="/images/calcoholics-logo.png"
                  alt="Calcoholics Logo"
                  className="w-80 sm:w-96 lg:w-120 h-auto object-contain brightness-0 invert filter drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                  <Hourglass size={36} weight="fill" className="text-white animate-pulse" />
                </div>

                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">Under Review!</h2>
                  <p className="text-emerald-50 text-xs sm:text-sm font-medium leading-relaxed opacity-95 mb-4">
                    Your email is verified. Your student profile is currently undergoing review by our Academic Administration.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs font-bold">
                    <Hourglass size={14} weight="fill" className="animate-spin text-amber-200" />
                    <span>STATUS: PENDING APPROVAL</span>
                  </div>
                </div>
              </div>
              <div className="h-4 pointer-events-none" />
            </div>

            {/* Right Content Panel */}
            <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center relative bg-white overflow-y-auto">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2cb67d] tracking-tight mb-1">
                  Pending Admin Approval
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Welcome <strong className="text-slate-900 font-bold">{userProfile.full_name || user.email}</strong>! Please sit tight while we approve your profile.
                </p>
              </div>

              {/* Profile Summary Badge */}
              <div className="bg-amber-50/70 rounded-2xl p-4.5 mb-6 text-xs text-amber-950 flex items-center justify-between shadow-2xs border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-700 shrink-0">
                    <Target size={22} weight="duotone" />
                  </div>
                  <div>
                    <span className="font-semibold text-amber-800 uppercase tracking-widest block text-[10px]">Target Exam</span>
                    <span className="font-extrabold text-sm text-slate-900">{userProfile.target_exam || 'General Competitive'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-200/60 text-amber-900 font-bold text-xs">
                    <Hourglass size={14} weight="fill" className="text-amber-700 animate-spin" /> Under Review
                  </span>
                </div>
              </div>

              {/* Feature Discovery Grid */}
              <div className="bg-slate-50/80 rounded-2xl p-5 mb-6">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                  <Sparkle size={18} weight="fill" className="text-[#2cb67d]" />
                  What You&apos;ll Unlock Once Approved:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-2xl flex items-start gap-3 shadow-2xs border-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Lightning size={18} weight="fill" />
                    </div>
                    <div>
                      <strong className="font-extrabold text-slate-900 block text-xs">Spaced Repetition (SRS)</strong>
                      <span className="text-slate-500 text-[11px] font-medium leading-snug block mt-0.5">SM-2 memory retention engine</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl flex items-start gap-3 shadow-2xs border-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/70 flex items-center justify-center text-[#2cb67d] shrink-0 mt-0.5">
                      <BookOpenText size={18} weight="fill" />
                    </div>
                    <div>
                      <strong className="font-extrabold text-slate-900 block text-xs">Mock Test Engine</strong>
                      <span className="text-slate-500 text-[11px] font-medium leading-snug block mt-0.5">Timed exams & proctoring</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl flex items-start gap-3 shadow-2xs border-0">
                    <div className="w-8 h-8 rounded-xl bg-teal-100/70 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                      <ChartBar size={18} weight="fill" />
                    </div>
                    <div>
                      <strong className="font-extrabold text-slate-900 block text-xs">Performance Analytics</strong>
                      <span className="text-slate-500 text-[11px] font-medium leading-snug block mt-0.5">Speed & topic weakness analysis</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl flex items-start gap-3 shadow-2xs border-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <BookmarkSimple size={18} weight="fill" />
                    </div>
                    <div>
                      <strong className="font-extrabold text-slate-900 block text-xs">Custom Revision Hub</strong>
                      <span className="text-slate-500 text-[11px] font-medium leading-snug block mt-0.5">Bookmarks & difficulty tags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out Button with Loading Spinner */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
              >
                {isSigningOut ? (
                  <>
                    <ArrowClockwise size={18} weight="bold" className="animate-spin text-[#2cb67d]" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <SignOut size={18} weight="bold" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    // Correction Required Screen (Dual-Panel Layout)
    if (userProfile.status === 'correction_required') {
      return (
        <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffc53d] rounded-full blur-2xl opacity-80 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#f7685b] rounded-full blur-2xl opacity-80 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 max-w-6xl w-full min-h-[700px] flex flex-col md:flex-row overflow-hidden relative border-0 z-10 my-4"
          >
            {/* Left Panel */}
            <div className="md:w-[42%] bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 p-5 sm:p-7 lg:p-8 text-white flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0 min-h-[640px]">
              {/* Top Prominent Calcoholics Logo */}
              <div className="relative z-10 w-full flex justify-center items-center pt-1">
                <img
                  src="/images/calcoholics-logo.png"
                  alt="Calcoholics Logo"
                  className="w-80 sm:w-96 lg:w-120 h-auto object-contain brightness-0 invert filter drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                  <WarningCircle size={36} weight="fill" className="text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">Revision Needed!</h2>
                  <p className="text-rose-100 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                    Please update your registration details based on the administrator feedback on the right.
                  </p>
                </div>
              </div>
              <div className="h-4 pointer-events-none" />
            </div>

            {/* Right Panel Form */}
            <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center relative bg-white overflow-y-auto">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Revision Required for Approval</h2>
              <p className="text-xs text-rose-600 font-bold mb-4">Please review feedback and update your profile</p>

              <div className="bg-rose-50/80 rounded-2xl p-4 mb-5 border-0">
                <h4 className="text-[10px] font-extrabold text-rose-900 uppercase tracking-widest mb-1">Feedback from Administrator</h4>
                <p className="text-xs font-semibold text-rose-950 italic">
                  &ldquo;{userProfile.rejection_reason || 'Please correct your details and resubmit for approval.'}&rdquo;
                </p>
              </div>

              <form onSubmit={handleResubmitCorrection} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={correctionFullName}
                    onChange={(e) => setCorrectionFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
                  <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2cb67d]/20 focus-within:border-[#2cb67d] transition-all">
                    <div className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2.5 border-r border-slate-200 flex items-center gap-1 shrink-0 select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={correctionPhone}
                      onChange={(e) => handleCorrectionPhoneChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                      placeholder="Enter 10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <CustomSelectDropdown
                    label="State"
                    options={INDIAN_STATES}
                    value={correctionState}
                    onChange={setCorrectionState}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={correctionCity}
                      onChange={(e) => setCorrectionCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                      placeholder="e.g. Kolkata"
                    />
                  </div>
                </div>

                <AndroidDatePickerModal
                  value={correctionDob}
                  onChange={(dateStr) => setCorrectionDob(dateStr)}
                  label="Date of Birth"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam</label>
                  <input
                    type="text"
                    value={correctionExam}
                    onChange={(e) => setCorrectionExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isResubmitting}
                    className="flex-1 py-3.5 bg-[#2cb67d] hover:bg-[#24b47e] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <ArrowClockwise size={18} weight="bold" />
                    {isResubmitting ? 'Resubmitting...' : 'Resubmit for Approval'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer border-0 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSigningOut ? <ArrowClockwise size={18} weight="bold" className="animate-spin text-[#2cb67d]" /> : null}
                    <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )
    }

    // Suspended Screen (Dual-Panel Layout)
    if (userProfile.status === 'suspended') {
      return (
        <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 max-w-md w-full p-8 text-center border-0 z-10"
          >
            <div className="w-20 h-20 bg-rose-100/80 rounded-3xl flex items-center justify-center mx-auto mb-5 text-rose-600">
              <ShieldWarning size={42} weight="fill" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Account Suspended</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
              Your account has been suspended by administration. Please contact support.
            </p>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {isSigningOut ? (
                <>
                  <ArrowClockwise size={18} weight="bold" className="animate-spin text-[#2cb67d]" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <SignOut size={18} weight="bold" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )
    }
  }

  // MAIN RENDER: SPLIT OVERLAY SLIDING CONTAINER DESIGN (Matching Attached Image)
  return (
    <div className="min-h-screen bg-[#eef2f5] relative overflow-hidden flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Decorative Organic Shape Accents (Top Right Coral/Red & Bottom Left Yellow) */}
      <div className="absolute -top-12 -right-12 w-80 h-80 bg-[#ef5350] rounded-[45%] opacity-90 blur-xs pointer-events-none transform rotate-12" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#ffca28] rounded-[50%] opacity-95 blur-xs pointer-events-none transform -rotate-12" />

      {/* Main Dual-Panel Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 border border-white/60 relative z-10 overflow-hidden min-h-[720px] flex flex-col md:flex-row"
      >
        {/* LEFT TEAL OVERLAY PANEL */}
        <div className="w-full md:w-[42%] bg-gradient-to-br from-[#2cb67d] via-[#24b47e] to-[#1cb075] text-white p-5 sm:p-7 lg:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0 min-h-[640px]">

          {/* Decorative Glow Circles */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Prominent Calcoholics Logo */}
          <div className="relative z-10 w-full flex justify-center items-center pt-1">
            <img
              src="/images/calcoholics-logo.png"
              alt="Calcoholics Logo"
              className="w-80 sm:w-96 lg:w-120 h-auto object-contain brightness-0 invert filter drop-shadow-2xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Center Hero Greeting & Button Stack (Aligned with Right Panel Form) */}
          <div className="relative z-10 w-full max-w-sm mx-auto mt-2 mb-2 py-1 space-y-2.5">
            <AnimatePresence mode="wait">
              {activeTab === 'signup' ? (
                <motion.div
                  key="welcome-back"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 w-full"
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Welcome Back!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-50/95 font-medium max-w-xs mx-auto leading-relaxed">
                    To keep connected with us please login with your personal info
                  </p>
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('signin')
                        setError('')
                      }}
                      className="px-10 py-3 bg-transparent border-2 border-white/90 rounded-full text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-[#2cb67d] transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      SIGN IN
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="hello-friend"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 w-full"
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Hello, Student!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-50/95 font-medium max-w-xs mx-auto leading-relaxed">
                    Enter your personal details and start your exam preparation journey with us
                  </p>
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('signup')
                        setError('')
                      }}
                      className="px-10 py-3 bg-transparent border-2 border-white/90 rounded-full text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-[#2cb67d] transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      SIGN UP
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Smartphone & Student Character Vector Art (Matching Mockup Reference) */}
          <div className="relative z-10 w-full mt-auto pt-1 flex justify-center items-end">
            <svg viewBox="0 0 320 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[270px] sm:max-w-[300px] h-auto select-none pointer-events-none drop-shadow-md">
              {/* Plant Leaves (Behind Left Side of Phone) */}
              <g id="plant-leaves">
                <path d="M100 180 C85 155 70 140 70 120 C85 125 95 150 100 180 Z" fill="white" fillOpacity="0.9" />
                <path d="M102 181 C80 168 62 165 52 148 C72 152 88 165 102 181 Z" fill="white" fillOpacity="0.75" />
                <path d="M104 182 C92 174 75 180 65 170 C80 172 94 178 104 182 Z" fill="white" fillOpacity="0.6" />
              </g>

              {/* White Smartphone Body */}
              <g id="smartphone">
                {/* Outer Shell */}
                <rect x="105" y="10" width="105" height="170" rx="18" fill="white" stroke="#e2e8f0" strokeWidth="3" />
                {/* Top Camera/Speaker Notch */}
                <rect x="138" y="17" width="38" height="5" rx="2.5" fill="#cbd5e1" />

                {/* Screen Inner Display Card */}
                <rect x="115" y="32" width="85" height="138" rx="8" fill="#f8fafc" />

                {/* Top Card Box on Phone Screen */}
                <rect x="123" y="44" width="69" height="42" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                {/* 3 Status/Toggle Circles inside Card */}
                <circle cx="146" cy="65" r="5" fill="#e2e8f0" />
                <circle cx="157" cy="65" r="5" fill="#94a3b8" />
                <circle cx="168" cy="65" r="5" fill="#2cb67d" />

                {/* Form Input Dotted Lines / Bars on Phone Screen */}
                {/* Row 1 */}
                <circle cx="127" cy="98" r="2.5" fill="#2cb67d" />
                <circle cx="134" cy="98" r="2.5" fill="#2cb67d" />
                <circle cx="141" cy="98" r="2.5" fill="#2cb67d" />
                <rect x="127" y="106" width="61" height="4" rx="2" fill="#e2e8f0" />

                {/* Row 2 */}
                <circle cx="127" cy="118" r="2.5" fill="#2cb67d" />
                <circle cx="134" cy="118" r="2.5" fill="#2cb67d" />
                <circle cx="141" cy="118" r="2.5" fill="#2cb67d" />
                <rect x="127" y="126" width="61" height="4" rx="2" fill="#e2e8f0" />

                {/* Green Submit Button on Phone Screen */}
                <rect x="162" y="140" width="26" height="12" rx="4" fill="#2cb67d" />
              </g>

              {/* Standing Student Character (Right Side of Phone) */}
              <g id="student-character">
                {/* Hair */}
                <path d="M228 72 C225 64 232 60 238 60 C245 60 250 65 248 73 C245 76 235 76 228 72 Z" fill="#262b40" />
                {/* Face / Head */}
                <circle cx="237" cy="72" r="7" fill="#ffcca0" />
                {/* Neck */}
                <rect x="235" y="78" width="4" height="4" fill="#f8b688" />

                {/* Green T-Shirt / Torso */}
                <path d="M226 82 C226 82 232 81 237 81 C242 81 248 82 248 82 L249 122 L225 122 Z" fill="#2cb67d" />

                {/* Left Arm (Gesturing towards phone screen) */}
                <path d="M227 84 L212 106 L217 108 L229 90 Z" fill="#2cb67d" />
                <circle cx="210" cy="108" r="3.5" fill="#ffcca0" />

                {/* Right Arm */}
                <path d="M247 84 L251 102 L246 104 L243 88 Z" fill="#2cb67d" />
                <circle cx="249" cy="105" r="3" fill="#ffcca0" />

                {/* Dark Trousers / Legs */}
                <rect x="227" y="122" width="9" height="58" rx="2" fill="#262b40" />
                <rect x="238" y="122" width="9" height="58" rx="2" fill="#262b40" />

                {/* Shoes */}
                <path d="M223 180 C223 177 228 177 236 177 L236 182 L223 182 Z" fill="#181c2b" />
                <path d="M238 180 C238 177 243 177 251 177 L251 182 L238 182 Z" fill="#181c2b" />
              </g>

              {/* Base Line at Bottom */}
              <line x1="40" y1="182" x2="270" y2="182" stroke="#262b40" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* RIGHT WHITE FORM PANEL */}
        <div className="w-full md:w-[60%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-xl mx-auto w-full">

            {/* Form Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#2cb67d] tracking-tight mb-1.5">
                {activeTab === 'signup' ? 'Create Account' : 'Sign In to Calcoholics'}
              </h2>

              {/* Subtext */}
              <p className="text-xs font-semibold text-slate-400">
                {activeTab === 'signup' ? 'fill in your details for registration:' : 'enter your email and password:'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'signin' ? (
                /* SIGN IN FORM */
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-4 max-w-md mx-auto"
                >
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        autoComplete="off"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d] transition-all"
                        placeholder="Email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d] transition-all"
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-3 p-1 text-slate-400 hover:text-slate-600"
                        title={showSignInPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#2cb67d] focus:ring-[#2cb67d]/20"
                      />
                      <span>Remember me</span>
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="text-center pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-12 py-3.5 bg-[#2cb67d] hover:bg-[#24b47e] active:scale-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md shadow-emerald-500/20 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Signing in...' : 'SIGN IN'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* SIGN UP FORM (FULL FIELDS + SPACIOUS 2-COLUMN GRID + POPDOWN DROPDOWNS & ANDROID DATE PICKER) */
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d] transition-all"
                        placeholder="Full Name *"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d] transition-all"
                          placeholder="Email *"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Input with Side Prefix */}
                    <div>
                      <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2cb67d]/20 focus-within:border-[#2cb67d] transition-all">
                        <div className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2.5 border-r border-slate-200 flex items-center gap-1 shrink-0 select-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="w-full px-3 py-2.5 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                          placeholder="10-digit Phone *"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* DOB & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AndroidDatePickerModal
                      value={dob}
                      onChange={(dateStr) => setDob(dateStr)}
                      label="Date of Birth *"
                    />
                    <CustomSelectDropdown
                      label="State *"
                      options={INDIAN_STATES}
                      value={state}
                      onChange={setState}
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  {/* City & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d] transition-all"
                          placeholder="e.g. Kolkata"
                        />
                      </div>
                    </div>

                    <CustomSelectDropdown
                      label="Student Category *"
                      options={STUDENT_CATEGORIES}
                      value={studentCategory}
                      onChange={setStudentCategory}
                      icon={<UserCheck className="w-4 h-4" />}
                    />
                  </div>

                  {/* Target Competitive Exam Selector (Two Column Row) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomSelectDropdown
                      label="Exam Category *"
                      options={EXAM_CATEGORIES.map((c) => c.category)}
                      value={selectedExamCategory}
                      onChange={(catName) => {
                        setSelectedExamCategory(catName)
                        const firstExam = EXAM_CATEGORIES.find((c) => c.category === catName)?.exams[0] || ''
                        setSelectedExam(firstExam)
                      }}
                      icon={<BookOpen className="w-4 h-4" />}
                      direction="up"
                    />

                    <CustomSelectDropdown
                      label="Target Exam Name *"
                      options={activeExamList}
                      value={selectedExam}
                      onChange={setSelectedExam}
                      direction="up"
                    />
                  </div>

                  {selectedExam === 'Other (Custom Input)' && (
                    <div>
                      <input
                        type="text"
                        value={customExam}
                        onChange={(e) => setCustomExam(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d]"
                        placeholder="Enter your target exam name"
                        required
                      />
                    </div>
                  )}

                  {/* Passwords (Two Column Row) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d]"
                          placeholder="Password *"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2cb67d]/20 focus:border-[#2cb67d]"
                          placeholder="Confirm Password *"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="text-center pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-12 py-3.5 bg-[#2cb67d] hover:bg-[#24b47e] active:scale-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md shadow-emerald-500/20 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Creating Account...' : 'SIGN UP'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </motion.div>
    </div>
  )
}
