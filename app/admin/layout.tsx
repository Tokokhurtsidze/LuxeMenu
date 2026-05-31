import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SignOutButton from './_components/SignOutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-dvh bg-obsidian-50 text-white">
      <nav className="glass-dark border-b border-white/8 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold text-gold">AuraMenu</span>
          <span className="text-white/15">|</span>
          <span className="text-white/30 text-sm font-medium">Admin</span>
          {session.user.role === 'superadmin' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold/10 border border-gold/30 text-gold">
              Superadmin
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-xs text-white/30 hidden sm:block">{session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  )
}
