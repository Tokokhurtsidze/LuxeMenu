'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X } from 'lucide-react'
import { useWebLocale } from '@/contexts/WebLocaleContext'
import WebLanguageSwitcher from '@/components/ui/WebLanguageSwitcher'
import FeaturesGrid from './FeaturesGrid'

const DEMO_EMAIL    = 'demo@auramenu.com'
const DEMO_PASSWORD = 'Demo2025!'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="p-1 text-white/30 hover:text-gold transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const { t } = useWebLocale()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1,   y: 0  }}
        exit={{ scale: 0.9,    y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm glass gold-border rounded-2xl p-7"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
          <X size={16} />
        </button>

        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold/70 mb-1">{t.adminDemo}</p>
        <h2 className="font-display text-xl font-bold text-white mb-1">{t.demoTitle}</h2>
        <p className="text-xs text-white/40 mb-6">{t.demoSubtitle}</p>

        <div className="space-y-3 mb-6">
          {[
            { label: t.demoEmail,    value: DEMO_EMAIL },
            { label: t.demoPassword, value: DEMO_PASSWORD },
          ].map(({ label, value }) => (
            <div key={label} className="glass rounded-xl px-4 py-3 flex items-center justify-between border border-white/8">
              <div>
                <p className="text-[10px] text-white/30 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-mono text-white">{value}</p>
              </div>
              <CopyBtn text={value} />
            </div>
          ))}
        </div>

        <Link
          href="/auth/login"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold text-black font-bold text-sm hover:shadow-gold-glow transition-shadow"
        >
          {t.signIn} →
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function LandingClient() {
  const { t } = useWebLocale()
  const [showDemo, setShowDemo] = useState(false)

  return (
    <>
      {/* ── Fixed navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 py-2.5 glass-dark border-b" style={{ borderColor: 'var(--pg-border)' }}>
        <span className="font-display text-base sm:text-lg font-bold flex-shrink-0" style={{ color: 'var(--gold)' }}>AuraMenu</span>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <WebLanguageSwitcher />
          <Link
            href="/auth/login"
            className="flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border transition-all hover:shadow-gold-glow whitespace-nowrap"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)', background: 'transparent' }}
          >
            {t.signInBtn}
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {showDemo && <DemoModal key="demo" onClose={() => setShowDemo(false)} />}
      </AnimatePresence>

      <main className="font-sans overflow-x-hidden" style={{ backgroundColor: 'var(--pg-bg)', color: 'var(--pg-fg)' }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
          <div className="pointer-events-none absolute inset-0" style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(212,175,55,0.13) 0%, transparent 75%)',
          }} />
          <div className="absolute top-0 inset-x-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.3) 50%, transparent 100%)',
          }} />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <p className="text-xs tracking-[0.4em] uppercase mb-8" style={{ color: 'rgba(212,175,55,0.6)' }}>
              {t.luxuryLabel}
            </p>

            <h1 className="font-display font-bold leading-none mb-6 select-none" style={{
              fontSize: 'clamp(3.5rem, 12vw, 7rem)',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5D077 45%, #D4AF37 75%, #9A7D20 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.02em',
            }}>
              AuraMenu
            </h1>

            <p className="font-display text-xl mb-4 leading-snug" style={{ color: 'var(--pg-fg)' }}>
              {t.tagline}
            </p>

            <div className="flex items-center justify-center gap-3 my-3">
              {[0.3, 0.5, 1, 0.5, 0.3].map((o, i) => (
                <span key={i} className="block rounded-full" style={{ width: i === 2 ? 8 : i === 1 || i === 3 ? 6 : 4, height: i === 2 ? 8 : i === 1 || i === 3 ? 6 : 4, background: `rgba(212,175,55,${o})` }} />
              ))}
            </div>

            <p className="text-sm tracking-widest uppercase mt-2 mb-12 max-w-md" style={{ color: 'var(--pg-fg-muted)' }}>
              {t.subTagline}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/menu/noir-brasserie" className="inline-flex items-center gap-2 font-bold rounded-full transition-all duration-300 hover:shadow-gold-glow hover:scale-105"
                style={{ background: '#D4AF37', color: '#000', padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                {t.viewDemo} →
              </Link>

              <button
                onClick={() => setShowDemo(true)}
                className="inline-flex items-center gap-2 rounded-full transition-all duration-300 hover:bg-white/5 font-sans"
                style={{ background: 'var(--pg-surface)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                {t.adminDemo}
              </button>

              <Link href="/onboard" className="inline-flex items-center gap-2 rounded-full transition-all duration-300 hover:bg-black/5 font-sans text-sm"
                style={{ border: '1px solid var(--pg-border)', color: 'var(--pg-fg-muted)', padding: '0.75rem 1.75rem' }}>
                {t.getStarted}
              </Link>
            </div>

            <p className="mt-12 text-xs tracking-wide" style={{ color: 'var(--pg-fg-muted)' }}>
              {t.socialProof}
            </p>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, var(--pg-bg))' }} />
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase mb-4 font-sans" style={{ color: 'rgba(212,175,55,0.7)' }}>
                {t.featuresLabel}
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'var(--pg-fg)', letterSpacing: '-0.02em' }}>
                {t.featuresTitle1}<br />
                <span style={{ background: 'linear-gradient(90deg, #D4AF37, #F5D077)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t.featuresTitle2}
                </span>
              </h2>
            </div>
            <FeaturesGrid />
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="py-24 px-6" style={{ background: 'var(--pg-surface)' }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs tracking-[0.3em] uppercase mb-16 font-sans" style={{ color: 'rgba(212,175,55,0.7)' }}>
              {t.howItWorks}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {([
                { n: '01', title: t.s1title, desc: t.s1desc },
                { n: '02', title: t.s2title, desc: t.s2desc },
                { n: '03', title: t.s3title, desc: t.s3desc },
              ] as {n:string;title:string;desc:string}[]).map((step) => (
                <div key={step.n} className="text-center relative">
                  <p className="font-display font-bold leading-none mb-4 select-none" style={{ fontSize: '5rem', color: 'rgba(212,175,55,0.12)' }}>{step.n}</p>
                  <h3 className="font-display text-xl text-white mb-2 -mt-8 relative z-10">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────── */}
        <section className="py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs tracking-[0.3em] uppercase mb-16" style={{ color: 'rgba(212,175,55,0.7)' }}>
              {t.pricing}
            </p>
            <div className="max-w-md mx-auto mb-12">
              <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{
                background: 'var(--pg-surface)',
                border: '1px solid rgba(212,175,55,0.45)',
                boxShadow: '0 0 40px rgba(212,175,55,0.15)',
              }}>
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                  {t.premiumPlan}
                </span>
                <p className="font-display text-6xl font-bold mb-1" style={{ color: '#D4AF37' }}>
                  150 ₾
                </p>
                <p className="text-white/40 text-sm mb-8">{t.perMonth}</p>
                <ul className="space-y-3 w-full text-left mb-2">
                  {([t.pf1,t.pf2,t.pf3,t.pf4,t.pf5,t.pf6,t.pf7,t.pf8] as string[]).map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--pg-fg)' }}>
                      <span style={{ color: '#D4AF37' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center">
              <Link href="/onboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-black hover:shadow-gold-glow transition-shadow" style={{ background: '#D4AF37' }}>
                {t.startTrial} →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="py-12 px-6 border-t border-white/5 text-center">
          <p className="font-display text-2xl font-bold mb-2" style={{ color: 'rgba(212,175,55,0.8)' }}>AuraMenu</p>
          <p className="text-xs text-white/20">{t.footer}</p>
          <p className="text-xs text-white/10 mt-2">© 2025</p>
        </footer>
      </main>
    </>
  )
}
