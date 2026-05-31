'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

// ─── helpers ────────────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

const SLUG_RE = /^[a-z0-9-]+$/

// ─── shared input className ──────────────────────────────────────────────────

const inputCls =
  'w-full bg-obsidian-100 border border-white/10 text-white rounded-lg px-3 py-2 placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors font-sans text-sm'

// ─── step slide variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
}

// ─── types ───────────────────────────────────────────────────────────────────

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

interface FormData {
  name: string
  slug: string
  description: string
  logo_url: string
  accent_color: string
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="relative flex items-center">
          <motion.div
            animate={{
              width: i === current ? 24 : 8,
              backgroundColor:
                i < current
                  ? '#D4AF37'
                  : i === current
                  ? '#D4AF37'
                  : 'rgba(255,255,255,0.12)',
              boxShadow:
                i === current
                  ? '0 0 12px rgba(212,175,55,0.5)'
                  : 'none',
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
            style={{ width: 8 }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OnboardForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    accent_color: '#D4AF37',
  })

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [hexInput, setHexInput] = useState('#D4AF37')
  const slugCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── field helpers ──────────────────────────────────────────────────────────

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field === 'name') {
      const auto = toSlug(value)
      setForm((prev) => ({ ...prev, name: value, slug: auto }))
      scheduleSlugCheck(auto)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setForm((prev) => ({ ...prev, slug: raw }))
    scheduleSlugCheck(raw)
  }

