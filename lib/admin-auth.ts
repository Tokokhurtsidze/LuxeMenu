import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel } from '@/lib/models'
import type { IRestaurant } from '@/lib/models/Restaurant'

interface AuthResult {
  error: NextResponse | null
  restaurant: IRestaurant | null
  isSuperAdmin: boolean
}

/**
 * Call at the top of every /api/admin/[restaurantSlug]/* route handler.
 * Returns the verified restaurant or an HTTP error response.
 *
 * Rules:
 *   - No session          → 401
 *   - Restaurant missing  → 404
 *   - Not owner & not superadmin → 403
 */
export async function requireRestaurantAccess(slug: string): Promise<AuthResult> {
  const session = await auth()

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      restaurant: null,
      isSuperAdmin: false,
    }
  }

  await dbConnect()

  const restaurant = await RestaurantModel
    .findOne({ slug })
    .lean<IRestaurant>()

  if (!restaurant) {
    return {
      error: NextResponse.json({ error: 'Restaurant not found' }, { status: 404 }),
      restaurant: null,
      isSuperAdmin: false,
    }
  }

  const isSuperAdmin = session.user.role === 'superadmin'
  const isOwner      = restaurant.ownerId?.toString() === session.user.id

  if (!isSuperAdmin && !isOwner) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      restaurant: null,
      isSuperAdmin: false,
    }
  }

  return { error: null, restaurant, isSuperAdmin }
}
