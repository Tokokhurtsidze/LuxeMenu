import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel } from '@/lib/models'

type Ctx = { params: Promise<{ restaurantSlug: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  const { restaurantSlug } = await params
  await dbConnect()

  await RestaurantModel.updateOne(
    { slug: restaurantSlug },
    { $inc: { scan_count: 1 } }
  )

  return NextResponse.json({ ok: true })
}
