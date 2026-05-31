import { NextResponse } from 'next/server'
import { requireRestaurantAccess } from '@/lib/admin-auth'
import { MenuItemModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const items = await MenuItemModel
    .find({ restaurantId: restaurant!._id })
    .sort({ sort_order: 1 })
    .lean()

  return NextResponse.json({ items })
}

export async function POST(req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const body = await req.json()
  const item = await MenuItemModel.create({ ...body, restaurantId: restaurant!._id })

  return NextResponse.json({ item }, { status: 201 })
}
