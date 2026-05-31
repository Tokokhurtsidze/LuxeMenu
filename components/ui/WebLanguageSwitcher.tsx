'use client'

import { motion } from 'framer-motion'
import { useWebLocale } from '@/contexts/WebLocaleContext'
import ThemeToggle from './ThemeToggle'

export default function WebLanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useWebLocale()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ThemeToggle />

      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setLocale(locale === 'en' ? 'ka' : 'en')}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase transition-all"
        style={{
          borderColor: 'rgba(212,175,55,0.4)',
          color: 'var(--gold)',
          background: 'rgba(212,175,55,0.08)',
        }}
      >
        <motion.span
          key={locale}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {locale === 'en' ? 'ქარ' : 'EN'}
        </motion.span>
      </motion.button>
    </div>
  )
}
