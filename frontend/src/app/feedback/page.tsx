'use client'

import { useAuth } from '@/context/AuthContext'
import { FeedbackPage } from '@/components/feedback/feedback-page'

export default function Page() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center" style={{ backgroundColor: '#fbf6ee' }}>
        <div className="size-12 animate-spin rounded-full border-4 border-[#151515]/20 border-t-[#151515]" />
      </div>
    )
  }

  return <FeedbackPage email={user?.email ?? 'guest@splitza.app'} />
}
