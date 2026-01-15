'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import { User, Mail, Calendar, BookOpen, Target, Clock, Save, Edit2 } from 'lucide-react'

interface UserProfile {
  id: number
  background?: string
  current_skills?: string[]
  learning_goals?: string
  time_availability_hours_per_week?: number
  preferred_learning_style?: string
  target_industry?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    background: '',
    current_skills: [] as string[],
    learning_goals: '',
    time_availability_hours_per_week: 10,
    preferred_learning_style: '',
    target_industry: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      const profileData = response.data.profile
      setProfile(profileData)
      if (profileData) {
        setFormData({
          background: profileData.background || '',
          current_skills: profileData.current_skills || [],
          learning_goals: profileData.learning_goals || '',
          time_availability_hours_per_week: profileData.time_availability_hours_per_week || 10,
          preferred_learning_style: profileData.preferred_learning_style || '',
          target_industry: profileData.target_industry || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.current_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        current_skills: [...formData.current_skills, skillInput.trim()],
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      current_skills: formData.current_skills.filter((s) => s !== skill),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/users/profile', formData)
      setEditing(false)
      fetchProfile()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar activeTab="profile" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary-600 shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {user?.name || 'User Profile'}
                  </h1>
                  <div className="flex items-center gap-2 text-primary-100">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {editing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Background
                  </label>
                  <textarea
                    value={formData.background}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about your background..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a skill"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.current_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-primary-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Learning Goals
                    </label>
                    <textarea
                      value={formData.learning_goals}
                      onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time Available (hours/week)
                    </label>
                    <input
                      type="number"
                      value={formData.time_availability_hours_per_week}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_availability_hours_per_week: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <input
                      type="text"
                      value={formData.preferred_learning_style}
                      onChange={(e) =>
                        setFormData({ ...formData, preferred_learning_style: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Industry
                    </label>
                    <input
                      type="text"
                      value={formData.target_industry}
                      onChange={(e) =>
                        setFormData({ ...formData, target_industry: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      fetchProfile()
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Background</h3>
                    </div>
                    <p className="text-gray-600">
                      {profile?.background || 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Learning Goals</h3>
                    </div>
                    <p className="text-gray-600">
                      {profile?.learning_goals || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Current Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.current_skills && profile.current_skills.length > 0 ? (
                      profile.current_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No skills added yet</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Time Available</h3>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                      {profile?.time_availability_hours_per_week || 0} hrs/week
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Learning Style</h3>
                    <p className="text-gray-600">
                      {profile?.preferred_learning_style || 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Target Industry</h3>
                    <p className="text-gray-600">
                      {profile?.target_industry || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
