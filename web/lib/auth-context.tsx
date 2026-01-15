'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

interface User {
  id: number
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`
        const response = await api.get('/auth/me')
        setUser(response.data.user)
      } catch (error) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token)
    }
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
    setUser(response.data.user)
  }

  const register = async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/register', { email, password, name })
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token)
    }
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
    setUser(response.data.user)
  }

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
