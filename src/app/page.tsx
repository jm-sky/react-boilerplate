'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useAuth'
// import LandingPage from '@/components/landing/landing-page'

export default function Home() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to In-Dex</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Index creation management system
        </p>
        <div className="mt-8 space-x-4">
          <a href="/login" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Sign In
          </a>
          <a href="/register" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
