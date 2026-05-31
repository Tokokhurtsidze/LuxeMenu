import { NextResponse } from 'next/server'
import { requireRestaurantAccess } from '@/lib/admin-auth'
import { CategoryModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const categories = await CategoryModel
    .find({ restaurantId: restaurant!._id })
    .sort({ sort_order: 1 })
    .lean()

  return NextResponse.json({ categories })
}

export async function POST(req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  const { error, restaurant } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const body = await req.json()
  const category = await CategoryModel.create({ ...body, restaurantId: restaurant!._id })

  return NextResponse.json({ category }, { status: 201 })
}
