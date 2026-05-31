'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.93 }}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
        isLight
          ? 'border-black/20 bg-black/8 text-black/70 hover:border-black/30'
          : 'border-white/20 bg-white/8 text-white/70 hover:border-gold/40 hover:text-gold'
      } ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0,   opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isLight ? <Moon size={13} /> : <Sun size={13} />}
      </motion.span>
      <span>{isLight ? 'Dark' : 'Light'}</span>
    </motion.button>
  )
}
