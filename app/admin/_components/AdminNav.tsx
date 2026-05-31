'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import SignOutButton from './SignOutButton'
import WebLanguageSwitcher from '@/components/ui/WebLanguageSwitcher'
import ChangePasswordModal from './ChangePasswordModal'

interface Props {
  email: string
  role: string
  restaurantName?: string
}

export default function AdminNav({ email, role }: Props) {
  const [pwOpen, setPwOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <WebLanguageSwitcher />
        <button
          onClick={() => setPwOpen(true)}
          title="Change Password"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
        >
          <Lock size={12} />
          <span className="hidden sm:inline">Password</span>
        </button>
        <span className="text-xs text-white/30 hidden lg:block truncate max-w-[160px]">{email}</span>
        <SignOutButton />
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  )
}
