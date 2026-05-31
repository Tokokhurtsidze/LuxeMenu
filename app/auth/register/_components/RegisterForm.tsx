'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Registration failed.')
      setLoading(false)
      return
    }

    // Auto-sign in after registration
    await signIn('credentials', { email, password, redirect: false })
    router.push('/onboard')
    router.refresh()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass gold-border rounded-2xl p-8 space-y-5"
    >
      {/* Name */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Alex Kvaratskhelia"
          className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@restaurant.com"
          className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Password <span className="text-white/20">(min 8 chars)</span></label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 pr-10 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 text-center">
          {error}
        </motion.p>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black font-bold text-sm tracking-wide hover:shadow-gold-glow transition-shadow disabled:opacity-60"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Create Account
      </motion.button>

      <p className="text-[11px] text-white/20 text-center leading-relaxed">
        By creating an account you agree to our Terms of Service.
      </p>
    </motion.form>
  )
}
