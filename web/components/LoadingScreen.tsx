'use client'

import { Sparkles, Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  subMessage?: string
  showProgress?: boolean
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  subMessage,
  showProgress = true 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6 shadow-lg animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {message}
        </h2>
        
        {subMessage && (
          <p className="text-gray-600 mb-6 text-lg">
            {subMessage}
          </p>
        )}

        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full animate-progress" style={{
              width: '100%',
              animation: 'progress 2s ease-in-out infinite'
            }}></div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-primary-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Please wait...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
