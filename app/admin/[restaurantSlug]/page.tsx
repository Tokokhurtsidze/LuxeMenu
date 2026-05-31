import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models'
import type { IRestaurant } from '@/lib/models/Restaurant'
import type { ICategory } from '@/lib/models/Category'
import type { IMenuItem } from '@/lib/models/MenuItem'
import AdminDashboard from '@/components/admin/AdminDashboard'

interface Props {
  params: Promise<{ restaurantSlug: string }>
}

export default async function RestaurantAdminPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { restaurantSlug } = await params
  await dbConnect()

  const restaurant = await RestaurantModel
    .findOne({ slug: restaurantSlug, is_active: true })
    .lean<IRestaurant>()

  if (!restaurant) notFound()

  const isSuperAdmin = session.user.role === 'superadmin'
  const isOwner = restaurant.ownerId?.toString() === session.user.id

  // Enforce ownership — only owner or superadmin can access
  if (!isSuperAdmin && !isOwner) {
    redirect('/admin')
  }

  const [categories, items] = await Promise.all([
    CategoryModel
      .find({ restaurantId: restaurant._id })
      .sort({ sort_order: 1 })
      .lean<ICategory[]>(),
    MenuItemModel
      .find({ restaurantId: restaurant._id })
      .sort({ sort_order: 1 })
      .lean<IMenuItem[]>(),
  ])

  const data = JSON.parse(JSON.stringify({ restaurant, categories, items }))

  return (
    <AdminDashboard
      restaurant={data.restaurant}
      categories={data.categories}
      items={data.items}
    />
  )
}
