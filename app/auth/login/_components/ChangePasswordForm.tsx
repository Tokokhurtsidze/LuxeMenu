'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { useWebLocale } from '@/contexts/WebLocaleContext'

const inputCls = 'w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordForm({ open, onClose }: Props) {
  const { locale } = useWebLocale()
  const [email,    setEmail]    = useState('')
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showCur,  setShowCur]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  function reset() {
    setEmail(''); setCurrent(''); setNext(''); setConfirm('')
    setError(null); setSuccess(false)
  }

  function handleClose() { reset(); onClose() }

  const L = locale === 'ka' ? {
    title:    'პაროლის შეცვლა',
    email:    'ელ-ფოსტა',
    current:  'მიმდინარე პაროლი',
    newPw:    'ახალი პაროლი',
    confirm:  'გაიმეორე ახალი პაროლი',
    save:     'შენახვა',
    cancel:   'გაუქმება',
    done:     'პაროლი შეიცვალა!',
    signIn:   'ახლა შეხვიდეთ',
    hint:     'მინ. 8 სიმბოლო',
  } : {
    title:    'Change Password',
    email:    'Email',
    current:  'Current Password',
    newPw:    'New Password',
    confirm:  'Confirm New Password',
    save:     'Save',
    cancel:   'Cancel',
    done:     'Password changed!',
    signIn:   'Sign in now',
    hint:     'min 8 chars',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) { setError(locale === 'ka' ? 'პაროლები არ ემთხვევა.' : 'Passwords do not match.'); return }
    if (next.length < 8)  { setError(locale === 'ka' ? 'მინ. 8 სიმბოლო.' : 'Min 8 characters.'); return }

    setLoading(true); setError(null)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentPassword: current, newPassword: next }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full max-w-sm glass-dark border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-semibold text-white">{L.title}</h2>
                <button onClick={handleClose} className="p-1 text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {success ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Check size={22} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-white">{L.done}</p>
                  <button onClick={handleClose}
                    className="px-5 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:shadow-gold-glow transition-shadow">
                    {L.signIn}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">{L.email}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@restaurant.com" className={inputCls} required />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">{L.current}</label>
                    <div className="relative">
                      <input type={showCur ? 'text' : 'password'} value={current}
                        onChange={e => setCurrent(e.target.value)}
                        placeholder="••••••••" className={inputCls + ' pr-10'} required />
                      <button type="button" onClick={() => setShowCur(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      {L.newPw} <span className="text-white/20">({L.hint})</span>
                    </label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={next}
                        onChange={e => setNext(e.target.value)}
                        placeholder="••••••••" className={inputCls + ' pr-10'} required />
                      <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">{L.confirm}</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••" className={inputCls} required />
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white/70 transition-colors">
                      {L.cancel}
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold text-black text-sm font-bold hover:shadow-gold-glow transition-shadow disabled:opacity-60">
                      {loading && <Loader2 size={13} className="animate-spin" />}
                      {L.save}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
