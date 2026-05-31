import { NextResponse } from 'next/server'
import { requireRestaurantAccess } from '@/lib/admin-auth'
import { CategoryModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string; categoryId: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const { restaurantSlug, categoryId } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const result = await CategoryModel.deleteOne({ _id: categoryId, restaurantId: restaurant!._id })
  if (result.deletedCount === 0)
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
