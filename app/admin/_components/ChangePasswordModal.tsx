'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, Check, Lock } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const inputCls = 'w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 pr-10 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors'

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [current,    setCurrent]    = useState('')
  const [next,       setNext]       = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showCur,    setShowCur]    = useState(false)
  const [showNew,    setShowNew]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  function reset() {
    setCurrent(''); setNext(''); setConfirm('')
    setError(null); setSuccess(false)
  }

  function handleClose() { reset(); onClose() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (next !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true); setError(null)

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Failed to change password.'); return }

    setSuccess(true)
    setTimeout(() => { handleClose() }, 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed z-50 inset-0 flex items-center justify-center px-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full max-w-sm glass-dark border border-white/10 rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-gold" />
                  <h2 className="font-display text-lg font-semibold text-white">Change Password</h2>
                </div>
                <button onClick={handleClose} className="p-1 text-white/30 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {success ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-6 text-emerald-400">
                  <Check size={32} />
                  <p className="text-sm font-medium">Password changed successfully!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PwField label="Current Password" value={current} onChange={setCurrent} show={showCur} toggle={() => setShowCur(v => !v)} />
                  <PwField label="New Password" value={next} onChange={setNext} show={showNew} toggle={() => setShowNew(v => !v)} hint="min 8 characters" />
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Confirm New Password</label>
                    <input
                      type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls.replace('pr-10', '')}
                      required
                    />
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleClose}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white/70 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:shadow-gold-glow transition-shadow disabled:opacity-60">
                      {loading && <Loader2 size={13} className="animate-spin" />}
                      Save
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

function PwField({ label, value, onChange, show, toggle, hint }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; toggle: () => void; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">
        {label} {hint && <span className="text-white/20">({hint})</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className={inputCls}
          required
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}
