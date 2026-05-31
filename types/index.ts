export type AllergenTag  = 'nuts' | 'dairy' | 'gluten' | 'eggs' | 'soy' | 'seafood' | 'sesame'
export type DietaryTag   = 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' | 'halal' | 'kosher'
export type PairingType  = 'wine' | 'cocktail' | 'dish' | 'dessert' | 'spirit' | 'beer'
export type Locale       = 'en' | 'ka'

export interface PairedItem {
  name: string
  type: PairingType
  description?: string
}

// ── Separate collection — has restaurantId ──────────────────────────
export interface Category {
  _id: string
  restaurantId: string
  name: string
  name_ka?: string
  slug: string
  icon?: string
  sort_order: number
}

// ── Separate collection — has restaurantId ──────────────────────────
export interface MenuItem {
  _id: string
  restaurantId: string
  categorySlug: string        // matches Category.slug within same restaurant
  name: string
  name_ka?: string
  description?: string
  description_ka?: string
  price: number
  currency: string
  image_url?: string
  allergens: AllergenTag[]
  dietary_tags: DietaryTag[]
  paired_items: PairedItem[]
  is_available: boolean
  is_featured: boolean
  sort_order: number
}

// ── Theme config (richer than before) ──────────────────────────────
export interface ThemeConfig {
  accent_color:      string
  accent_foreground: string
  background:        string
  surface:           string
  border_color:      string
  text_color:        string
  text_muted:        string
  font_display:      string
  font_sans:         string
  card_radius:       string
  nav_style:         string
}

export interface Restaurant {
  _id: string
  name: string
  slug: string
  logo_url?: string
  description?: string
  theme_config: ThemeConfig
  is_active: boolean
  scan_count?: number
}

// Cart item extends MenuItem with a quantity counter
export interface CartItem extends MenuItem {
  quantity: number
}
