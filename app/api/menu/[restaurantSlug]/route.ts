import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models'
import type { IRestaurant } from '@/lib/models/Restaurant'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  try {
    const { restaurantSlug } = await params
    await dbConnect()

    const restaurant = await RestaurantModel
      .findOne({ slug: restaurantSlug, is_active: true })
      .lean<IRestaurant>()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const [categories, items] = await Promise.all([
      CategoryModel.find({ restaurantId: restaurant._id }).sort({ sort_order: 1 }).lean(),
      MenuItemModel.find({ restaurantId: restaurant._id }).sort({ sort_order: 1 }).lean(),
    ])

    return NextResponse.json(
      { restaurant, categories, items },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    console.error('[menu-api]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
