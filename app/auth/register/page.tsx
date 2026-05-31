import { Suspense } from 'react'
import RegisterPageClient from './_components/RegisterPageClient'

export const metadata = { title: 'Create Account — AuraMenu' }

export default function RegisterPage() {
  return <Suspense><RegisterPageClient /></Suspense>
}
