export async function register() {
  if (process.env.NODE_ENV !== 'development') return

  const uri = process.env.MONGODB_URI ?? ''
  const isAtlas = uri.includes('mongodb+srv://') || (uri.includes('mongodb://') && !uri.includes('localhost'))

  if (isAtlas) {
    const reachable = await testAtlasConnection(uri)
    if (reachable) {
      console.log('[AuraMenu] Connected to MongoDB Atlas')
      // Always ensure superadmin + demo user exist on Atlas
      await ensureUsers(uri)
      return
    }
    console.warn('[AuraMenu] Atlas unreachable — falling back to in-memory MongoDB')
  }

  // Start in-memory MongoDB
  const { MongoMemoryServer } = await import('mongodb-memory-server')
  const mongoose = await import('mongoose')

  const mongod = await MongoMemoryServer.create()
  const memUri = mongod.getUri()
  process.env.MONGODB_URI = memUri

  console.log('[AuraMenu] In-memory MongoDB at', memUri)

  await mongoose.default.connect(memUri)
  const db = mongoose.default.connection.db

  const hasData =
    (await db!.listCollections({ name: 'restaurants' }).toArray()).length > 0 &&
    (await db!.collection('restaurants').countDocuments()) > 0

  if (!hasData) {
    console.log('[AuraMenu] Seeding demo data...')
    const { seedDev } = await import('./lib/seed-dev')
    await seedDev()
    console.log('[AuraMenu] Seed complete')
    console.log('[AuraMenu] Guest → http://localhost:3000/menu/noir-brasserie')
    console.log('[AuraMenu] Admin → http://localhost:3000/admin')
  }

  await mongoose.default.disconnect()
}

async function ensureUsers(uri: string) {
  const mongoose = await import('mongoose')
  const bcrypt   = await import('bcryptjs')

  await mongoose.default.connect(uri)

  const { UserModel }       = await import('./lib/models/User')
  const { RestaurantModel } = await import('./lib/models/Restaurant')

  const superEmail = process.env.SUPERADMIN_EMAIL    ?? 'admin@auramenu.com'
  const superPass  = process.env.SUPERADMIN_PASSWORD ?? 'AuraMenu2025!'

  const existingSuper = await UserModel.findOne({ email: superEmail })
  if (!existingSuper) {
    await UserModel.create({
      name: 'AuraMenu Admin', email: superEmail,
      passwordHash: await bcrypt.default.hash(superPass, 12),
      role: 'superadmin',
    })
    console.log('[AuraMenu] Superadmin created on Atlas')
  }

  // Demo owner
  const DEMO_EMAIL = 'demo@auramenu.com'
  const DEMO_PASS  = 'Demo2025!'

  let demoUser = await UserModel.findOne({ email: DEMO_EMAIL })
  if (!demoUser) {
    demoUser = await UserModel.create({
      name: 'Demo Admin', email: DEMO_EMAIL,
      passwordHash: await bcrypt.default.hash(DEMO_PASS, 12),
      role: 'owner',
    })
    console.log('[AuraMenu] Demo user created:', DEMO_EMAIL, '/', DEMO_PASS)
  }

  // Assign demo user as owner of noir-brasserie if not already
  await RestaurantModel.updateOne(
    { slug: 'noir-brasserie', ownerId: null },
    { $set: { ownerId: demoUser._id } }
  )

  await mongoose.default.disconnect()
}

async function testAtlasConnection(uri: string): Promise<boolean> {
  try {
    const mongoose = await import('mongoose')
    const conn = await Promise.race([
      mongoose.default.createConnection(uri).asPromise(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      ),
    ])
    await conn.close()
    return true
  } catch {
    return false
  }
}
