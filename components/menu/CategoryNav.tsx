'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import type { Category } from '@/types'

export const ALL_SLUG = '__all__'

interface CategoryNavProps {
  categories:     Category[]
  activeCategory: string
  onChange:       (slug: string) => void
  navStyle?:      string
}

export default function CategoryNav({ categories, activeCategory, onChange, navStyle = 'pill' }: CategoryNavProps) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const { locale } = useLocale()

  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [checkScroll, categories])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  const allTabs = [
    { slug: ALL_SLUG, label: locale === 'ka' ? 'ყველა' : 'All' },
    ...sorted.map(cat => ({
      slug: cat.slug,
      label: locale === 'ka' && cat.name_ka ? cat.name_ka : cat.name,
    })),
  ]

  return (
    <div className="sticky top-0 z-30 glass-dark border-b border-white/5">
      <div className="relative flex items-center">

        {/* Left arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 z-10 h-full px-2 flex items-center"
            >
              <ChevronLeft size={16} className="text-white/60" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable tabs */}
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto scrollbar-none px-4 sm:px-8 py-3 w-full"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {allTabs.map(({ slug, label }) => {
            const isActive = activeCategory === slug
            return (
              <button
                key={slug}
                onClick={() => onChange(slug)}
                style={{
                  scrollSnapAlign: 'start',
                  ...((navStyle === 'underline' || navStyle === 'minimal') && isActive
                    ? { color: 'var(--accent)' }
                    : {}),
                }}
                className={cn(
                  'relative flex-shrink-0 flex items-center px-3 py-1.5',
                  'text-xs font-semibold tracking-widest uppercase transition-colors duration-200',
                  'focus-visible:outline-none',
                  navStyle === 'pill' && 'rounded-full',
                  navStyle === 'pill' && (isActive
                    ? 'text-obsidian-DEFAULT bg-gold shadow-gold-glow'
                    : 'text-white/50 hover:text-white/80 glass hover:border-white/15'),
                  navStyle === 'underline' && (isActive
                    ? 'border-b-2 border-[var(--accent)]'
                    : 'text-white/50 hover:text-white/80'),
                  navStyle === 'minimal' && (isActive
                    ? ''
                    : 'text-white/50 hover:text-white/80'),
                )}
              >
                <span>{label}</span>
                {navStyle === 'pill' && isActive && (
                  <motion.span
                    layoutId="category-indicator"
                    className="absolute inset-0 rounded-full bg-gold"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 z-10 h-full px-2 flex items-center"
            >
              <ChevronRight size={16} className="text-white/60" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
