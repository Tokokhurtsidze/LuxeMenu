import { Schema, model, models, type Document, type Types } from 'mongoose'

const ALLERGENS    = ['nuts','dairy','gluten','eggs','soy','seafood','sesame'] as const
const DIETARY_TAGS = ['vegan','vegetarian','gluten-free','dairy-free','halal','kosher'] as const
const PAIRING_TYPES = ['wine','cocktail','dish','dessert','spirit','beer'] as const

export type AllergenTag  = (typeof ALLERGENS)[number]
export type DietaryTag   = (typeof DIETARY_TAGS)[number]
export type PairingType  = (typeof PAIRING_TYPES)[number]

export interface IPairedItem {
  name: string
  type: PairingType
  description?: string
}

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId   // ← tenant isolation key (always filter by this)
  categorySlug: string           // matches Category.slug within same restaurant
  name: string
  name_ka?: string
  description?: string
  description_ka?: string
  price: number
  currency: string
  image_url?: string
  allergens: AllergenTag[]
  dietary_tags: DietaryTag[]
  paired_items: IPairedItem[]
  is_available: boolean
  is_featured: boolean
  sort_order: number
  createdAt: Date
  updatedAt: Date
}

const PairedItemSchema = new Schema<IPairedItem>(
  {
    name:        { type: String, required: true },
    type:        { type: String, enum: PAIRING_TYPES, required: true },
    description: { type: String },
  },
  { _id: false }
)

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId:   { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categorySlug:   { type: String, required: true, trim: true },
    name:           { type: String, required: true, trim: true },
    name_ka:        { type: String, default: '' },
    description:    { type: String, default: '' },
    description_ka: { type: String, default: '' },
    price:          { type: Number, required: true, min: 0 },
    currency:       { type: String, default: 'GEL' },
    image_url:      { type: String, default: '' },
    allergens:      [{ type: String, enum: ALLERGENS }],
    dietary_tags:   [{ type: String, enum: DIETARY_TAGS }],
    paired_items:   [PairedItemSchema],
    is_available:   { type: Boolean, default: true },
    is_featured:    { type: Boolean, default: false },
    sort_order:     { type: Number, default: 0 },
  },
  { timestamps: true }
)

// All item queries for a tenant + optional category filter — covered by both indexes
MenuItemSchema.index({ restaurantId: 1, categorySlug: 1, sort_order: 1 })
MenuItemSchema.index({ restaurantId: 1, sort_order: 1 })

export const MenuItemModel =
  models.MenuItem ?? model<IMenuItem>('MenuItem', MenuItemSchema)
