/**
 * Production seed — run once per new restaurant:
 *   npx tsx lib/seed.ts
 * Requires MONGODB_URI in .env.local
 */
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })
import mongoose from 'mongoose'
import { seedDev } from './seed-dev'

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/aura-menu'

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB:', MONGODB_URI)
  await seedDev()
  console.log('Done.')
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
