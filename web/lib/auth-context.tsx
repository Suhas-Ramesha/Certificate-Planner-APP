'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import api from './api'

interface User {
  id: number
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  clerkUser: ReturnType<typeof useUser>['user'] | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { getToken, signOut } = useClerkAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const syncedUserIdRef = useRef<string | null>(null)
  const isSyncingRef = useRef(false)

  useEffect(() => {
    if (!clerkLoaded) {
      setLoading(true)
      return
    }

    let isMounted = true

    const syncUser = async () => {
      // Prevent concurrent syncs
      if (isSyncingRef.current) return
      
      if (clerkUser) {
        // Only sync if user ID changed
        if (syncedUserIdRef.current === clerkUser.id) {
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        isSyncingRef.current = true
        syncedUserIdRef.current = clerkUser.id

        try {
          // Get Clerk session token for backend using useAuth hook
          const token = await getToken()
          
          // Store token for backend API calls
          if (typeof window !== 'undefined' && token) {
            localStorage.setItem('clerk_token', token)
          }
          
          // Sync user with backend
          try {
            const response = await api.post('/auth/clerk', {
              clerkId: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              name: clerkUser.fullName || clerkUser.firstName || undefined
            })
            
            if (isMounted) {
              setUser(response.data.user)
              setLoading(false)
            }
          } catch (error: any) {
            console.error('Backend sync error:', error)
            // If backend sync fails, use Clerk user data
            if (isMounted) {
              setUser({
                id: 0,
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                name: clerkUser.fullName || undefined
              })
              setLoading(false)
            }
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error)
          if (isMounted) {
            setLoading(false)
          }
        } finally {
          isSyncingRef.current = false
        }
      } else {
        syncedUserIdRef.current = null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('clerk_token')
        }
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
        isSyncingRef.current = false
      }
    }

    syncUser()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.id, clerkLoaded]) // getToken is stable from Clerk hook

  const logout = async () => {
    await signOut()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clerk_token')
    }
    setUser(null)
    syncedUserIdRef.current = null
  }

  return (
    <AuthContext.Provider value={{ user, clerkUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
