// src/context/AuthContext.jsx
// Global authentication state.
//
// Provides: user, token, loading, login(), logout()
// to any component in the app via useAuth() hook.
//
// Why localStorage?
// → Without it, every page refresh logs the user out.
//   localStorage persists across refreshes so the user
//   stays logged in until they explicitly sign out.
//
// Why verify token on mount?
// → The stored token might be expired (e.g. user left laptop for 2 days).
//   We call GET /auth/me on mount to confirm the token is still valid.
//   If it fails, the response interceptor in api.js clears storage and
//   redirects to login automatically.

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

// Create the context — null default so we can detect missing Provider
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialise from localStorage so user stays logged in on page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [loading, setLoading] = useState(false)

  // On mount — verify the stored token is still valid
  // If expired, api.js interceptor will clear storage and redirect to /login
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
  }, []) // runs once on app mount


  async function login(googleCredential) {
    // googleCredential = the raw ID token Google gives us after sign-in
    // We send it to our backend which verifies it and returns our own JWT
    setLoading(true)
    try {
      const res = await api.post('/auth/google', { token: googleCredential })
      const { access_token, user: userData } = res.data

      // Store JWT and user profile so they survive page refresh
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Login failed'
      }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    // Clear everything from storage and state
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this instead of useContext(AuthContext) directly
// Throws a clear error if used outside AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}