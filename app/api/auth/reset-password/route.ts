import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'
import type { IUser } from '@/lib/models/User'

// Rate limit: 5 attempts per email per 15 min
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRate(email: string): boolean {
  const now = Date.now()
  const entry = attempts.get(email)
  if (!entry || now > entry.resetAt) {
    attempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json()

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    }

    const key = email.toLowerCase()
    if (!checkRate(key)) {
      return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
    }

    await dbConnect()

    const user = await UserModel.findOne({ email: key }).lean<IUser>()
    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await UserModel.updateOne({ _id: user._id }, { passwordHash: newHash })
    attempts.delete(key)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
