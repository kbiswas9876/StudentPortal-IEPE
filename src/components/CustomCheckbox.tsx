'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/solid'

interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function CustomCheckbox({ checked, onChange, disabled = false }: CustomCheckboxProps) {
  return (
    <motion.button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
        checked
          ? 'bg-blue-600 border-blue-600'
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckIcon className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
