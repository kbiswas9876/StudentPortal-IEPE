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
  GraduationCap, Mail, Lock, User, MapPin, 
  BookOpen, Clock, AlertCircle, ArrowRight, 
  RotateCcw, ShieldAlert, LogOut, Eye, EyeOff, Building2, UserCheck,
  Zap, BarChart3, BookmarkCheck, Check, Sparkles
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, userProfile, signOut, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // RENDER 1: Email Verification Sent Screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/70 via-indigo-50/40 to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-indigo-500/10"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Email Sent</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            We sent a verification link to <strong className="text-indigo-600 font-semibold">{signUpEmail}</strong>. 
            Please check your email inbox and click the link to confirm your account.
          </p>
          <button
            onClick={() => {
              setEmailSent(false)
              setActiveTab('signin')
            }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/25"
          >
            Return to Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  // RENDER 2: Logged-in User Status Gate Screens
  if (user && userProfile) {
    // Pending Admin Approval (ENHANCED RICH FEATURE DISCOVERY)
    if (userProfile.status === 'pending') {
      return (
        <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/60 via-slate-50 to-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 max-w-xl w-full text-slate-900 shadow-2xl shadow-amber-500/5 my-8"
          >
            {/* Header with Hourglass Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                <Clock className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Pending Admin Approval</h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Welcome <strong className="text-amber-700">{userProfile.full_name || user.email}</strong>! Your email is verified. 
                Your profile is currently undergoing review by our team.
              </p>
            </div>

            {/* Profile Summary Badge */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 mb-6 text-xs text-amber-950 flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-800 uppercase tracking-wider block text-[10px]">Target Exam</span>
                <span className="font-bold text-sm">{userProfile.target_exam || 'General Competitive'}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                  <Clock className="w-3.5 h-3.5" /> Under Review
                </span>
              </div>
            </div>

            {/* Feature Discovery Card: What you can explore once approved */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                What You&apos;ll Unlock Once Approved:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-start gap-2.5 shadow-2xs">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900 block">Spaced Repetition (SRS)</strong>
                    <span className="text-slate-500 text-[11px]">SM-2 algorithm for long-term memory retention</span>
                  </div>
                </div>
                <div className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-start gap-2.5 shadow-2xs">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900 block">Mock Test Engine</strong>
                    <span className="text-slate-500 text-[11px]">Timed exams with real-time proctoring</span>
                  </div>
                </div>
                <div className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-start gap-2.5 shadow-2xs">
                  <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900 block">Performance Analytics</strong>
                    <span className="text-slate-500 text-[11px]">Accuracy, speed & topic weakness analysis</span>
                  </div>
                </div>
                <div className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-start gap-2.5 shadow-2xs">
                  <BookmarkCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900 block">Custom Revision Hub</strong>
                    <span className="text-slate-500 text-[11px]">Bookmarks, personal notes & difficulty tags</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        </div>
      )
    }

    // Correction Required Screen
    if (userProfile.status === 'correction_required') {
      return (
        <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50/60 via-slate-50 to-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 max-w-xl w-full text-slate-900 shadow-2xl shadow-rose-500/5 my-8"
          >
            <div className="flex items-center gap-3.5 mb-6 border-b border-slate-200/80 pb-4">
              <div className="w-12 h-12 bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Revision Required for Approval</h2>
                <p className="text-xs text-rose-600 font-medium">Please review feedback and update your profile</p>
              </div>
            </div>

            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">Feedback from Administrator</h4>
              <p className="text-sm text-rose-950 italic">
                &ldquo;{userProfile.rejection_reason || 'Please correct your details and resubmit for approval.'}&rdquo;
              </p>
            </div>

            <form onSubmit={handleResubmitCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={correctionFullName}
                  onChange={(e) => setCorrectionFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 bg-slate-50/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <div className="bg-slate-100/90 text-slate-700 font-bold text-xs px-3 py-2.5 border-r border-slate-200 flex items-center gap-1.5 shrink-0 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={correctionPhone}
                    onChange={(e) => handleCorrectionPhoneChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isResubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isResubmitting ? 'Resubmitting...' : 'Resubmit for Approval'}
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 text-sm"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )
    }

    // Suspended Screen
    if (userProfile.status === 'suspended') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
          >
            <div className="w-16 h-16 bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h2>
            <p className="text-slate-600 text-sm mb-6">
              Your account has been suspended by administration. Please contact support.
            </p>
            <button
              onClick={() => signOut()}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200"
            >
              Sign Out
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

        {/* LEFT TEAL OVERLAY PANEL (Matching Image Theme #2cb67d) */}
        <div className="w-full md:w-[40%] bg-gradient-to-br from-[#2cb67d] via-[#24b47e] to-[#1cb075] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          
          {/* Company Branding Logo */}
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-serif italic font-bold text-xl tracking-wide text-white block leading-none">
                IEPE Portal
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-100 opacity-90">
                Educational Excellence
              </span>
            </div>
          </div>

          {/* Central Welcome Hero Copy */}
          <div className="my-8 md:my-auto text-center z-10 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'signup' ? (
                <motion.div
                  key="welcome-back"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                    Welcome Back!
                  </h2>
                  <p className="text-sm text-emerald-50/90 font-medium max-w-xs mx-auto leading-relaxed">
                    To keep connected with us please login with your personal info
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('signin')
                      setError('')
                    }}
                    className="mt-6 px-10 py-3 bg-transparent border-2 border-white rounded-full text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-[#2cb67d] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    SIGN IN
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="hello-friend"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                    Hello, Student!
                  </h2>
                  <p className="text-sm text-emerald-50/90 font-medium max-w-xs mx-auto leading-relaxed">
                    Enter your personal details and start your exam preparation journey with us
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('signup')
                      setError('')
                    }}
                    className="mt-6 px-10 py-3 bg-transparent border-2 border-white rounded-full text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-[#2cb67d] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    SIGN UP
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Illustration Graphic (Matching reference image mobile app vector) */}
          <div className="relative z-10 flex items-end justify-center pt-4">
            <div className="relative w-44 h-36 flex items-end justify-center">
              {/* Phone Frame */}
              <div className="w-28 h-36 bg-white rounded-t-2xl border-4 border-slate-200 shadow-xl flex flex-col p-2 space-y-2 relative overflow-hidden">
                <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
                <div className="w-full h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#2cb67d]" />
                </div>
                <div className="space-y-1">
                  <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
                  <div className="w-1/2 h-1.5 bg-slate-200 rounded" />
                </div>
                <div className="w-8 h-4 bg-[#2cb67d] rounded-md mt-auto" />
              </div>
              {/* Character standing next to phone */}
              <div className="absolute right-2 bottom-0 w-10 h-20 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-200 border border-amber-300" />
                <div className="w-6 h-9 bg-[#2cb67d] rounded-t-md mt-0.5" />
                <div className="w-5 h-9 bg-slate-800 rounded-b-md" />
              </div>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/10 rounded-full pointer-events-none" />
        </div>

        {/* RIGHT WHITE FORM PANEL */}
        <div className="w-full md:w-[60%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-xl mx-auto w-full">
            
            {/* Form Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#2cb67d] tracking-tight mb-1.5">
                {activeTab === 'signup' ? 'Create Account' : 'Sign In to Portal'}
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
