'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Sparkles, Play, List, Loader2, Clock } from 'lucide-react'
import RoadmapLoading from './RoadmapLoading'

interface Roadmap {
  id: number
  title: string
  description: string
  estimated_duration_weeks: number
  topics: Topic[]
}

interface Topic {
  id: number
  topic_name: string
  description: string
  estimated_hours: number
  prerequisites: string[]
  order_index: number
}

export default function RoadmapView() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [youtubeResources, setYoutubeResources] = useState<Record<number, any[]>>({})

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const fetchRoadmaps = async () => {
    setLoading(true)
    try {
      const response = await api.get('/roadmaps')
      const roadmapsData = response.data.roadmaps

      if (roadmapsData.length > 0) {
        // Fetch full roadmap with topics
        const fullRoadmap = await api.get(`/roadmaps/${roadmapsData[0].id}`)
        setSelectedRoadmap(fullRoadmap.data.roadmap)
        setRoadmaps(roadmapsData)
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRoadmap = async () => {
    setGenerating(true)
    try {
      const response = await api.post('/roadmaps/generate')
      const newRoadmap = response.data.roadmap
      setSelectedRoadmap(newRoadmap)
      setRoadmaps([newRoadmap, ...roadmaps])
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  if (generating) {
    return <RoadmapLoading />
  }

  const fetchYoutubeResources = async (topicId: number) => {
    if (youtubeResources[topicId]) return

    try {
      const response = await api.get(`/youtube/topic/${topicId}`)
      if (response.data.resources.length === 0) {
        // Search for resources
        await api.get(`/youtube/search/${topicId}?maxResults=5`)
        const updated = await api.get(`/youtube/topic/${topicId}`)
        setYoutubeResources({ ...youtubeResources, [topicId]: updated.data.resources })
      } else {
        setYoutubeResources({ ...youtubeResources, [topicId]: response.data.resources })
      }
    } catch (error) {
      console.error('Failed to fetch YouTube resources:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your roadmaps...</p>
        </div>
      </div>
    )
  }

  if (!selectedRoadmap && roadmaps.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full mb-6">
          <Sparkles className="w-12 h-12 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Roadmap Yet
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Generate your personalized learning roadmap powered by AI to get started on your learning journey.
        </p>
        <button
          onClick={generateRoadmap}
          disabled={generating}
          className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
          Generate Roadmap
        </button>
      </div>
    )
  }

  return (
    <div>
      {!selectedRoadmap && (
        <div className="mb-6">
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            Generate New Roadmap
          </button>
        </div>
      )}

      {selectedRoadmap && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-3">
              {selectedRoadmap.title}
            </h2>
            <p className="text-primary-50 mb-6 text-lg">{selectedRoadmap.description}</p>
            <div className="flex items-center gap-6 text-primary-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-medium">
                  {selectedRoadmap.estimated_duration_weeks} weeks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-medium">
                  {selectedRoadmap.topics?.length || 0} topics
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedRoadmap.topics?.map((topic, index) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6"
                onMouseEnter={() => fetchYoutubeResources(topic.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-xl font-bold text-lg shadow-md">
                      {topic.order_index}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {topic.topic_name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{topic.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
                        <Clock className="w-4 h-4" />
                        {topic.estimated_hours} hours
                      </span>
                      {topic.prerequisites && topic.prerequisites.length > 0 && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          <List className="w-4 h-4" />
                          {topic.prerequisites.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {youtubeResources[topic.id] && youtubeResources[topic.id].length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary-600" />
                      Learning Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {youtubeResources[topic.id].map((resource: any) => (
                        <a
                          key={resource.id}
                          href={`https://www.youtube.com/${resource.resource_type === 'playlist' ? 'playlist?list=' : 'watch?v='}${resource.video_id || resource.playlist_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-white transition-all group"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            resource.resource_type === 'playlist' 
                              ? 'bg-purple-100 group-hover:bg-purple-200' 
                              : 'bg-red-100 group-hover:bg-red-200'
                          }`}>
                            {resource.resource_type === 'playlist' ? (
                              <List className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Play className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {resource.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {resource.channel_name}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
