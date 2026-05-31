'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import { Download, Copy, Check, QrCode, ExternalLink } from 'lucide-react'
import type { Restaurant } from '@/types'
import { useWebLocale } from '@/contexts/WebLocaleContext'

interface Props {
  restaurantSlug: string
  restaurantName: string
  restaurant?: Restaurant
}

const STORAGE_KEY = 'aura_site_domain'

export default function QrGenerator({ restaurantSlug, restaurantName, restaurant }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [copied,   setCopied]   = useState(false)
  const [domain,   setDomain]   = useState('')
  const [editing,  setEditing]  = useState(false)
  const [inputVal, setInputVal] = useState('')

  // Accent color from restaurant branding — fallback to gold
  const { t } = useWebLocale()
  const accent = restaurant?.theme_config?.accent_color ?? '#D4AF37'

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const base = stored || window.location.origin
    setDomain(base)
    setInputVal(base)
  }, [])

  const menuUrl = domain ? `${domain.replace(/\/$/, '')}/menu/${restaurantSlug}` : ''

  useEffect(() => {
    if (!canvasRef.current || !menuUrl) return
    QRCode.toCanvas(canvasRef.current, menuUrl, {
      width: 280,
      margin: 2,
      color: { dark: accent, light: '#000000' },
    })
  }, [menuUrl, accent])

  function saveDomain() {
    const cleaned = inputVal.trim().replace(/\/$/, '')
    setDomain(cleaned)
    localStorage.setItem(STORAGE_KEY, cleaned)
    setEditing(false)
  }

  function handleDownload() {
    if (!canvasRef.current) return
    const anchor = document.createElement('a')
    anchor.href = canvasRef.current.toDataURL('image/png')
    anchor.download = `${restaurantSlug}-qr.png`
    anchor.click()
  }

  async function handleCopy() {
    if (!menuUrl) return
    await navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-sm"
    >
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-white">{t.aQrCodes}</h2>
        <p className="text-xs text-white/30 mt-1">
          {t.aUniqueQr} <span className="text-white/60">{restaurantName}</span>
        </p>
      </div>

      {/* Domain config */}
      <div className="glass border border-white/8 rounded-2xl p-5 mb-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 mb-3">
          {t.aSiteDomain}
        </p>

        {editing ? (
          <div className="flex gap-2">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveDomain()}
              placeholder="https://yourdomain.com"
              className="flex-1 bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50"
              autoFocus
            />
            <button
              onClick={saveDomain}
              className="px-3 py-2 rounded-lg bg-gold text-black text-xs font-bold"
            >
              {t.aSave}
            </button>
            <button
              onClick={() => { setInputVal(domain); setEditing(false) }}
              className="px-3 py-2 rounded-lg border border-white/10 text-white/40 text-xs"
            >
              {t.aCancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-sm font-mono text-white/70 truncate">{domain || '—'}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-2 py-1 rounded-lg transition-all"
            >
              {t.aChange}
            </button>
          </div>
        )}

        <p className="mt-2 text-[11px] text-white/25 leading-snug">
          Set your deployed domain so the QR code works in the real world (not localhost).
        </p>
      </div>

      {/* QR card */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-5" style={{ border: `1px solid ${accent}30` }}>
        {/* Canvas */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-xl overflow-hidden"
          style={{ boxShadow: `0 0 32px ${accent}20`, border: `1px solid ${accent}30` }}
        >
          <canvas ref={canvasRef} />
        </motion.div>

        {/* URL */}
        {menuUrl && (
          <div className="w-full">
            <p className="font-mono text-[11px] text-white/40 text-center break-all leading-relaxed">
              {menuUrl}
            </p>
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 mt-1 text-[11px] text-gold/50 hover:text-gold transition-colors"
            >
              <ExternalLink size={11} /> {t.aPreview}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
          >
            <Download size={14} />
            {t.aDownload}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:text-white/80 hover:bg-white/[0.04] transition-colors"
          >
            {copied ? (
              <><Check size={14} className="text-emerald-400" /><span className="text-emerald-400">{t.aCopied}</span></>
            ) : (
              <><Copy size={14} />{t.aCopyLink}</>
            )}
          </motion.button>
        </div>
      </div>

      <p className="mt-4 text-white/20 text-xs text-center leading-relaxed">
        Each restaurant has a unique QR. Download as PNG to print on table cards.
      </p>
    </motion.div>
  )
}
