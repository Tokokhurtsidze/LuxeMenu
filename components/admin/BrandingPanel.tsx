'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import type { Restaurant, ThemeConfig } from '@/types'
import { useWebLocale } from '@/contexts/WebLocaleContext'

// ── Curated luxury fonts ──────────────────────────────────────────────────────
const DISPLAY_FONTS = [
  { label: 'Playfair Display',   value: 'Playfair Display',   style: 'serif',   preview: 'Classic Luxury' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond', style: 'serif',   preview: 'High Fashion' },
  { label: 'EB Garamond',        value: 'EB Garamond',        style: 'serif',   preview: 'Traditional' },
  { label: 'DM Serif Display',   value: 'DM Serif Display',   style: 'serif',   preview: 'Modern Serif' },
  { label: 'Cinzel',             value: 'Cinzel',             style: 'serif',   preview: 'Roman Grandeur' },
  { label: 'Libre Baskerville',  value: 'Libre Baskerville',  style: 'serif',   preview: 'Refined' },
  { label: 'Raleway',            value: 'Raleway',            style: 'sans',    preview: 'Elegant Sans' },
  { label: 'Josefin Sans',       value: 'Josefin Sans',       style: 'sans',    preview: 'Minimal Modern' },
]

// ── Card glass presets ────────────────────────────────────────────────────────
const CARD_PRESETS = [
  { label: 'Ultra Dark', surface: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)' },
  { label: 'Dark Glass', surface: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)' },
  { label: 'Frosted',    surface: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.15)' },
  { label: 'Subtle',     surface: 'rgba(255,255,255,0.16)', border: 'rgba(255,255,255,0.22)' },
]

// ── Border radius presets ─────────────────────────────────────────────────────
const RADIUS_PRESETS = [
  { label: 'Sharp',    value: '0.375rem' },
  { label: 'Rounded',  value: '1rem'     },
  { label: 'Soft',     value: '1.5rem'   },
  { label: 'Pill',     value: '2rem'     },
]

// ── Category nav styles ───────────────────────────────────────────────────────
const NAV_STYLES = [
  { label: 'Pill',      value: 'pill'      },
  { label: 'Underline', value: 'underline' },
  { label: 'Minimal',   value: 'minimal'   },
]

interface Props {
  restaurant: Restaurant
  onUpdate: (partial: Partial<Restaurant>) => void
}

export default function BrandingPanel({ restaurant, onUpdate }: Props) {
  const { t } = useWebLocale()
  const tc = restaurant.theme_config

  const [name,        setName]        = useState(restaurant.name)
  const [description, setDescription] = useState(restaurant.description ?? '')
  const [logoUrl,     setLogoUrl]     = useState(restaurant.logo_url ?? '')

  // Colors
  const [accent,     setAccent]     = useState(tc.accent_color)
  const [accentFg,   setAccentFg]   = useState(tc.accent_foreground)
  const [background, setBackground] = useState(tc.background)
  const [textColor,  setTextColor]  = useState(tc.text_color   || '#FAFAFA')
  const [textMuted,  setTextMuted]  = useState(tc.text_muted   || 'rgba(255,255,255,0.50)')

  // Font
  const [fontDisplay, setFontDisplay] = useState(tc.font_display || 'Playfair Display')

  // Card preset
  const initPreset = CARD_PRESETS.findIndex(p => p.surface === tc.surface)
  const [cardPreset,  setCardPreset]  = useState(initPreset < 0 ? 1 : initPreset)

  // Radius
  const initRadius = RADIUS_PRESETS.findIndex(r => r.value === tc.card_radius)
  const [radiusPreset, setRadiusPreset] = useState(initRadius < 0 ? 1 : initRadius)

  // Nav style
  const [navStyle, setNavStyle] = useState(tc.nav_style || 'pill')

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const preset = CARD_PRESETS[cardPreset]
  const radius = RADIUS_PRESETS[radiusPreset]

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const theme_config: ThemeConfig = {
      ...tc,
      accent_color:      accent,
      accent_foreground: accentFg,
      background,
      surface:           preset.surface,
      border_color:      preset.border,
      text_color:        textColor,
      text_muted:        textMuted,
      font_display:      fontDisplay,
      font_sans:         tc.font_sans || 'Inter',
      card_radius:       radius.value,
      nav_style:         navStyle,
    }

    const res = await fetch(`/api/admin/${restaurant.slug}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, logo_url: logoUrl, theme_config }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Save failed'); return }

    onUpdate(data.restaurant)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-xl space-y-8">

      {/* ── Identity ─────────────────────────────────────────────── */}
      <Section title={t.aIdentity}>
        <Field label={t.aRestName}>
          <Input value={name} onChange={setName} placeholder="My Restaurant" />
        </Field>
        <Field label={t.aTagline}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="A short line guests see below the restaurant name"
            className={inputCls + ' resize-none'}
          />
        </Field>
        <Field label={t.aLogoUrl}>
          <div className="flex items-center gap-3">
            {logoUrl.startsWith('http') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl} alt="logo"
                className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <Input value={logoUrl} onChange={setLogoUrl} placeholder="https://..." type="url" />
          </div>
        </Field>
      </Section>

      {/* ── Typography ───────────────────────────────────────────── */}
      <Section title={t.aTypography}>
        <Field label={t.aDisplayFont}>
          <div className="grid grid-cols-2 gap-2">
            {DISPLAY_FONTS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFontDisplay(f.value)}
                className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                  fontDisplay === f.value
                    ? 'border-gold/50 bg-gold/8 text-white'
                    : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
                }`}
              >
                <span className="text-base leading-tight" style={{ fontFamily: `'${f.value}', ${f.style}` }}>
                  Aa
                </span>
                <span className="text-[10px] font-medium mt-0.5">{f.label}</span>
                <span className="text-[9px] opacity-50">{f.preview}</span>
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Colors ───────────────────────────────────────────────── */}
      <Section title={t.aColors}>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.aAccentColor}>
              <ColorRow value={accent} onChange={setAccent} />
            </Field>
            <Field label={t.aAccentFg}>
              <ColorRow value={accentFg} onChange={setAccentFg} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.aPageBg}>
              <ColorRow value={background} onChange={setBackground} />
            </Field>
            <Field label={t.aPrimaryText}>
              <ColorRow value={textColor} onChange={setTextColor} />
            </Field>
          </div>
          <Field label={t.aSecondaryText}>
            <Input value={textMuted} onChange={setTextMuted} placeholder="rgba(255,255,255,0.50)" />
          </Field>
        </div>
      </Section>

      {/* ── Cards ────────────────────────────────────────────────── */}
      <Section title={t.aCardStyle}>
        <Field label={t.aCardStyle}>
          <div className="grid grid-cols-4 gap-2">
            {CARD_PRESETS.map((p, i) => (
              <button key={i} type="button" onClick={() => setCardPreset(i)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[10px] font-medium transition-all ${
                  cardPreset === i ? 'border-gold/50 bg-gold/8 text-gold' : 'border-white/8 text-white/40 hover:border-white/20'
                }`}
              >
                <span className="w-8 h-8 rounded-lg border" style={{ background: p.surface, borderColor: p.border }} />
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t.aCardRadius}>
          <div className="grid grid-cols-4 gap-2">
            {RADIUS_PRESETS.map((r, i) => (
              <button key={i} type="button" onClick={() => setRadiusPreset(i)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[10px] font-medium transition-all ${
                  radiusPreset === i ? 'border-gold/50 bg-gold/8 text-gold' : 'border-white/8 text-white/40 hover:border-white/20'
                }`}
              >
                <span className="w-8 h-8 border border-white/20" style={{ borderRadius: r.value }} />
                {r.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <Section title={t.aNavigation}>
        <Field label={t.aTabStyle}>
          <div className="flex gap-2">
            {NAV_STYLES.map(s => (
              <button key={s.value} type="button" onClick={() => setNavStyle(s.value)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  navStyle === s.value ? 'border-gold/50 bg-gold/8 text-gold' : 'border-white/8 text-white/40 hover:border-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Live Preview ─────────────────────────────────────────── */}
      <Section title={t.aLivePreview}>
        <div className="rounded-2xl p-5 overflow-hidden" style={{ backgroundColor: background }}>
          {/* Mini header */}
          <div className="text-center mb-5">
            {logoUrl.startsWith('http') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: accent + 'aa' }}>✦ Menu ✦</p>
            <p className="text-lg font-bold" style={{ color: textColor, fontFamily: `'${fontDisplay}', Georgia, serif` }}>
              {name || 'Restaurant Name'}
            </p>
            {description && <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>{description}</p>}
          </div>

          {/* Mini category nav */}
          <div className="flex gap-2 mb-4">
            {navStyle === 'pill' && (
              <>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: accent, color: accentFg }}>Starters</span>
                <span className="px-3 py-1 rounded-full text-[10px] border" style={{ color: textMuted, borderColor: preset.border }}>Mains</span>
                <span className="px-3 py-1 rounded-full text-[10px] border" style={{ color: textMuted, borderColor: preset.border }}>Desserts</span>
              </>
            )}
            {navStyle === 'underline' && (
              <>
                <span className="px-3 py-1 text-[10px] font-bold border-b-2" style={{ color: accent, borderColor: accent }}>Starters</span>
                <span className="px-3 py-1 text-[10px]" style={{ color: textMuted }}>Mains</span>
                <span className="px-3 py-1 text-[10px]" style={{ color: textMuted }}>Desserts</span>
              </>
            )}
            {navStyle === 'minimal' && (
              <>
                <span className="px-2 py-1 text-[10px] font-bold" style={{ color: accent }}>Starters</span>
                <span className="px-2 py-1 text-[10px]" style={{ color: textMuted }}>Mains</span>
                <span className="px-2 py-1 text-[10px]" style={{ color: textMuted }}>Desserts</span>
              </>
            )}
          </div>

          {/* Mini item card */}
          <div
            className="p-3 flex items-center justify-between"
            style={{ background: preset.surface, border: `1px solid ${preset.border}`, borderRadius: radius.value }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: textColor, fontFamily: `'${fontDisplay}', Georgia, serif` }}>
                Truffle Risotto
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>Carnaroli rice, black truffle</p>
              <p className="text-sm font-bold mt-1" style={{ color: accent, fontFamily: `'${fontDisplay}', Georgia, serif` }}>$48</p>
            </div>
            <button
              className="px-3 py-1.5 text-xs font-bold border"
              style={{ borderColor: accent + '80', color: accent, borderRadius: `calc(${radius.value} / 1.5)` }}
            >
              + Add
            </button>
          </div>
        </div>
      </Section>

      {/* ── Save ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-1">
        {error && <p className="flex-1 text-xs text-red-400">{error}</p>}
        {saved && (
          <p className="flex-1 text-xs text-emerald-400 flex items-center gap-1">
            <Check size={12} /> Saved — refresh the menu to see changes
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gold text-black hover:shadow-gold-glow transition-shadow disabled:opacity-60 ml-auto"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? t.aSaved : t.aSave}
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors'

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hexValue = value.startsWith('#') ? value : '#000000'
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={hexValue}
        onChange={e => onChange(e.target.value)}
        className="w-10 h-9 rounded-lg border border-white/10 bg-obsidian-100 cursor-pointer p-0.5 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputCls + ' font-mono'}
        placeholder="#000000"
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
