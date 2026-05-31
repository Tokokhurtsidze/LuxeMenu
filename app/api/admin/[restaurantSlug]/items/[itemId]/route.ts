import { NextResponse } from 'next/server'
import { requireRestaurantAccess } from '@/lib/admin-auth'
import { MenuItemModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string; itemId: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { restaurantSlug, itemId } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const body = await req.json()
  const item = await MenuItemModel.findOneAndUpdate(
    { _id: itemId, restaurantId: restaurant!._id },
    { $set: body },
    { new: true }
  ).lean()

  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { restaurantSlug, itemId } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const result = await MenuItemModel.deleteOne({ _id: itemId, restaurantId: restaurant!._id })
  if (result.deletedCount === 0)
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
