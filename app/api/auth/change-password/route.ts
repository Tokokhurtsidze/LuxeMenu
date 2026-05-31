import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'
import type { IUser } from '@/lib/models/User'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both fields required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    }

    await dbConnect()

    const user = await UserModel.findById(session.user.id).lean<IUser>()
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })

    const newHash = await bcrypt.hash(newPassword, 12)
    await UserModel.updateOne({ _id: user._id }, { passwordHash: newHash })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/auth/change-password]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
