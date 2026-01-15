'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Award, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Certification {
  id: number
  name: string
  provider: string
  description: string
  difficulty_level: string
  estimated_study_hours: number
  recommendation_reason: string
  priority: number
  status: string
  website_url?: string
}

export default function CertificationsView() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/certifications/recommended')
      setCertifications(response.data.certifications)
      setErrorMessage('')
    } catch (error: any) {
      const status = error.response?.status
      const backendMessage = error.response?.data?.error
      if (status === 400) {
        setErrorMessage(backendMessage || 'Generate a roadmap first to get recommendations.')
      } else if (status === 503) {
        setErrorMessage(backendMessage || 'Recommendations are temporarily unavailable. Please try again later.')
      } else {
        setErrorMessage('Unable to load certifications. Please try again.')
        console.error('Failed to fetch certifications:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await api.patch(`/certifications/${id}/status`, { status })
      setCertifications((certs) =>
        certs.map((cert) => (cert.id === id ? { ...cert, status } : cert))
      )
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'skipped':
        return <XCircle className="w-5 h-5 text-gray-400" />
      default:
        return <Award className="w-5 h-5 text-primary-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'skipped':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-primary-100 text-primary-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (certifications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full mb-6">
          <Award className="w-12 h-12 text-yellow-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Certifications Yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {errorMessage || 'Generate a roadmap first to get personalized certification recommendations based on your learning goals.'}
        </p>
        {errorMessage && (
          <p className="text-sm text-gray-500">
            If you already have a roadmap, try generating recommendations again later.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-yellow-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended Certifications
            </h2>
            <p className="text-gray-600">
              Based on your learning goals and roadmap
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {certifications
          .sort((a, b) => b.priority - a.priority)
          .map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(cert.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {cert.name}
                      </h3>
                      <p className="text-primary-600 font-medium mb-3">
                        {cert.provider}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        cert.status
                      )}`}
                    >
                      {cert.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{cert.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {cert.difficulty_level}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {cert.estimated_study_hours} hours
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      Priority: {cert.priority}/5
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-primary-700">Why this certification:</span>{' '}
                      {cert.recommendation_reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                {cert.website_url && (
                  <a
                    href={cert.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn More
                  </a>
                )}
                <select
                  value={cert.status}
                  onChange={(e) => updateStatus(cert.id, e.target.value)}
                  disabled={updating === cert.id}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 bg-white"
                >
                  <option value="recommended">Recommended</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
