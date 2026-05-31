'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { CartContext, useCartStore } from '@/hooks/useCart'
import { LocaleContext } from '@/contexts/LocaleContext'
import { useTheme } from '@/contexts/ThemeContext'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CategoryNav, { ALL_SLUG } from './CategoryNav'
import MenuGrid from './MenuGrid'
import CartDrawer from './CartDrawer'
import CartFab from './CartFab'
import ScanTracker from './ScanTracker'
import type { Restaurant, Category, MenuItem, ThemeConfig } from '@/types'

function buildThemeVars(t: ThemeConfig, isLight: boolean): React.CSSProperties {
  return {
    '--accent':       t.accent_color,
    '--accent-fg':    t.accent_foreground,
    '--bg':           isLight ? 'var(--pg-bg)' : t.background,
    '--surface':      isLight ? 'var(--pg-surface)' : t.surface,
    '--border':       isLight ? 'var(--pg-border)'  : t.border_color,
    '--text':         isLight ? 'var(--pg-fg)'       : (t.text_color  || '#FAFAFA'),
    '--text-muted':   isLight ? 'var(--pg-fg-muted)' : (t.text_muted  || 'rgba(255,255,255,0.50)'),
    '--radius':       t.card_radius   || '1rem',
    '--font-display': t.font_display  ? `'${t.font_display}', Georgia, serif` : 'var(--font-playfair)',
    ...(isLight ? {} : { backgroundColor: t.background, color: t.text_color || '#FAFAFA' }),
  } as React.CSSProperties
}

interface MenuPageProps {
  restaurant: Restaurant
  categories: Category[]
  items:      MenuItem[]
}

export default function MenuPage({ restaurant, categories, items }: MenuPageProps) {
  const cart    = useCartStore()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const sortedCats = useMemo(() => [...categories].sort((a, b) => a.sort_order - b.sort_order), [categories])

  const [activeCategory, setActiveCategory] = useState(ALL_SLUG)
  const [search,         setSearch]         = useState('')
  const [cartOpen,       setCartOpen]       = useState(false)
  const [locale,         setLocale]         = useState<Locale>('en')

  const t = translations[locale]

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter(item => {
        if (activeCategory !== ALL_SLUG && item.categorySlug !== activeCategory) return false
        if (!item.is_available) return false
        if (!q) return true
        const name = locale === 'ka' && item.name_ka ? item.name_ka : item.name
        const desc = locale === 'ka' && item.description_ka ? item.description_ka : (item.description ?? '')
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1
        return a.sort_order - b.sort_order
      })
  }, [items, activeCategory, search, locale])

  const activeCatLabel = useMemo(() => {
    if (search.trim()) return locale === 'ka' ? 'ძიების შედეგი' : 'Search results'
    if (activeCategory === ALL_SLUG) return locale === 'ka' ? 'ყველა' : 'All'
    const cat = sortedCats.find(c => c.slug === activeCategory)
    return cat ? (locale === 'ka' && cat.name_ka ? cat.name_ka : cat.name) : ''
  }, [sortedCats, activeCategory, search, locale])

  const themeVars = useMemo(() => buildThemeVars(restaurant.theme_config, isLight), [restaurant.theme_config, isLight])

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      <CartContext.Provider value={cart}>
        <ScanTracker restaurantSlug={restaurant.slug} />

        <div className="min-h-dvh" style={themeVars}>

          {/* ── Hero header ── */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative px-4 sm:px-8 pt-12 pb-8 text-center overflow-hidden"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, var(--accent), transparent)' }}
            />

            {/* Language + Theme */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-1 glass rounded-full px-1 py-1 border border-white/8">
                {(['en', 'ka'] as Locale[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                    style={locale === lang
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                      : { color: 'rgba(128,128,128,0.7)' }
                    }
                  >
                    {lang === 'en' ? t.langEn : t.langKa}
                  </button>
                ))}
              </div>
            </div>

            {restaurant.logo_url?.startsWith('http') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border border-white/10 glass"
              >
                <Image src={restaurant.logo_url} alt={restaurant.name} fill sizes="64px" className="object-contain p-1" />
              </motion.div>
            )}

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[10px] font-bold tracking-[0.35em] uppercase mb-2"
              style={{ color: 'color-mix(in srgb, var(--accent) 70%, transparent)' }}>
              {t.menuLabel}
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight"
              style={{ color: 'var(--text)' }}>
              {restaurant.name}
            </motion.h1>

            {restaurant.description && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="mt-3 text-sm max-w-sm mx-auto leading-relaxed"
                style={{ color: 'var(--text-muted)' }}>
                {restaurant.description}
              </motion.p>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="flex-1 max-w-[80px] h-px"
                style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 30%, transparent))' }} />
              <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--accent) 40%, transparent)' }}>◆</span>
              <span className="flex-1 max-w-[80px] h-px"
                style={{ background: 'linear-gradient(to left, transparent, color-mix(in srgb, var(--accent) 30%, transparent))' }} />
            </div>
          </motion.header>

          {/* ── Category nav (sticky, scrollable on mobile) ── */}
          <CategoryNav
            categories={sortedCats}
            activeCategory={activeCategory}
            onChange={cat => { setActiveCategory(cat); setSearch('') }}
            navStyle={restaurant.theme_config.nav_style || 'pill'}
          />

          {/* ── Search bar ── */}
          <div className="px-4 sm:px-8 pt-3 pb-1">
            <div className="relative max-w-lg">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'ka' ? 'პროდუქტის ძიება...' : 'Search menu...'}
                className="w-full text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none transition-all"
                style={{
                  background:   'var(--surface)',
                  border:       '1px solid var(--border)',
                  color:        'var(--text)',
                }}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Grid ── */}
          <main className="px-4 sm:px-8 pb-32 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-baseline gap-3 mb-6"
                >
                  <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {activeCatLabel}
                  </h2>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {visibleItems.length} {t.itemsCount}
                  </span>
                </motion.div>

                <MenuGrid items={visibleItems} />
              </motion.div>
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {cart.count > 0 && <CartFab key="fab" onOpen={() => setCartOpen(true)} />}
          </AnimatePresence>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
      </CartContext.Provider>
    </LocaleContext.Provider>
  )
}
