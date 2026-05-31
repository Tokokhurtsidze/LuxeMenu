import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models'
import type { IRestaurant } from '@/lib/models/Restaurant'
import type { ICategory } from '@/lib/models/Category'
import type { IMenuItem } from '@/lib/models/MenuItem'
import AdminDashboard from '@/components/admin/AdminDashboard'
import PlatformStats from '@/components/admin/PlatformStats'

// Always fetch fresh — no caching so newly added items appear instantly
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  await dbConnect()

  const isSuperAdmin = session.user.role === 'superadmin'

  // Superadmin sees ALL restaurants — owner sees only their own
  const filter = isSuperAdmin
    ? { is_active: true }
    : { ownerId: session.user.id, is_active: true }

  const restaurants = await RestaurantModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean<IRestaurant[]>()

  // No restaurants yet → send to onboarding
  if (restaurants.length === 0) {
    redirect('/onboard')
  }

  // Multiple restaurants → superadmin sees platform stats + roster; owner sees picker
  if (restaurants.length > 1) {
    const serialized = JSON.parse(JSON.stringify(restaurants))
    if (isSuperAdmin) return <PlatformStats />
    return <RestaurantPicker restaurants={serialized} isSuperAdmin={false} />
  }

  // Single restaurant → load full admin
  const restaurant = restaurants[0]

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

// ── Restaurant picker (when owner has multiple) ────────────────────────────
function RestaurantPicker({
  restaurants,
  isSuperAdmin,
}: {
  restaurants: IRestaurant[]
  isSuperAdmin: boolean
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-white">
          {isSuperAdmin ? 'All Restaurants' : 'Your Restaurants'}
        </h2>
        <p className="text-xs text-white/30 mt-1">
          {isSuperAdmin
            ? 'Superadmin — viewing all tenants'
            : `${restaurants.length} restaurant${restaurants.length > 1 ? 's' : ''} on your account`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {restaurants.map((r: IRestaurant) => (
          <Link
            key={r.slug}
            href={`/admin/${r.slug}`}
            className="glass border border-white/8 rounded-2xl p-5 hover:border-gold/25 hover:shadow-gold-glow transition-all group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: r.theme_config?.accent_color ?? '#D4AF37' }}
              >
                {r.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors truncate">
                  {r.name}
                </p>
                <p className="text-xs text-white/30 font-mono">/{r.slug}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-white/25">
              <span>📊 {r.scan_count ?? 0} scans</span>
              <span className="text-gold/60 group-hover:text-gold transition-colors">Manage →</span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/onboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 text-sm hover:border-gold/30 hover:text-gold transition-all"
      >
        + Add Restaurant
      </Link>
    </div>
  )
}