  const scheduleSlugCheck = useCallback((slug: string) => {
    if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current)
    if (!slug) { setSlugStatus('idle'); return }
    if (!SLUG_RE.test(slug)) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    slugCheckTimeout.current = setTimeout(() => checkSlug(slug), 500)
  }, [])

  const checkSlug = async (slug: string) => {
    try {
      const res = await fetch(`/api/onboard/check?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setSlugStatus(data.available ? 'available' : 'taken')
    } catch {
      setSlugStatus('idle')
    }
  }

  const handleSlugBlur = () => {
    if (form.slug && SLUG_RE.test(form.slug)) {
      if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current)
      checkSlug(form.slug)
    }
  }

  // ── color helpers ──────────────────────────────────────────────────────────

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, accent_color: e.target.value }))
    setHexInput(e.target.value)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setForm((prev) => ({ ...prev, accent_color: val }))
    }
  }

  // keep hex text input in sync with color picker
  useEffect(() => { setHexInput(form.accent_color) }, [form.accent_color])

  // ── navigation ─────────────────────────────────────────────────────────────

  const canNext = () => {
    if (step === 0) {
      return (
        form.name.trim().length > 0 &&
        SLUG_RE.test(form.slug) &&
        form.slug.length > 0 &&
        slugStatus === 'available'
      )
    }
    return true
  }

  const next = () => {
    setDir(1)
    setStep((s) => s + 1)
  }

  const back = () => {
    setDir(-1)
    setStep((s) => s - 1)
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug,
          description: form.description.trim(),
          logo_url: form.logo_url.trim(),
          accent_color: form.accent_color,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      router.push(`/menu/${data.slug}`)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── slug status badge ──────────────────────────────────────────────────────

  const SlugBadge = () => {
    if (slugStatus === 'idle' || !form.slug) return null
    const map: Record<SlugStatus, { label: string; cls: string }> = {
      idle: { label: '', cls: '' },
      checking: { label: 'Checking…', cls: 'text-white/40' },
      available: { label: '✓ Available', cls: 'text-emerald-400' },
      taken: { label: '✗ Taken', cls: 'text-red-400' },
      invalid: { label: 'Only a–z, 0–9, hyphens', cls: 'text-amber-400' },
    }
    const { label, cls } = map[slugStatus]
    return <span className={`text-xs font-sans ${cls}`}>{label}</span>
  }

  // ── steps ──────────────────────────────────────────────────────────────────

  const steps = [
    // Step 0 — Your Restaurant
    <div key="step0" className="space-y-5">
      <div>
        <label className="block text-xs font-sans tracking-widest uppercase text-white/40 mb-2">
          Restaurant Name *
        </label>
        <input
          className={inputCls}
          placeholder="e.g. The Golden Plate"
          value={form.name}
          onChange={set('name')}
          autoFocus
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-sans tracking-widest uppercase text-white/40">
            URL Slug *
          </label>
          <SlugBadge />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs font-sans select-none">
            auramenu.com/menu/
          </span>
          <input
            className={`${inputCls} pl-[140px]`}
            placeholder="my-restaurant"
            value={form.slug}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
          />
        </div>
        <p className="mt-1 text-[11px] text-white/25 font-sans">
          Auto-generated from name — you can edit it.
        </p>
      </div>

      <div>
        <label className="block text-xs font-sans tracking-widest uppercase text-white/40 mb-2">
          Description
        </label>
        <textarea
          className={`${inputCls} resize-none h-20`}
          placeholder="A brief description of your restaurant…"
          value={form.description}
          onChange={set('description')}
        />
      </div>
    </div>,

    // Step 1 — Branding
    <div key="step1" className="space-y-6">
      <div>
        <label className="block text-xs font-sans tracking-widest uppercase text-white/40 mb-2">
          Logo URL
        </label>
        <input
          className={inputCls}
          placeholder="https://example.com/logo.png"
          value={form.logo_url}
          onChange={set('logo_url')}
        />
        {form.logo_url && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logo_url}
              alt="Logo preview"
              className="h-20 w-20 object-contain rounded-xl border border-white/10 bg-obsidian-200 p-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </motion.div>
        )}
      </div>

      <div>
        <label className="block text-xs font-sans tracking-widest uppercase text-white/40 mb-3">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          {/* native color picker wrapped in styled swatch */}
          <label
            className="relative h-10 w-10 rounded-lg border border-white/15 cursor-pointer overflow-hidden shrink-0"
            style={{ backgroundColor: form.accent_color }}
            title="Pick color"
          >
            <input
              type="color"
              value={form.accent_color}
              onChange={handleColorPicker}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <input
            className={`${inputCls} flex-1 font-mono uppercase`}
            placeholder="#D4AF37"
            value={hexInput}
            onChange={handleHexInput}
            maxLength={7}
          />
        </div>

        {/* Preview strip */}
        <motion.div
          animate={{ backgroundColor: form.accent_color }}
          transition={{ duration: 0.3 }}
          className="mt-4 rounded-lg h-8 w-full flex items-center justify-center"
        >
          <span
            className="text-xs font-sans font-semibold tracking-widest uppercase"
            style={{ color: '#000' }}
          >
            Accent Preview
          </span>
        </motion.div>

        <p className="mt-2 text-[11px] text-white/25 font-sans">
          Used for buttons, highlights, and interactive elements.
        </p>
      </div>
    </div>,

    // Step 2 — Review & Launch
    <div key="step2" className="space-y-4">
      <div className="glass rounded-xl p-5 space-y-3">
        {/* Logo */}
        {form.logo_url && (
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logo_url}
              alt="Logo"
              className="h-16 w-16 object-contain rounded-xl border border-white/10 bg-obsidian-200 p-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        <Row label="Restaurant" value={form.name || '—'} />
        <Row label="Slug" value={form.slug || '—'} mono />
        {form.description && <Row label="Description" value={form.description} />}

        {/* Color swatch row */}
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
          <span className="text-xs font-sans tracking-widest uppercase text-white/35">
            Accent Color
          </span>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border border-white/20"
              style={{ backgroundColor: form.accent_color }}
            />
            <span className="text-sm font-mono text-white/70">{form.accent_color}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/30 font-sans text-center leading-relaxed">
        A default <span className="text-white/50">Menu</span> category and a sample dish
        will be created so you can explore the admin panel right away.
      </p>

      {error && (
        <p className="text-xs text-red-400 font-sans text-center">{error}</p>
      )}
    </div>,
  ]

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-glass gold-border">
      <StepIndicator current={step} total={3} />

      {/* Step heading */}
      <div className="mb-6">
        <p className="text-[11px] font-sans tracking-[0.3em] uppercase text-gold/50 mb-1">
          Step {step + 1} of 3
        </p>
        <h2 className="font-display text-xl text-white font-semibold">
          {['Your Restaurant', 'Branding', 'Review & Launch'][step]}
        </h2>
      </div>

      {/* Animated step content */}
      <div className="overflow-hidden min-h-[260px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 gap-3">
        {step > 0 ? (
          <button
            onClick={back}
            className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button
            onClick={next}
            disabled={step === 0 && !canNext()}
            className="px-6 py-2 text-sm font-sans font-semibold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canNext() || step !== 0 ? '#D4AF37' : 'rgba(212,175,55,0.3)',
              color: '#000',
              boxShadow: canNext() || step !== 0 ? '0 0 20px rgba(212,175,55,0.3)' : 'none',
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 sm:flex-none px-8 py-3 text-sm font-sans font-bold rounded-lg transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5D077 50%, #D4AF37 100%)',
              backgroundSize: '200% 100%',
              color: '#000',
              boxShadow: '0 0 30px rgba(212,175,55,0.35), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {submitting ? 'Launching…' : '✦ Launch My Menu'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── small helper component ───────────────────────────────────────────────────

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-white/5 last:border-0 gap-4">
      <span className="text-xs font-sans tracking-widest uppercase text-white/35 shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm text-right break-all ${mono ? 'font-mono text-gold/80' : 'text-white/70 font-sans'}`}
      >
        {value}
      </span>
    </div>
  )
}
