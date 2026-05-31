export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, UserModel, MenuItemModel, CategoryModel } from '@/lib/models'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await dbConnect()

  const [restaurants, users, items, categories] = await Promise.all([
    RestaurantModel.countDocuments(),
    UserModel.countDocuments({ role: 'owner' }),
    MenuItemModel.countDocuments(),
    CategoryModel.countDocuments(),
  ])

  const totalScans = await RestaurantModel.aggregate([
    { $group: { _id: null, total: { $sum: '$scan_count' } } },
  ])

  const recentRestaurants = await RestaurantModel
    .find()
    .sort({ createdAt: -1 })
    .limit(8)
    .select('name slug theme_config scan_count createdAt is_active')
    .lean()

  return NextResponse.json({
    stats: {
      restaurants,
      owners: users,
      items,
      categories,
      totalScans: totalScans[0]?.total ?? 0,
    },
    recentRestaurants,
  })
}
