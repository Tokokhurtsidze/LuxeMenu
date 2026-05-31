'use client'

import { useWebLocale } from '@/contexts/WebLocaleContext'
import ThemeToggle from './ThemeToggle'

export default function WebLanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useWebLocale()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Language toggle */}
      <div className="flex items-center gap-1 glass rounded-full px-1 py-1 border"
        style={{ borderColor: 'var(--pg-border)' }}>
        {(['en', 'ka'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => setLocale(lang)}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            style={locale === lang
              ? { backgroundColor: 'var(--gold)', color: 'var(--pg-bg)' }
              : { color: 'var(--pg-fg-muted)' }
            }
          >
            {lang === 'en' ? 'EN' : 'ქარ'}
          </button>
        ))}
      </div>
    </div>
  )
}
