'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { webTranslations } from '@/lib/web-i18n'
import type { WebT, WebLocale } from '@/lib/web-i18n'

interface WebLocaleCtx {
  locale: WebLocale
  t: WebT
  setLocale: (l: WebLocale) => void
}

const WebLocaleContext = createContext<WebLocaleCtx>({
  locale: 'en',
  t: webTranslations.en as WebT,
  setLocale: () => {},
})

export function WebLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<WebLocale>('en')

  useEffect(() => {
    const stored = localStorage.getItem('aura_web_locale') as WebLocale | null
    if (stored === 'en' || stored === 'ka') setLocaleState(stored)
  }, [])

  function setLocale(l: WebLocale) {
    setLocaleState(l)
    localStorage.setItem('aura_web_locale', l)
  }

  return (
    <WebLocaleContext.Provider value={{ locale, t: webTranslations[locale] as WebT, setLocale }}>
      {children}
    </WebLocaleContext.Provider>
  )
}

export function useWebLocale(): WebLocaleCtx {
  return useContext(WebLocaleContext)
}
