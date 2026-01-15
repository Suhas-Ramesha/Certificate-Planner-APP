'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            Learning Planner
          </h1>
          <p className="text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        <div className="space-y-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full bg-white border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-xl font-semibold hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">
                <UserPlus className="w-5 h-5" />
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="text-center text-gray-600">
              You are signed in. Redirecting...
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
