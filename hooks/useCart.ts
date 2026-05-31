'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { CartItem, MenuItem } from '@/types'

const CART_KEY = 'aura_menu_cart'

export function useCartStore() {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: MenuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === item._id)
      if (existing) {
        return prev.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i._id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => (i._id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count, hydrated }
}

export type CartStore = ReturnType<typeof useCartStore>

export const CartContext = createContext<CartStore | null>(null)

export function useCart(): CartStore {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartContext.Provider')
  return ctx
}
