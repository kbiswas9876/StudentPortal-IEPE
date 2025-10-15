'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { ChevronLeftIcon, DocumentArrowDownIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function UploadContentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [bookName, setBookName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.jsonl')) {
      setError('Only .jsonl files are allowed')
      return
    }
    
    setSelectedFile(file)
    setError(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/user-content/template')
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'questions_template.jsonl'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      setError('Failed to download template file')
    }
  }

  const handleUpload = async () => {
    if (!user || !bookName || !selectedFile) return

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('bookName', bookName)
      formData.append('file', selectedFile)

      console.log('Uploading custom content:', { bookName, fileName: selectedFile.name })

      const response = await fetch('/api/user-content', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload content')
      }

      console.log('Content uploaded successfully:', result.data)
      setSuccess(`Successfully uploaded ${result.data.questionCount} questions from ${result.data.totalLines} lines`)
      
      // Reset form
      setBookName('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading content:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload content')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/my-content')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Add New Book/Sheet
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Upload your custom question sets to create personalized practice sessions
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Step 1: Template Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Step 1: Download Template
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Download the template file to see the exact format required for your questions. The template includes examples with LaTeX mathematical notation support.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Download Template File</span>
            </motion.button>
          </motion.div>

          {/* Step 2: Book Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Step 2: Book/Sheet Name
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name your content
              </label>
              <input
                type="text"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="e.g., My Math Practice Set"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Step 3: File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Step 3: Upload File
            </h2>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Drag and drop your .jsonl file here
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  or click to browse files
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jsonl"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentArrowDownIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Step 4: Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              disabled={!bookName || !selectedFile || uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-5 w-5" />
                  <span>Upload & Process</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-1">Upload Successful!</h3>
              <p>{success}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-1">Upload Failed</h3>
              <p>{error}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
