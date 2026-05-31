'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useWebLocale } from '@/contexts/WebLocaleContext'
import WebLanguageSwitcher from '@/components/ui/WebLanguageSwitcher'
import ChangePasswordForm from './ChangePasswordForm'

const inputCls = 'w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors'

export default function LoginPageClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/admin'
  const { t, locale } = useWebLocale()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [changePw, setChangePw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('Invalid email or password.'); return }
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <main className="min-h-dvh bg-black flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.10) 0%, transparent 70%)' }} />

      {/* Top bar */}
      <div className="absolute top-5 left-5 z-10">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-gold transition-colors">
          {t.backHome}
        </Link>
      </div>
      <div className="absolute top-5 right-5 z-10">
        <WebLanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-3">AuraMenu</p>
          <h1 className="font-display text-3xl font-bold text-white">{t.welcomeBack}</h1>
          <p className="text-white/40 text-sm mt-2">{t.signInSub}</p>
        </div>

        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="glass gold-border rounded-2xl p-8 space-y-5">

          <div>
            <label className="block text-xs text-white/40 mb-1.5">{t.emailLabel}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
              placeholder="you@restaurant.com" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">{t.passwordLabel}</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password" placeholder="••••••••" className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 text-center">{error}</motion.p>}

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black font-bold text-sm tracking-wide hover:shadow-gold-glow transition-shadow disabled:opacity-60">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {t.signInBtn}
          </motion.button>
        </motion.form>

        <p className="text-center text-xs text-white/25 mt-8">
          {t.noAccount}{' '}
          <Link href="/auth/register" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
            {t.createOne}
          </Link>
        </p>

        <p className="text-center text-xs text-white/20 mt-3">
          <button
            onClick={() => setChangePw(true)}
            className="hover:text-white/50 transition-colors underline underline-offset-2"
          >
            {locale === 'ka' ? 'პაროლის შეცვლა?' : 'Change password?'}
          </button>
        </p>
      </div>

      <ChangePasswordForm open={changePw} onClose={() => setChangePw(false)} />
    </main>
  )
}
