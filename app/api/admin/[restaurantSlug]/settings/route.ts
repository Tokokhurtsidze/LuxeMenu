import { NextResponse } from 'next/server'
import { requireRestaurantAccess } from '@/lib/admin-auth'
import { RestaurantModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  const { error } = await requireRestaurantAccess(restaurantSlug)
  if (error) return error

  const body = await req.json()

  const restaurant = await RestaurantModel.findOneAndUpdate(
    { slug: restaurantSlug },
    { $set: body },
    { new: true, lean: true }
  )

  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

  return NextResponse.json({ restaurant })
}
