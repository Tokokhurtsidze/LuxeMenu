export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models'
import type { IRestaurant } from '@/lib/models/Restaurant'
import type { ICategory } from '@/lib/models/Category'
import type { IMenuItem } from '@/lib/models/MenuItem'
import MenuPage from '@/components/menu/MenuPage'

// Google Fonts supported in the branding panel
const BUNDLED_FONTS = ['Playfair Display', 'Inter']

interface Props {
  params: Promise<{ restaurantSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantSlug } = await params
  await dbConnect()
  const restaurant = await RestaurantModel.findOne({ slug: restaurantSlug }).lean<IRestaurant>()
  if (!restaurant) return { title: 'Menu Not Found' }
  return {
    title: `${restaurant.name} — Menu`,
    description: restaurant.description ?? `Explore the menu at ${restaurant.name}`,
    openGraph: {
      title: `${restaurant.name} — Menu`,
      images: restaurant.logo_url ? [restaurant.logo_url] : [],
    },
  }
}

export default async function MenuRoute({ params }: Props) {
  const { restaurantSlug } = await params
  await dbConnect()

  const restaurant = await RestaurantModel
    .findOne({ slug: restaurantSlug, is_active: true })
    .lean<IRestaurant>()

  if (!restaurant) notFound()

  const [categories, items] = await Promise.all([
    CategoryModel.find({ restaurantId: restaurant._id }).sort({ sort_order: 1 }).lean<ICategory[]>(),
    MenuItemModel.find({ restaurantId: restaurant._id }).sort({ sort_order: 1 }).lean<IMenuItem[]>(),
  ])

  const payload = JSON.parse(JSON.stringify({ restaurant, categories, items }))

  // Inject Google Font link if restaurant uses a custom font
  const fontDisplay: string = restaurant.theme_config?.font_display ?? 'Playfair Display'
  const needsGoogleFont = !BUNDLED_FONTS.includes(fontDisplay)
  const googleFontUrl = needsGoogleFont
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontDisplay)}:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap`
    : null

  return (
    <>
      {googleFontUrl && (
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      )}
      {googleFontUrl && (
        <link rel="stylesheet" href={googleFontUrl} />
      )}
      <MenuPage
        restaurant={payload.restaurant}
        categories={payload.categories}
        items={payload.items}
      />
    </>
  )
}
