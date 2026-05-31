'use client'

import Link from 'next/link'
import { useWebLocale } from '@/contexts/WebLocaleContext'

export default function LoginPageText() {
  const { t } = useWebLocale()
  return (
    <>
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-3">AuraMenu</p>
        <h1 className="font-display text-3xl font-bold text-white">{t.welcomeBack}</h1>
        <p className="text-white/40 text-sm mt-2">{t.signInSub}</p>
      </div>
      <p className="text-center text-xs text-white/25 mt-8">
        {t.noAccount}{' '}
        <Link href="/auth/register" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
          {t.createOne}
        </Link>
      </p>
    </>
  )
}
