'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem, Category, AllergenTag, DietaryTag, PairedItem, PairingType } from '@/types'
import { useWebLocale } from '@/contexts/WebLocaleContext'

const ALLERGENS: AllergenTag[] = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'seafood', 'sesame']
const DIETARY: DietaryTag[] = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'halal', 'kosher']
const PAIRING_TYPES: PairingType[] = ['wine', 'cocktail', 'dish', 'dessert', 'spirit', 'beer']
const EMPTY_PAIRING: PairedItem = { name: '', type: 'wine', description: '' }

function defaultForm(item?: MenuItem | null): Partial<MenuItem> {
  return {
    name: item?.name ?? '',
    name_ka: item?.name_ka ?? '',
    description: item?.description ?? '',
    description_ka: item?.description_ka ?? '',
    price: item?.price ?? 0,
    image_url: item?.image_url ?? '',
    categorySlug: item?.categorySlug ?? '',
    allergens: item?.allergens ?? [],
    dietary_tags: item?.dietary_tags ?? [],
    paired_items: item?.paired_items ?? [],
    is_featured: item?.is_featured ?? false,
    is_available: item?.is_available ?? true,
    sort_order: item?.sort_order ?? 0,
  }
}

interface Props {
  open: boolean
  item: MenuItem | null
  categories: Category[]
  restaurantSlug: string
  onClose: () => void
  onSaved: (item: MenuItem, isNew: boolean) => void
}

