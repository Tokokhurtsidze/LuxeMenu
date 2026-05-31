import { Schema, model, models, type Document, type Types } from 'mongoose'

export interface IThemeConfig {
  accent_color:      string
  accent_foreground: string
  background:        string
  surface:           string
  border_color:      string
  text_color:        string   // primary text
  text_muted:        string   // secondary text
  font_display:      string   // heading / restaurant name font
  font_sans:         string   // body font
  card_radius:       string   // border-radius for cards
  nav_style:         string   // 'pill' | 'underline' | 'minimal'
}

const DEFAULT_THEME: IThemeConfig = {
  accent_color:      '#D4AF37',
  accent_foreground: '#000000',
  background:        '#000000',
  surface:           'rgba(255,255,255,0.04)',
  border_color:      'rgba(255,255,255,0.08)',
  text_color:        '#FAFAFA',
  text_muted:        'rgba(255,255,255,0.50)',
  font_display:      'Playfair Display',
  font_sans:         'Inter',
  card_radius:       '1rem',
  nav_style:         'pill',
}

export { DEFAULT_THEME }

export interface IRestaurant extends Document {
  name:         string
  slug:         string
  logo_url?:    string
  description?: string
  theme_config: IThemeConfig
  is_active:    boolean
  scan_count:   number
  ownerId?:     Types.ObjectId
  createdAt:    Date
  updatedAt:    Date
}

const ThemeConfigSchema = new Schema<IThemeConfig>(
  {
    accent_color:      { type: String, default: DEFAULT_THEME.accent_color },
    accent_foreground: { type: String, default: DEFAULT_THEME.accent_foreground },
    background:        { type: String, default: DEFAULT_THEME.background },
    surface:           { type: String, default: DEFAULT_THEME.surface },
    border_color:      { type: String, default: DEFAULT_THEME.border_color },
    text_color:        { type: String, default: DEFAULT_THEME.text_color },
    text_muted:        { type: String, default: DEFAULT_THEME.text_muted },
    font_display:      { type: String, default: DEFAULT_THEME.font_display },
    font_sans:         { type: String, default: DEFAULT_THEME.font_sans },
    card_radius:       { type: String, default: DEFAULT_THEME.card_radius },
    nav_style:         { type: String, default: DEFAULT_THEME.nav_style },
  },
  { _id: false }
)

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    logo_url:     { type: String },
    description:  { type: String },
    theme_config: { type: ThemeConfigSchema, default: () => ({ ...DEFAULT_THEME }) },
    is_active:    { type: Boolean, default: true },
    scan_count:   { type: Number, default: 0 },
    ownerId:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

RestaurantSchema.index({ ownerId: 1 })

export const RestaurantModel =
  models.Restaurant ?? model<IRestaurant>('Restaurant', RestaurantSchema)
