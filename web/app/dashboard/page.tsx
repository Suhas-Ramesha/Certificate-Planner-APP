'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import OnboardingForm from '@/components/OnboardingForm'
import LoadingScreen from '@/components/LoadingScreen'

// Dynamically import heavy components to improve initial load
const RoadmapView = dynamic(() => import('@/components/RoadmapView'), {
  loading: () => <div className="text-center py-8">Loading roadmap...</div>
})
const CertificationsView = dynamic(() => import('@/components/CertificationsView'), {
  loading: () => <div className="text-center py-8">Loading certifications...</div>
})
const ProgressView = dynamic(() => import('@/components/ProgressView'), {
  loading: () => <div className="text-center py-8">Loading progress...</div>
})

interface UserProfile {
  id: number
  background?: string
  current_skills?: string[]
  learning_goals?: string
  time_availability_hours_per_week?: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'roadmap')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const hasFetchedRef = useRef(false)
  const previousUserIdRef = useRef<number | undefined>(undefined)

  // Memoize activeTab to avoid unnecessary re-renders
  const activeTabMemo = useMemo(() => {
    return searchParams.get('tab') || 'roadmap'
  }, [searchParams])

  useEffect(() => {
    setActiveTab(activeTabMemo)
  }, [activeTabMemo])

  // Reset fetch state when user changes
  useEffect(() => {
    const currentUserId = user?.id
    if (previousUserIdRef.current !== currentUserId) {
      previousUserIdRef.current = currentUserId
      hasFetchedRef.current = false
      setProfile(null)
      setLoading(true)
    }
  }, [user?.id])

  // Fetch profile when user is available (only once per user)
  useEffect(() => {
    if (authLoading || !user || hasFetchedRef.current) return
    
    hasFetchedRef.current = true
    setLoading(true)
    
    api.get('/users/profile')
      .then((response) => {
        setProfile(response.data.profile)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch profile:', error)
        hasFetchedRef.current = false // Allow retry on error
        setLoading(false)
      })
  }, [authLoading, user?.id]) // Only depend on user ID, not the whole user object

  // Callback for OnboardingForm to refetch profile
  const fetchProfile = useCallback(async () => {
    if (!user) return
    
    hasFetchedRef.current = false // Allow refetch
    setLoading(true)
    try {
      const response = await api.get('/users/profile')
      setProfile(response.data.profile)
      hasFetchedRef.current = true
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      hasFetchedRef.current = false
    } finally {
      setLoading(false)
    }
  }, [user])

  // Redirect if no user (only after auth is loaded)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  // Show loading state
  if (authLoading) {
    return (
      <LoadingScreen 
        message="Loading Your Dashboard"
        subMessage="Preparing your personalized learning experience..."
      />
    )
  }

  // Redirect if no user (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null
  }

  // Show loading while fetching profile
  if (loading && !profile) {
    return (
      <LoadingScreen 
        message="Loading Your Dashboard"
        subMessage="Fetching your profile..."
      />
    )
  }

  if (!profile) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <Navbar />
        <OnboardingForm onComplete={fetchProfile} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'certifications' && <CertificationsView />}
        {activeTab === 'progress' && <ProgressView />}
      </main>
    </div>
  )
}
