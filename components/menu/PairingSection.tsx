'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import type { PairedItem, PairingType } from '@/types'

const PAIRING_ICONS: Record<PairingType, string> = {
  wine:     '🍷',
  cocktail: '🍸',
  spirit:   '🥃',
  beer:     '🍺',
  dish:     '🍽',
  dessert:  '🍮',
}

interface PairingSectionProps {
  pairings: PairedItem[]
}

export default function PairingSection({ pairings }: PairingSectionProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLocale()

  if (!pairings.length) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full group focus-visible:outline-none"
      >
        <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">
          {t.bestPairedWith}
        </span>
        <span className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gold/60">
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              {pairings.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 pl-3 border-l border-gold/20">
                  <span className="text-sm mt-0.5 flex-shrink-0">{PAIRING_ICONS[p.type]}</span>
                  <div>
                    <p className="text-xs font-semibold text-white/80">{p.name}</p>
                    {p.description && (
                      <p className="text-[11px] text-white/40 leading-snug mt-0.5">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
