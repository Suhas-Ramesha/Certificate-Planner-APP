'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import OnboardingForm from '@/components/OnboardingForm'
import RoadmapView from '@/components/RoadmapView'
import CertificationsView from '@/components/CertificationsView'
import ProgressView from '@/components/ProgressView'
import LoadingScreen from '@/components/LoadingScreen'

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

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile()
    }
  }, [authLoading, user])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setProfile(response.data.profile)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <LoadingScreen 
        message="Loading Your Dashboard"
        subMessage="Preparing your personalized learning experience..."
      />
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Navbar />
        <OnboardingForm onComplete={fetchProfile} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'certifications' && <CertificationsView />}
        {activeTab === 'progress' && <ProgressView />}
      </main>
    </div>
  )
}
