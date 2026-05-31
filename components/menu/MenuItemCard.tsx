'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import PairingSection from './PairingSection'
import { useCart } from '@/hooks/useCart'
import { useLocale } from '@/contexts/LocaleContext'
import { formatPrice, cn } from '@/lib/utils'
import type { MenuItem } from '@/types'

const DIETARY_ICONS: Record<string, string> = {
  vegan: 'V',
  vegetarian: 'Veg',
  'gluten-free': 'GF',
  'dairy-free': 'DF',
  halal: '☾',
  kosher: 'K',
}

interface MenuItemCardProps {
  item: MenuItem
  index: number
}

export default function MenuItemCard({ item, index }: MenuItemCardProps) {
  const { locale, t } = useLocale()
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const displayName = locale === 'ka' && item.name_ka ? item.name_ka : item.name
  const displayDesc = locale === 'ka' && item.description_ka ? item.description_ka : item.description

  const inCart  = items.find(i => i._id === item._id)
  const cartQty = inCart?.quantity ?? 0

  const handleAdd = () => {
    addItem(item)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ borderRadius: 'var(--radius, 1rem)' }}
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'glass border border-white/[0.07] shadow-glass',
        'hover:border-gold/20 hover:shadow-card-hover transition-all duration-300'
      )}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-obsidian-200">
        {item.image_url?.startsWith('http') ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index === 0}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🍽</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {item.is_featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/40 text-gold text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm">
            {t.featured}
          </span>
        )}

        {item.dietary_tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {item.dietary_tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/70 border border-emerald-700/50 text-emerald-400 text-[9px] font-bold backdrop-blur-sm"
                title={tag}
              >
                {DIETARY_ICONS[tag] ?? tag[0].toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-white leading-snug">{displayName}</h3>
          <p className="mt-1 text-sm text-white/50 leading-relaxed line-clamp-2">{displayDesc}</p>
        </div>

        {item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-white/30 mr-0.5 mt-0.5 font-medium">{t.contains}</span>
            {item.allergens.map(a => <Badge key={a} variant="allergen">{a}</Badge>)}
          </div>
        )}

        <PairingSection pairings={item.paired_items} />

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div>
            <span className="font-display text-xl font-bold text-gold tracking-tight">
              {formatPrice(item.price, item.currency)}
            </span>
            {cartQty > 0 && (
              <span className="ml-2 text-xs text-white/40">× {cartQty} {t.inCart}</span>
            )}
          </div>

          <motion.button
            onClick={handleAdd}
            disabled={!item.is_available}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold',
              'transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50',
              item.is_available
                ? 'border border-gold/40 text-gold hover:bg-gold hover:text-black hover:shadow-gold-glow hover:border-gold'
                : 'border border-white/10 text-white/20 cursor-not-allowed'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1">
                  <Check size={14} />{t.added}
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1">
                  <Plus size={14} />{item.is_available ? t.add : t.unavailable}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
