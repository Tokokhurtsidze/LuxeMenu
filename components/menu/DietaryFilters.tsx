'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import type { DietaryTag } from '@/types'

interface FilterDef {
  value: DietaryTag
  icon: string
  tKey: 'vegan' | 'vegetarian' | 'glutenFree' | 'dairyFree' | 'halal'
}

const FILTERS: FilterDef[] = [
  { value: 'vegan',       icon: '🌿', tKey: 'vegan' },
  { value: 'vegetarian',  icon: '🥦', tKey: 'vegetarian' },
  { value: 'gluten-free', icon: 'GF', tKey: 'glutenFree' },
  { value: 'dairy-free',  icon: '🥛', tKey: 'dairyFree' },
  { value: 'halal',       icon: '☾',  tKey: 'halal' },
]

interface DietaryFiltersProps {
  active: DietaryTag[]
  onChange: (tag: DietaryTag) => void
}

export default function DietaryFilters({ active, onChange }: DietaryFiltersProps) {
  const { t } = useLocale()

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 sm:px-8 py-3">
      <span className="flex-shrink-0 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mr-1">
        {t.filter}
      </span>
      {FILTERS.map(f => {
        const isActive = active.includes(f.value)
        return (
          <motion.button
            key={f.value}
            onClick={() => onChange(f.value)}
            whileTap={{ scale: 0.94 }}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'text-xs font-medium tracking-wide transition-all duration-200',
              'border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40',
              isActive
                ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-400'
                : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/60'
            )}
          >
            <span className="text-[11px] leading-none">{f.icon}</span>
            <span>{t[f.tKey]}</span>
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
