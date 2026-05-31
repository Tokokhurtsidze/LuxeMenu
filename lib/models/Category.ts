import { Schema, model, models, type Document, type Types } from 'mongoose'

export interface ICategory extends Document {
  restaurantId: Types.ObjectId   // ← tenant isolation key
  name: string
  name_ka?: string
  slug: string
  icon?: string
  sort_order: number
}

const CategorySchema = new Schema<ICategory>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name:         { type: String, required: true, trim: true },
    name_ka:      { type: String, default: '' },
    slug:         { type: String, required: true, trim: true, lowercase: true },
    icon:         { type: String, default: '🍽' },
    sort_order:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Fast look-ups for a single tenant; unique slug within the same restaurant
CategorySchema.index({ restaurantId: 1, sort_order: 1 })
CategorySchema.index({ restaurantId: 1, slug: 1 }, { unique: true })

export const CategoryModel =
  models.Category ?? model<ICategory>('Category', CategorySchema)
