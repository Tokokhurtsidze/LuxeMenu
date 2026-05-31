'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import MenuItemCard from './MenuItemCard'
import type { MenuItem } from '@/types'

interface MenuGridProps {
  items: MenuItem[]
}

export default function MenuGrid({ items }: MenuGridProps) {
  const { t } = useLocale()

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <span className="text-5xl mb-4 opacity-30">🍽</span>
        <p className="text-white/30 text-sm tracking-widest uppercase">{t.noItems}</p>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <MenuItemCard key={item._id} item={item} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
