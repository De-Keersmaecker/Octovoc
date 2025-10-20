import axios from 'axios'
import { getToken, logout } from '../utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 and 422 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 422) {
      console.error('Authentication error:', error.response?.status, error.response?.data)
      // 422 from Flask-JWT-Extended usually means invalid/expired token
      logout()
    }
    return Promise.reject(error)
  }
)

export default api
