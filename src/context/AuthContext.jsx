import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import axiosInstance from '../api/axiosInstance.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('stockpro_token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    localStorage.removeItem('stockpro_token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    const storedToken = localStorage.getItem('stockpro_token')
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        const isExpired = decoded.exp * 1000 < Date.now()
        if (isExpired) {
          logout()
        } else {
          setToken(storedToken)
          setUser({
            id: decoded.sub || decoded.userId,
            email: decoded.email,
            fullName: decoded.fullName || decoded.name || decoded.email,
            role: decoded.role || decoded.roles?.[0] || 'STAFF',
          })
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [logout])

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('stockpro_token', newToken)
    setToken(newToken)
    const decoded = jwtDecode(newToken)
    setUser(userData || {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName || decoded.name || email,
      role: decoded.role || decoded.roles?.[0] || 'STAFF',
    })
    navigate('/dashboard')
  }

  const register = async (data) => {
    const res = await axiosInstance.post('/auth/register', data)
    toast.success('Account created! Please log in.')
    navigate('/login')
    return res.data
  }

  const updateProfile = async (data) => {
    const res = await axiosInstance.put('/auth/profile', data)
    setUser(prev => ({ ...prev, ...data }))
    return res.data
  }

  const value = { user, token, loading, login, logout, register, updateProfile, isAuthenticated: !!token }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-sm text-slate-500">Loading StockPro...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
