import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── /api/admin/* — return 401 JSON (don't redirect API callers) ──
  if (pathname.startsWith('/api/admin/') && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── /admin pages — redirect to login ────────────────────────────
  if (pathname.startsWith('/admin') && !session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
