// src/utils/api.js
// Central axios instance used by every component and page.
//
// Why a central instance?
// → One place to configure base URL
// → Request interceptor auto-attaches JWT to every outgoing request
// → Response interceptor auto-logs out on 401 (expired token)
//   so you never get stuck in a broken state
//
// Usage anywhere in the app:
//   import api from '../utils/api'
//   const res = await api.get('/expenses')
//   const res = await api.post('/expenses', payload)

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// ── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
// Runs before every outgoing request.
// Reads JWT from localStorage and adds it to the Authorization header.
// This is why you never write "Authorization: Bearer ..." manually.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
// Runs after every response.
// If server returns 401 (token expired or invalid):
// → Clear stored token and user
// → Redirect to login
// This prevents the user from being stuck on a broken screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api