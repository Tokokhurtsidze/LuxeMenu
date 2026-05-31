import { Suspense } from 'react'
import LoginPageClient from './_components/LoginPageClient'

export const metadata = { title: 'Sign In — AuraMenu' }

export default function LoginPage() {
  return <Suspense><LoginPageClient /></Suspense>
}
