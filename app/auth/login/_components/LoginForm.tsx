'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useWebLocale } from '@/contexts/WebLocaleContext'

export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/admin'
  const { t } = useWebLocale()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setError(t.emailLabel === 'Email'
        ? 'Invalid email or password.'
        : 'არასწორი ელ-ფოსტა ან პაროლი.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const inputCls = 'w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors'

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass gold-border rounded-2xl p-8 space-y-5"
    >
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

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 text-center">
          {error}
        </motion.p>
      )}

      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black font-bold text-sm tracking-wide hover:shadow-gold-glow transition-shadow disabled:opacity-60">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {t.signInBtn}
      </motion.button>
    </motion.form>
  )
}
