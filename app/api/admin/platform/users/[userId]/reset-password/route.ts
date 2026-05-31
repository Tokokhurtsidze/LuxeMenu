import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'

type Ctx = { params: Promise<{ userId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params
  const { newPassword } = await req.json()

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  await dbConnect()

  const user = await UserModel.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  // Superadmin cannot reset another superadmin's password
  if (user.role === 'superadmin') {
    return NextResponse.json({ error: 'Cannot reset superadmin password.' }, { status: 403 })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()

  return NextResponse.json({ success: true })
}
