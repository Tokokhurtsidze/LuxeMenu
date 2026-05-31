import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SignOutButton from './_components/SignOutButton'
import WebLanguageSwitcher from '@/components/ui/WebLanguageSwitcher'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-dvh bg-obsidian-50 text-white">
      <nav className="glass-dark border-b border-white/8 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display text-base sm:text-xl font-bold text-gold flex-shrink-0">AuraMenu</span>
          <span className="text-white/15 hidden sm:block">|</span>
          <span className="text-white/30 text-xs sm:text-sm font-medium hidden sm:block">Admin</span>
          {session.user.role === 'superadmin' && (
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold/10 border border-gold/30 text-gold">
              Super
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <WebLanguageSwitcher />
          <span className="text-xs text-white/30 hidden lg:block truncate max-w-[160px]">{session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  )
}
