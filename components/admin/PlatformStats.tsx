'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Users, UtensilsCrossed, QrCode, RefreshCw, LayoutGrid, KeyRound, X, Loader2, Check } from 'lucide-react'
import { useWebLocale } from '@/contexts/WebLocaleContext'

interface Stats {
  restaurants: number
  owners:      number
  items:       number
  categories:  number
  totalScans:  number
}

interface RecentRestaurant {
  _id:          string
  name:         string
  slug:         string
  scan_count:   number
  is_active:    boolean
  theme_config: { accent_color: string }
  createdAt:    string
}

interface Owner {
  _id:       string
  name:      string
  email:     string
  phone?:    string
  createdAt: string
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetModal({ owner, onClose }: { owner: Owner; onClose: () => void }) {
  const [pw,      setPw]      = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 8) { setError('Min 8 characters'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/admin/platform/users/${owner._id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: pw }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed'); return }
    setDone(true)
    setTimeout(onClose, 2000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm glass-dark border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/30 mb-0.5">Reset password for</p>
            <p className="text-sm font-semibold text-white">{owner.name}</p>
            <p className="text-xs text-white/40 font-mono">{owner.email}</p>
          </div>
          <button onClick={onClose} className="p-1 text-white/30 hover:text-white"><X size={16} /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 py-4 text-emerald-400">
            <Check size={28} />
            <p className="text-sm font-medium">Password reset successfully</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">New Password <span className="text-white/20">(min 8 chars)</span></label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-gold/50" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 text-sm">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gold text-black text-sm font-bold disabled:opacity-60">
                {loading && <Loader2 size={13} className="animate-spin" />}
                Reset
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function PlatformStats() {
  const { t } = useWebLocale()

  const [stats,     setStats]     = useState<Stats | null>(null)
  const [recent,    setRecent]    = useState<RecentRestaurant[]>([])
  const [owners,    setOwners]    = useState<Owner[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [resetTarget, setResetTarget] = useState<Owner | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch('/api/admin/platform/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const [statsData, usersData] = await Promise.all([
        res.json(),
        fetch('/api/admin/platform/users', { cache: 'no-store' }).then(r => r.json()),
      ])
      setStats(statsData.stats)
      setRecent(statsData.recentRestaurants ?? [])
      setOwners(usersData.users ?? [])
      setUpdatedAt(new Date())
    } catch {
      // keep old data on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(() => load(true), 60_000)
    return () => clearInterval(id)
  }, [load])

  const CARDS = [
    { label: t.statRestaurants, value: stats?.restaurants, icon: Store,           color: '#D4AF37' },
    { label: t.statOwners,      value: stats?.owners,      icon: Users,           color: '#60a5fa' },
    { label: t.statItems,       value: stats?.items,       icon: UtensilsCrossed, color: '#34d399' },
    { label: t.statCategories,  value: stats?.categories,  icon: LayoutGrid,      color: '#a78bfa' },
    { label: t.statScans,       value: stats?.totalScans,  icon: QrCode,          color: '#f472b6' },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{t.platformTitle}</h2>
          <p className="text-xs text-white/30 mt-1">{t.platformSub}</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-white/40 hover:border-gold/30 hover:text-gold transition-all disabled:opacity-40"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {t.refresh}
        </button>
      </div>

      {updatedAt && (
        <p className="text-[11px] text-white/20 -mt-4">
          {t.lastUpdated}: {updatedAt.toLocaleTimeString()}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass border border-white/8 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/30 font-medium leading-tight">{card.label}</span>
                <Icon size={14} style={{ color: card.color }} />
              </div>
              {loading ? (
                <div className="h-9 w-16 rounded shimmer-skeleton" />
              ) : (
                <motion.p
                  key={card.value}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-3xl font-bold text-white tabular-nums"
                >
                  {(card.value ?? 0).toLocaleString()}
                </motion.p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Restaurant roster */}
      <div>
        <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/25 mb-3">
          {t.allRestaurants}
        </h3>

        <div className="space-y-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl shimmer-skeleton" />
              ))
            : recent.length === 0
              ? <p className="text-white/20 text-sm text-center py-8">No restaurants yet</p>
              : recent.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/admin/${r.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/[0.06] hover:border-gold/20 transition-all group"
                    >
                      {/* Accent dot / initial */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-black text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: r.theme_config?.accent_color ?? '#D4AF37' }}
                      >
                        {r.name[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors truncate">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-white/30 font-mono">/{r.slug}</p>
                      </div>

                      {/* Scan count */}
                      <div className="flex items-center gap-3 flex-shrink-0 text-right">
                        <div>
                          <p className="text-sm font-bold text-white tabular-nums">{(r.scan_count ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-white/25">{t.scans}</p>
                        </div>

                        {/* Status dot */}
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: r.is_active ? '#34d399' : '#f87171' }}
                          />
                          <span className="text-[9px] text-white/20">
                            {r.is_active ? t.active : t.inactive}
                          </span>
                        </div>

                        <span className="text-[11px] text-gold/50 group-hover:text-gold transition-colors hidden sm:block">
                          {t.manage}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))
          }
        </div>
      </div>

      {/* ── Owners / Password Reset ─────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/25 mb-3 flex items-center gap-2">
          <Users size={12} /> Owners — Password Management
        </h3>
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-12 rounded-xl shimmer-skeleton" />)
            : owners.length === 0
              ? <p className="text-white/20 text-sm text-center py-6">No owners yet</p>
              : owners.map(owner => (
                  <div key={owner._id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
                      {owner.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{owner.name}</p>
                      <p className="text-xs text-white/40 font-mono truncate">{owner.email}</p>
                      {owner.phone && <p className="text-xs text-white/25">{owner.phone}</p>}
                    </div>
                    <button
                      onClick={() => setResetTarget(owner)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/40 hover:border-gold/30 hover:text-gold transition-all flex-shrink-0"
                    >
                      <KeyRound size={11} />
                      Reset PW
                    </button>
                  </div>
                ))
          }
        </div>
      </div>

      {/* Reset modal */}
      <AnimatePresence>
        {resetTarget && (
          <ResetModal key={resetTarget._id} owner={resetTarget} onClose={() => setResetTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
