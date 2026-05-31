'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Loader2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

// ── Predefined category suggestions ──────────────────────────────────────────
const PRESETS: { en: string; ka: string }[] = [
  { en: 'Starters',     ka: 'სტარტერები'     },
  { en: 'Soups',        ka: 'სუპები'          },
  { en: 'Salads',       ka: 'სალათები'        },
  { en: 'Main Course',  ka: 'მთავარი კერძი'   },
  { en: 'Pasta',        ka: 'მაკარონი'        },
  { en: 'Pizza',        ka: 'პიცა'            },
  { en: 'Grills',       ka: 'გრილი'           },
  { en: 'Seafood',      ka: 'ზღვის პროდუქტი' },
  { en: 'Sushi',        ka: 'სუში'            },
  { en: 'Burgers',      ka: 'ბურგერი'         },
  { en: 'Sandwiches',   ka: 'სენდვიჩი'        },
  { en: 'Sides',        ka: 'გარნირი'         },
  { en: 'Desserts',     ka: 'დესერტები'       },
  { en: 'Cakes',        ka: 'ტორტები'         },
  { en: 'Breakfast',    ka: 'საუზმე'          },
  { en: 'Coffee',       ka: 'ყავა'            },
  { en: 'Cold Drinks',  ka: 'ცივი სასმელი'   },
  { en: 'Cocktails',    ka: 'კოქტეილები'      },
  { en: 'Wine',         ka: 'ღვინო'           },
  { en: 'Beer',         ka: 'ლუდი'            },
  { en: 'Spirits',      ka: 'სპირტიანი'       },
  { en: 'Kids Menu',    ka: 'ბავშვთა მენიუ'   },
  { en: 'Vegan',        ka: 'ვეგანი'          },
  { en: 'Specials',     ka: 'სპეციალური'      },
]

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

interface Props {
  restaurantSlug: string
  categories: Category[]
  onUpdate: (cats: Category[]) => void
}

export default function CategoriesPanel({ restaurantSlug, categories, onUpdate }: Props) {
  const [name,    setName]    = useState('')
  const [nameKa,  setNameKa]  = useState('')
  const [adding,  setAdding]  = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
  const usedSlugs = new Set(categories.map(c => c.slug))

  function selectPreset(p: { en: string; ka: string }) {
    setName(p.en)
    setNameKa(p.ka)
    setError(null)
  }

  async function addCategory(customName?: string, customKa?: string) {
    const n  = customName ?? name.trim()
    const ka = customKa  ?? nameKa.trim()
    if (!n) { setError('Name required'); return }

    const slug = toSlug(n)
    if (usedSlugs.has(slug)) { setError(`"${n}" already exists`); return }

    setAdding(true)
    setError(null)

    const res = await fetch(`/api/admin/${restaurantSlug}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n, name_ka: ka, slug, sort_order: sorted.length + 1 }),
    })

    const data = await res.json()
    setAdding(false)

    if (!res.ok) { setError(data.error ?? 'Failed'); return }

    onUpdate([...categories, data.category])
    setName('')
    setNameKa('')
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Items in this category will become uncategorised.`)) return
    setDeleting(cat._id)
    const res = await fetch(`/api/admin/${restaurantSlug}/categories/${cat._id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) onUpdate(categories.filter(c => c._id !== cat._id))
  }

  const availablePresets = PRESETS.filter(p => !usedSlugs.has(toSlug(p.en)))

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white">Categories</h2>
        <p className="text-xs text-white/30 mt-0.5">Manage menu sections</p>
      </div>

      {/* ── Existing categories ──────────────────────────────────── */}
      <div className="space-y-2 mb-8">
        <AnimatePresence initial={false}>
          {sorted.map(cat => (
            <motion.div
              key={cat._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/[0.06]"
            >
              <GripVertical size={14} className="text-white/15 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{cat.name}</span>
                {cat.name_ka && (
                  <span className="text-xs text-white/30 ml-2">/ {cat.name_ka}</span>
                )}
                <span className="ml-2 text-[10px] font-mono text-white/20">{cat.slug}</span>
              </div>
              <button
                onClick={() => deleteCategory(cat)}
                disabled={deleting === cat._id}
                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              >
                {deleting === cat._id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Trash2 size={13} />
                }
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {categories.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm glass rounded-2xl border border-white/5">
            No categories yet — add one below
          </div>
        )}
      </div>

      {/* ── Add category ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 p-5 space-y-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">Add Category</p>

        {/* Quick presets */}
        {availablePresets.length > 0 && (
          <div>
            <p className="text-xs text-white/30 mb-2">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {availablePresets.map(p => (
                <motion.button
                  key={p.en}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addCategory(p.en, p.ka)}
                  disabled={adding}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    name === p.en
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-white/10 text-white/50 hover:border-gold/30 hover:text-white/80 hover:bg-gold/5'
                  )}
                >
                  {p.en}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px" style={{ background: 'var(--pg-border)' }} />
          <span className="text-[10px] text-white/20 font-medium">or custom</span>
          <span className="flex-1 h-px" style={{ background: 'var(--pg-border)' }} />
        </div>

        {/* Custom name inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Name (EN) <span className="text-gold">*</span></label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="e.g. Specials"
              className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Name (KA)</label>
            <input
              value={nameKa}
              onChange={e => setNameKa(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="სახელი"
              className="w-full bg-obsidian-100 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>

        {name && (
          <p className="text-[11px] text-white/25">
            Slug: <span className="font-mono text-white/40">{toSlug(name)}</span>
          </p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={() => addCategory()}
          disabled={adding || !name.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-black text-sm font-bold hover:shadow-gold-glow transition-shadow disabled:opacity-50"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Category
        </button>
      </div>
    </div>
  )
}
