'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface ProgressData {
  roadmap_topic_id: number
  topic_name: string
  week_number: number
  hours_studied: number
  completion_percentage: number
}

interface WeeklyProgress {
  week_number: number
  week_start_date: string
  total_hours_studied: number
  topics_completed: number
}

export default function ProgressView() {
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null)
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  useEffect(() => {
    if (selectedRoadmapId) {
      fetchProgress()
      fetchWeeklyProgress()
    }
  }, [selectedRoadmapId])

  const fetchRoadmaps = async () => {
    try {
      const response = await api.get('/roadmaps')
      setRoadmaps(response.data.roadmaps)
      if (response.data.roadmaps.length > 0) {
        setSelectedRoadmapId(response.data.roadmaps[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    if (!selectedRoadmapId) return

    try {
      const response = await api.get(`/progress/roadmap/${selectedRoadmapId}`)
      setProgress(response.data.progress)
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const fetchWeeklyProgress = async () => {
    if (!selectedRoadmapId) return

    try {
      const response = await api.get(`/progress/weekly/${selectedRoadmapId}`)
      setWeeklyProgress(response.data.weeklyProgress)
    } catch (error) {
      console.error('Failed to fetch weekly progress:', error)
    }
  }

  const calculateStats = () => {
    const totalHours = progress.reduce((sum, p) => sum + p.hours_studied, 0)
    const avgCompletion = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.completion_percentage, 0) / progress.length
      : 0
    const completedTopics = progress.filter((p) => p.completion_percentage === 100).length

    return { totalHours, avgCompletion, completedTopics }
  }

  const chartData = weeklyProgress.map((wp) => ({
    week: `Week ${wp.week_number}`,
    hours: wp.total_hours_studied,
    topics: wp.topics_completed,
  }))

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-200 rounded-full mb-6">
          <TrendingUp className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Progress Data
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Generate a roadmap and start tracking your learning progress to see your achievements here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
            <p className="text-gray-600">Track your journey and achievements</p>
          </div>
        </div>
      </div>
      {roadmaps.length > 1 && (
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Roadmap</label>
          <select
            value={selectedRoadmapId || ''}
            onChange={(e) => setSelectedRoadmapId(parseInt(e.target.value))}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
          >
            {roadmaps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-400 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg. Completion</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgCompletion.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Topics Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedTopics}</p>
            </div>
          </div>
        </div>
      </div>

      {weeklyProgress.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Weekly Progress Overview
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="hours" fill="#0ea5e9" name="Hours Studied" radius={[8, 8, 0, 0]} />
              <Bar dataKey="topics" fill="#10b981" name="Topics Completed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Topic Progress</h3>
        <div className="space-y-4">
          {progress.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No progress data yet. Start tracking your learning!
            </p>
          ) : (
            progress.map((p) => (
              <div key={`${p.roadmap_topic_id}-${p.week_number}`} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 text-lg">{p.topic_name}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Week {p.week_number}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {p.hours_studied.toFixed(1)} hours
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {p.completion_percentage}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${p.completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
