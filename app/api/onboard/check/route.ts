import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ available: false }, { status: 400 })
    }

    await dbConnect()

    const exists = await RestaurantModel.exists({ slug })
    return NextResponse.json({ available: !exists })
  } catch (err) {
    console.error('[GET /api/onboard/check]', err)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
