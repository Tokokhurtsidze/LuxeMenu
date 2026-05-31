import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models'

const MAX_RESTAURANTS_PER_OWNER = 10

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthenticated.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, slug, description, logo_url, accent_color } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Restaurant name is required.' }, { status: 400 })
    }
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Enforce 10-restaurant limit per owner (superadmin bypasses)
    if (session.user.role !== 'superadmin') {
      const owned = await RestaurantModel.countDocuments({ ownerId: session.user.id })
      if (owned >= MAX_RESTAURANTS_PER_OWNER) {
        return NextResponse.json(
          { error: `You have reached the maximum of ${MAX_RESTAURANTS_PER_OWNER} restaurants.` },
          { status: 403 }
        )
      }
    }

    const exists = await RestaurantModel.exists({ slug })
    if (exists) {
      return NextResponse.json(
        { error: 'A restaurant with this slug already exists.' },
        { status: 409 }
      )
    }

    const restaurant = await RestaurantModel.create({
      name: name.trim(),
      slug,
      description: description?.trim() ?? '',
      logo_url: logo_url?.trim() ?? '',
      ownerId: session.user.id,
      theme_config: {
        accent_color:      accent_color ?? '#D4AF37',
        accent_foreground: '#000000',
        background:        '#000000',
        surface:           'rgba(255,255,255,0.04)',
        border_color:      'rgba(255,255,255,0.08)',
        font_display:      'Playfair Display',
        font_sans:         'Inter',
      },
      is_active: true,
    })

    await CategoryModel.create({
      restaurantId: restaurant._id,
      name: 'Menu', name_ka: 'მენიუ',
      slug: 'menu', icon: '🍽', sort_order: 1,
    })

    await MenuItemModel.create({
      restaurantId: restaurant._id,
      categorySlug: 'menu',
      name: 'Sample Dish',
      description: 'Edit this in your admin panel.',
      price: 15, currency: 'GEL', is_available: true,
    })

    return NextResponse.json({ slug: restaurant.slug }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/onboard]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
