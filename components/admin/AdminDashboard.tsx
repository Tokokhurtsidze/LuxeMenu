'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, Tag, ExternalLink, ChevronRight, QrCode, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Restaurant, Category, MenuItem } from '@/types'
import ItemsManager from './ItemsManager'
import CategoriesPanel from './CategoriesPanel'
import QrGenerator from './QrGenerator'
import BrandingPanel from './BrandingPanel'

type Section = 'items' | 'categories' | 'qr' | 'branding'

interface Props {
  restaurant: Restaurant
  categories: Category[]
  items: MenuItem[]
}

export default function AdminDashboard({ restaurant: initRestaurant, categories: initCats, items: initItems }: Props) {
  const [section,    setSection]    = useState<Section>('items')
  const [restaurant, setRestaurant] = useState<Restaurant>(initRestaurant)
  const [categories, setCategories] = useState<Category[]>(initCats)
  const [items,      setItems]      = useState<MenuItem[]>(initItems)

  const NAV: { id: Section; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'items',    label: 'Menu Items',  icon: LayoutGrid, count: items.length },
    { id: 'categories', label: 'Categories', icon: Tag,       count: categories.length },
    { id: 'qr',       label: 'QR Codes',    icon: QrCode },
    { id: 'branding', label: 'Branding',    icon: Settings },
  ]

  return (
    <div className="flex min-h-[calc(100vh-57px)] -m-6 sm:-m-10">
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 glass-dark border-r border-white/8 flex flex-col py-6 px-3 gap-1">
        {NAV.map(nav => {
          const Icon = nav.icon
          const active = section === nav.id
          return (
            <button
              key={nav.id}
              onClick={() => setSection(nav.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all',
                active
                  ? 'bg-gold/10 border border-gold/25 text-gold'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              )}
            >
              <Icon size={15} />
              <span className="flex-1">{nav.label}</span>
              {nav.count !== undefined && (
                <span className={cn('text-xs tabular-nums', active ? 'text-gold/70' : 'text-white/20')}>
                  {nav.count}
                </span>
              )}
            </button>
          )
        })}

        <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
          {typeof restaurant.scan_count === 'number' && (
            <p className="px-3 text-[11px] text-white/20">
              📊 {restaurant.scan_count} scans
            </p>
          )}
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 mx-2 px-3 py-2.5 rounded-xl text-xs font-bold border border-gold/30 text-gold bg-gold/5 hover:bg-gold/10 hover:shadow-gold-glow transition-all"
          >
            <ExternalLink size={13} />
            View Live Menu
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="text-white/50 font-medium">{restaurant.name}</span>
            <ChevronRight size={12} />
            <span className="text-gold">{NAV.find(n => n.id === section)?.label}</span>
          </div>
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gold/30 text-gold hover:bg-gold/10 transition-all"
          >
            <ExternalLink size={12} />
            Live Menu ↗
          </Link>
        </div>

        {section === 'items' && (
          <ItemsManager
            restaurantSlug={restaurant.slug}
            items={items}
            categories={categories}
            onUpdate={setItems}
          />
        )}

        {section === 'categories' && (
          <CategoriesPanel
            restaurantSlug={restaurant.slug}
            categories={categories}
            onUpdate={setCategories}
          />
        )}

        {section === 'qr' && (
          <QrGenerator
            restaurantSlug={restaurant.slug}
            restaurantName={restaurant.name}
          />
        )}

        {section === 'branding' && (
          <BrandingPanel
            restaurant={restaurant}
            onUpdate={partial => setRestaurant(r => ({ ...r, ...partial }))}
          />
        )}
      </div>
    </div>
  )
}
