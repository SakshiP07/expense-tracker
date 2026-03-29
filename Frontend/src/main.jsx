// src/main.jsx
// Root entry point.
// Wraps the entire app with three providers:
//
// 1. GoogleOAuthProvider
//    → Enables the Google Sign-In button globally.
//    → Needs your GOOGLE_CLIENT_ID from .env
//
// 2. AuthProvider
//    → Makes login/logout/user available everywhere via useAuth()
//
// 3. BrowserRouter
//    → Enables React Router navigation (useNavigate, useParams etc.)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)