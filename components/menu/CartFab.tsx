'use client'

import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useLocale } from '@/contexts/LocaleContext'
import { formatPrice } from '@/lib/utils'

interface CartFabProps {
  onOpen: () => void
}

export default function CartFab({ onOpen }: CartFabProps) {
  const { count, total, hydrated } = useCart()
  const { t } = useLocale()

  if (!hydrated || count === 0) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-40"
    >
      <motion.button
        onClick={onOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-5 py-3.5 rounded-2xl bg-gold text-black font-semibold shadow-gold-glow"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingBag size={20} />
            <motion.span
              key={count}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-black text-gold text-[10px] font-bold flex items-center justify-center"
            >
              {count}
            </motion.span>
          </div>
          <span className="text-sm font-bold tracking-wide">{t.viewOrder}</span>
        </div>
        <span className="font-display text-base font-bold tracking-tight">
          {formatPrice(total)}
        </span>
      </motion.button>
    </motion.div>
  )
}
