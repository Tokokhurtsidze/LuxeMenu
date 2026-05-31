'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type SiteTheme = 'dark' | 'light'

interface ThemeCtx {
  theme: SiteTheme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('aura_theme') as SiteTheme | null
    const t = stored === 'light' ? 'light' : 'dark'
    apply(t)
    setTheme(t)
  }, [])

  function apply(t: SiteTheme) {
    document.documentElement.classList.toggle('light', t === 'light')
    document.documentElement.classList.toggle('dark-mode', t === 'dark')
  }

  function toggleTheme() {
    const next: SiteTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('aura_theme', next)
    apply(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
