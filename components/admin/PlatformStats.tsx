'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Store, Users, UtensilsCrossed, QrCode, RefreshCw, LayoutGrid } from 'lucide-react'
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

export default function PlatformStats() {
  const { t } = useWebLocale()

  const [stats,     setStats]     = useState<Stats | null>(null)
  const [recent,    setRecent]    = useState<RecentRestaurant[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch('/api/admin/platform/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setStats(data.stats)
      setRecent(data.recentRestaurants ?? [])
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
    </div>
  )
}
