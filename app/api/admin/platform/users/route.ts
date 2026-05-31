export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await dbConnect()

  const users = await UserModel
    .find({ role: 'owner' })
    .select('name email phone createdAt')
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ users })
}
