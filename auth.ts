import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import { UserModel } from '@/lib/models'
import type { IUser } from '@/lib/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },

  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        await dbConnect()
        const user = await UserModel.findOne({ email: email.toLowerCase() }).lean<IUser>()
        if (!user) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id:    user._id.toString(),
          email: user.email,
          name:  user.name,
          role:  user.role,
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id ?? ''
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id   = token.id   as string
      session.user.role = token.role as 'owner' | 'superadmin'
      return session
    },
  },
})
