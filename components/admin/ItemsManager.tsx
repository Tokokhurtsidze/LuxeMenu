'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import Image from 'next/image'
import { cn, formatPrice } from '@/lib/utils'
import { useWebLocale } from '@/contexts/WebLocaleContext'
import type { MenuItem, Category } from '@/types'
import ItemFormModal from './ItemFormModal'

interface Props {
  restaurantSlug: string
  items: MenuItem[]
  categories: Category[]
  onUpdate: (items: MenuItem[]) => void
}

export default function ItemsManager({ restaurantSlug, items, categories, onUpdate }: Props) {
  const { t } = useWebLocale()
  const [editingItem,     setEditingItem]     = useState<MenuItem | null>(null)
  const [isAdding,        setIsAdding]        = useState(false)
  const [filterCategory,  setFilterCategory]  = useState<string>('all')
  const [search,          setSearch]          = useState('')
  const [loading,         setLoading]         = useState<string | null>(null)

  const filtered = items
    .filter(i => filterCategory === 'all' || i.categorySlug === filterCategory)
    .filter(i => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return i.name.toLowerCase().includes(q) || (i.name_ka ?? '').toLowerCase().includes(q)
    })

  const sorted = [...filtered].sort((a, b) => {
    const catOrder = categories.findIndex(c => c.slug === a.categorySlug) - categories.findIndex(c => c.slug === b.categorySlug)
    if (catOrder !== 0) return catOrder
    return a.sort_order - b.sort_order
  })

  async function toggleAvailability(item: MenuItem) {
    setLoading(item._id)
    const res = await fetch(`/api/admin/${restaurantSlug}/items/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !item.is_available }),
    })
    if (res.ok) {
      onUpdate(items.map(i => i._id === item._id ? { ...i, is_available: !i.is_available } : i))
    }
    setLoading(null)
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return
    setLoading(item._id)
    const res = await fetch(`/api/admin/${restaurantSlug}/items/${item._id}`, { method: 'DELETE' })
    if (res.ok) {
      onUpdate(items.filter(i => i._id !== item._id))
    }
    setLoading(null)
  }

  function handleSaved(saved: MenuItem, isNew: boolean) {
    if (isNew) {
      onUpdate([...items, saved])
    } else {
      onUpdate(items.map(i => i._id === saved._id ? saved : i))
    }
    setEditingItem(null)
    setIsAdding(false)
  }

  const catName = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{t.aMenuItems}</h2>
          <p className="text-xs text-white/30 mt-0.5">{items.length} {t.aTotalItems}</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-bold hover:shadow-gold-glow transition-shadow"
        >
          <Plus size={15} />
          {t.aAddItem}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.aSearch}
          className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 pl-9 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
        {[{ slug: 'all', name: t.aAll, icon: '' }, ...categories.sort((a,b) => a.sort_order - b.sort_order)].map(cat => (
          <button
            key={cat.slug}
            onClick={() => setFilterCategory(cat.slug)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterCategory === cat.slug
                ? 'bg-gold/10 border border-gold/30 text-gold'
                : 'border border-white/8 text-white/40 hover:text-white/70'
            )}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
            <span className="text-[10px] opacity-60">
              {cat.slug === 'all' ? items.length : items.filter(i => i.categorySlug === cat.slug).length}
            </span>
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map(item => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl glass border border-white/[0.06] transition-opacity',
                !item.is_available && 'opacity-50'
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-obsidian-200">
                {item.image_url?.startsWith('http') ? (
                  <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xl">🍽</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                  {item.name_ka && (
                    <span className="text-xs text-white/30 truncate hidden sm:inline">/ {item.name_ka}</span>
                  )}
                  {item.is_featured && <Star size={11} className="text-gold flex-shrink-0" fill="currentColor" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-white/30 px-1.5 py-0.5 rounded bg-white/5">
                    {catName(item.categorySlug)}
                  </span>
                  <span className="text-xs font-bold text-gold">{formatPrice(item.price, item.currency)}</span>
                  {item.dietary_tags.length > 0 && (
                    <span className="text-[10px] text-emerald-500/70">{item.dietary_tags.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleAvailability(item)}
                  disabled={loading === item._id}
                  title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {item.is_available
                    ? <ToggleRight size={18} className="text-emerald-400" />
                    : <ToggleLeft size={18} className="text-white/20" />}
                </button>

                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => deleteItem(item)}
                  disabled={loading === item._id}
                  className="p-1.5 rounded-lg hover:bg-red-950/40 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-2xl border border-white/5">
            <span className="text-4xl mb-3 opacity-20">🍽</span>
            <p className="text-white/30 text-sm">No items yet</p>
            <button onClick={() => setIsAdding(true)} className="mt-3 text-gold text-sm hover:underline">
              Add your first item
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <ItemFormModal
        open={isAdding || editingItem !== null}
        item={editingItem}
        categories={categories}
        restaurantSlug={restaurantSlug}
        onClose={() => { setIsAdding(false); setEditingItem(null) }}
        onSaved={handleSaved}
      />
    </div>
  )
}
