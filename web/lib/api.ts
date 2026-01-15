import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Clerk token to requests
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Get token from localStorage (set by auth-context)
    const token = localStorage.getItem('clerk_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clerk_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
