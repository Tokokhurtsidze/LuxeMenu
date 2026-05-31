'use client'

import { useWebLocale } from '@/contexts/WebLocaleContext'
import WebLanguageSwitcher from '@/components/ui/WebLanguageSwitcher'
import OnboardForm from './OnboardForm'

export default function OnboardPageClient() {
  const { t } = useWebLocale()

  return (
    <main className="relative min-h-dvh bg-obsidian flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(212,175,55,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(212,175,55,0.05) 0%, transparent 70%)',
      }} />

      <div className="absolute top-5 right-5 z-10">
        <WebLanguageSwitcher />
      </div>

      <div className="relative z-10 flex flex-col items-center mb-10 select-none">
        <span className="text-xs font-sans tracking-[0.35em] uppercase text-gold/50 mb-3">◆ &nbsp; AuraMenu &nbsp; ◆</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center leading-tight" style={{ textShadow: '0 0 40px rgba(212,175,55,0.15)' }}>
          {t.joinTitle.split('AuraMenu')[0]}
          <span className="text-gold" style={{ textShadow: '0 0 30px rgba(212,175,55,0.4)' }}>AuraMenu</span>
          {t.joinTitle.split('AuraMenu')[1] ?? ''}
        </h1>
        <p className="mt-3 font-sans text-sm text-white/40 tracking-wide text-center">{t.joinSub}</p>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/40 text-[10px]">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <OnboardForm />
      </div>

      <p className="relative z-10 mt-10 text-xs text-white/20 font-sans tracking-wide">
        {t.haveAccount}{' '}
        <a href="/admin" className="text-gold/50 hover:text-gold transition-colors underline underline-offset-2">
          {t.welcomeBack}
        </a>
      </p>
    </main>
  )
}
