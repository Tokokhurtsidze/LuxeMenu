import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    await dbConnect()

    const exists = await UserModel.exists({ email: email.toLowerCase() })
    if (exists) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'owner',
    })

    return NextResponse.json({ id: user._id.toString() }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
