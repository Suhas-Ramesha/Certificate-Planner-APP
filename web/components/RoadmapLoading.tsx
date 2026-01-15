'use client'

import { Sparkles, Loader2, BookOpen, Target, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

const loadingMessages = [
  'Analyzing your learning goals and background...',
  'Creating a personalized study path just for you...',
  'Curating the best topics based on your skills...',
  'Optimizing your learning timeline...',
  'Almost ready! Finalizing your roadmap...'
]

export default function RoadmapLoading() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 3000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 500)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full">
        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-2xl">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Generating Your Personalized Roadmap
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(progress, 95)}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">Creating your roadmap...</span>
            <span className="text-sm font-semibold text-primary-600">
              {Math.round(Math.min(progress, 95))}%
            </span>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm">Tailored to your specific goals and background</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm">Structured learning path with clear milestones</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm">Optimized timeline based on your availability</span>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-2 text-primary-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">This may take 30-60 seconds...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