export default function ItemFormModal({ open, item, categories, restaurantSlug, onClose, onSaved }: Props) {
  const { t } = useWebLocale()
  const isNew = !item
  const [form, setForm] = useState(defaultForm(item))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(defaultForm(item))
    setError(null)
  }, [item, open])

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function toggleTag<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  function addPairing() {
    set('paired_items', [...(form.paired_items ?? []), { ...EMPTY_PAIRING }])
  }

  function updatePairing(i: number, field: keyof PairedItem, val: string) {
    const updated = (form.paired_items ?? []).map((p, idx) =>
      idx === i ? { ...p, [field]: val } : p
    )
    set('paired_items', updated)
  }

  function removePairing(i: number) {
    set('paired_items', (form.paired_items ?? []).filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.categorySlug) { setError('Select a category'); return }
    if (!form.name?.trim()) { setError('Name is required'); return }
    if ((form.price ?? 0) <= 0) { setError('Price must be > 0'); return }

    setSaving(true)
    setError(null)

    const url = isNew
      ? `/api/admin/${restaurantSlug}/items`
      : `/api/admin/${restaurantSlug}/items/${item!._id}`

    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, currency: 'GEL' }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Save failed')
      return
    }

    onSaved(data.item, isNew)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col glass-dark border-l border-white/8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  {isNew ? t.aAddMenuItem : t.aEditItem}
                </h2>
                {!isNew && <p className="text-xs text-white/30 mt-0.5">{item!.name}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-gold">
              <div className="px-6 py-5 space-y-6">

                {/* ── Basic Info ── */}
                <Section title={t.aBasicInfo}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t.aNameEn} required>
                      <Input
                        value={form.name ?? ''}
                        onChange={v => set('name', v)}
                        placeholder="e.g. Truffle Risotto"
                      />
                    </Field>
                    <Field label={t.aNameKa}>
                      <Input
                        value={form.name_ka ?? ''}
                        onChange={v => set('name_ka', v)}
                        placeholder="ქართულად"
                      />
                    </Field>
                  </div>

                  <Field label={t.aDescEn}>
                    <Textarea
                      value={form.description ?? ''}
                      onChange={v => set('description', v)}
                      placeholder="Ingredients, preparation style..."
                      rows={3}
                    />
                  </Field>

                  <Field label={t.aDescKa}>
                    <Textarea
                      value={form.description_ka ?? ''}
                      onChange={v => set('description_ka', v)}
                      placeholder="აღწერა ქართულად..."
                      rows={2}
                    />
                  </Field>
                </Section>

                {/* ── Category & Price ── */}
                <Section title={t.aCatPrice}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t.aCategory} required>
                      <select
                        value={form.categorySlug ?? ''}
                        onChange={e => set('categorySlug', e.target.value)}
                        className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50"
                      >
                        <option value="">{t.aSelectCat}</option>
                        {categories.sort((a,b) => a.sort_order - b.sort_order).map(c => (
                          <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t.aSortOrder}>
                      <Input
                        type="number"
                        value={String(form.sort_order ?? 0)}
                        onChange={v => set('sort_order', Number(v))}
                        placeholder="0"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t.aPrice} required>
                      <Input
                        type="number"
                        value={String(form.price ?? 0)}
                        onChange={v => set('price', Number(v))}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </Field>
                  </div>
                </Section>

                {/* ── Image ── */}
                <Section title={t.aImage}>
                  <Field label={t.aImageUrl}>
                    <Input
                      value={form.image_url ?? ''}
                      onChange={v => set('image_url', v)}
                      placeholder="https://..."
                      type="url"
                    />
                  </Field>
                  {form.image_url && (
                    <div className="relative h-32 rounded-xl overflow-hidden bg-obsidian-200 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </Section>

                {/* ── Dietary & Allergens ── */}
                <Section title={t.aDietaryTags}>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY.map(tag => {
                      const active = (form.dietary_tags ?? []).includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => set('dietary_tags', toggleTag(form.dietary_tags ?? [], tag))}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                            active
                              ? 'border-emerald-600/60 bg-emerald-950/60 text-emerald-400'
                              : 'border-white/10 text-white/40 hover:border-white/20'
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </Section>

                <Section title={t.aAllergens}>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGENS.map(tag => {
                      const active = (form.allergens ?? []).includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => set('allergens', toggleTag(form.allergens ?? [], tag))}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                            active
                              ? 'border-amber-600/60 bg-amber-950/60 text-amber-400'
                              : 'border-white/10 text-white/40 hover:border-white/20'
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </Section>

                {/* ── Smart Pairings ── */}
                <Section title={t.aPairings}>
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {(form.paired_items ?? []).map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 glass rounded-xl p-3 border border-white/5"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={p.name}
                              onChange={v => updatePairing(i, 'name', v)}
                              placeholder="e.g. Barolo 2018"
                            />
                            <select
                              value={p.type}
                              onChange={e => updatePairing(i, 'type', e.target.value)}
                              className="bg-obsidian-100 border border-white/10 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-gold/50"
                            >
                              {PAIRING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <div className="col-span-2">
                              <Input
                                value={p.description ?? ''}
                                onChange={v => updatePairing(i, 'description', v)}
                                placeholder="Short pairing note..."
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePairing(i)}
                            className="p-1 text-white/20 hover:text-red-400 transition-colors mt-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={addPairing}
                      className="flex items-center gap-2 text-xs text-white/40 hover:text-gold border border-dashed border-white/10 hover:border-gold/30 w-full py-2 rounded-xl justify-center transition-all"
                    >
                      <Plus size={12} />
                      {t.aAddPairing}
                    </button>
                  </div>
                </Section>

                {/* ── Flags ── */}
                <Section title={t.aOptions}>
                  <div className="flex gap-4">
                    <Toggle
                      label={t.aFeatured}
                      value={form.is_featured ?? false}
                      onChange={v => set('is_featured', v)}
                    />
                    <Toggle
                      label={t.aAvailable}
                      value={form.is_available ?? true}
                      onChange={v => set('is_available', v)}
                    />
                  </div>
                </Section>

              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-white/8 glass-dark flex items-center gap-3">
                {error && (
                  <p className="flex-1 text-xs text-red-400">{error}</p>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
                  >
                    {t.aCancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-gold text-black hover:shadow-gold-glow transition-shadow disabled:opacity-60"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {isNew ? t.aAddMenuItem : t.aSave}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Small helpers ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', min, step }: {
  value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; min?: string; step?: string
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none transition-colors"
    />
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 text-sm text-white/60"
    >
      <div className={cn(
        'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
        value ? 'bg-gold' : 'bg-white/10'
      )}>
        <motion.div
          animate={{ x: value ? 16 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        />
      </div>
      <span className={value ? 'text-white' : 'text-white/40'}>{label}</span>
    </button>
  )
}
