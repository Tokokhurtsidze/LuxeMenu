import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'
import type { IUser } from '@/lib/models/User'

// In-memory rate limiter: max 5 attempts per user per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX = 5
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = attempts.get(userId)

  if (!entry || now > entry.resetAt) {
    attempts.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 5 attempts per 15 min per user
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

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

    // Reset rate limit counter on successful change
    attempts.delete(session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/auth/change-password]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
