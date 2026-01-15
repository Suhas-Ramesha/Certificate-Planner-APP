'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Save, Plus, X, Sparkles } from 'lucide-react'
import AutocompleteInput from './AutocompleteInput'
import {
  BACKGROUND_SUGGESTIONS,
  LEARNING_GOAL_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  INDUSTRY_SUGGESTIONS,
  getRecommendedSkills,
} from '@/lib/suggestions'

interface OnboardingFormProps {
  onComplete: () => void
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [formData, setFormData] = useState({
    background: '',
    current_skills: [] as string[],
    learning_goals: '',
    time_availability_hours_per_week: 10,
    preferred_learning_style: '',
    target_industry: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)

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

  // Update skill recommendations when form data changes
  useEffect(() => {
    if (
      formData.background ||
      formData.learning_goals ||
      formData.target_industry
    ) {
      const recommendations = getRecommendedSkills(
        formData.background,
        formData.learning_goals,
        formData.target_industry,
        formData.current_skills
      )
      setRecommendedSkills(recommendations)
      setShowRecommendations(recommendations.length > 0)
    } else {
      setShowRecommendations(false)
    }
  }, [formData.background, formData.learning_goals, formData.target_industry, formData.current_skills])

  const addRecommendedSkill = (skill: string) => {
    if (!formData.current_skills.includes(skill)) {
      setFormData({
        ...formData,
        current_skills: [...formData.current_skills, skill],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/users/profile', formData)
      onComplete()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-primary-50 text-lg">
            Help us create a personalized learning roadmap by sharing your background and goals.
          </p>
        </div>
        <div className="p-8">

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background
            </label>
            <AutocompleteInput
              value={formData.background}
              onChange={(value) => setFormData({ ...formData, background: value })}
              suggestions={BACKGROUND_SUGGESTIONS}
              placeholder="Tell us about your educational background, work experience, and current role..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {BACKGROUND_SUGGESTIONS.slice(0, 5).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setFormData({ ...formData, background: bg })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.background === bg
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Skills
            </label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="Add a skill and press Enter"
                />
                {skillInput && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {SKILL_SUGGESTIONS.filter((skill) =>
                      skill.toLowerCase().includes(skillInput.toLowerCase())
                    )
                      .slice(0, 5)
                      .map((skill, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSkillInput(skill);
                            addSkill();
                            setSkillInput('');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 transition-colors border-b border-gray-100 last:border-0"
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.current_skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-primary-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            {showRecommendations && recommendedSkills.length > 0 && (
              <div className="mt-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">
                    Recommended Skills Based on Your Profile
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addRecommendedSkill(skill)}
                      disabled={formData.current_skills.includes(skill)}
                      className={`px-3 py-1 text-sm rounded-full border transition-all ${
                        formData.current_skills.includes(skill)
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-100 hover:border-primary-400'
                      }`}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Goals
            </label>
            <AutocompleteInput
              value={formData.learning_goals}
              onChange={(value) => setFormData({ ...formData, learning_goals: value })}
              suggestions={LEARNING_GOAL_SUGGESTIONS}
              placeholder="What do you want to achieve? What skills do you want to learn?"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {LEARNING_GOAL_SUGGESTIONS.slice(0, 5).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFormData({ ...formData, learning_goals: goal })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.learning_goals === goal
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Available (hours per week)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.time_availability_hours_per_week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    time_availability_hours_per_week: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Learning Style
              </label>
              <select
                value={formData.preferred_learning_style}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_learning_style: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 bg-white"
              >
                <option value="">Select...</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Industry
            </label>
            <AutocompleteInput
              value={formData.target_industry}
              onChange={(value) => setFormData({ ...formData, target_industry: value })}
              suggestions={INDUSTRY_SUGGESTIONS}
              placeholder="e.g., Software Development, Data Science, Cloud Computing..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {INDUSTRY_SUGGESTIONS.slice(0, 5).map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => setFormData({ ...formData, target_industry: industry })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.target_industry === industry
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile & Continue
              </>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
