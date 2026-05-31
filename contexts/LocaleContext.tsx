'use client'

import { createContext, useContext } from 'react'
import { translations } from '@/lib/i18n'
import type { T, Locale } from '@/lib/i18n'

interface LocaleCtx {
  locale: Locale
  t: T
  setLocale: (l: Locale) => void
}

export const LocaleContext = createContext<LocaleCtx>({
  locale: 'en',
  t: translations.en,
  setLocale: () => {},
})

export function useLocale(): LocaleCtx {
  return useContext(LocaleContext)
}
