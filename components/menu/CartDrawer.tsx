'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useLocale } from '@/contexts/LocaleContext'
import { formatPrice } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart, total, count } = useCart()
  const { t } = useLocale()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col glass-dark border-l border-white/8"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-display text-lg font-semibold text-white">{t.yourOrder}</h2>
                <span className="text-xs text-white/40 font-medium">({count} {t.itemsCount})</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scrollbar-gold py-4 px-5 space-y-3">
              <AnimatePresence initial={false}>
                {items.map(item => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-obsidian-200">
                      {item.image_url?.startsWith('http') ? (
                        <Image src={item.image_url} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🍽</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-gold font-medium mt-0.5">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-gold/40 hover:text-gold transition-colors">
                        <Minus size={10} />
                      </button>
                      <motion.span key={item.quantity} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-6 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </motion.span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-gold/40 hover:text-gold transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>

                    <button onClick={() => removeItem(item._id)} className="p-1 text-white/20 hover:text-red-400 transition-colors ml-1">
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ShoppingBag size={36} className="text-white/10 mb-3" />
                  <p className="text-white/30 text-sm">{t.orderEmpty}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50 font-medium tracking-wide">{t.subtotal}</span>
                  <span className="font-display text-2xl font-bold text-gold tracking-tight">
                    {formatPrice(total)}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-xl bg-gold text-black font-bold text-sm tracking-widest uppercase shadow-gold-glow hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-shadow duration-300"
                  onClick={() => alert('Order sent to the kitchen! 🍽')}
                >
                  {t.notifyWaiter}
                </motion.button>

                <button onClick={clearCart} className="w-full text-center text-xs text-white/20 hover:text-white/40 transition-colors py-1">
                  {t.clearOrder}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
