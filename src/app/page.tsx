'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/new')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}
