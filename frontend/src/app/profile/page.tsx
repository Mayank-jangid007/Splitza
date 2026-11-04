'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ProfilePage } from '@/components/feedback/profile'

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/landing')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div
        className="grid min-h-dvh place-items-center"
        style={{ backgroundColor: '#fbf6ee' }}
      >
        <div className="size-12 animate-spin rounded-full border-4 border-[#151515]/20 border-t-[#151515]" />
      </div>
    )
  }

  return (
    <ProfilePage
      name={user.name}
      email={user.email}
      upi={user.upiId ?? ''}
      hasPassword={user.hasPassword ?? true}
    />
  )
}
