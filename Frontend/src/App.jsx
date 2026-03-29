// src/App.jsx
// Defines all routes.
//
// ProtectedRoute:
// → Checks if user is logged in via useAuth()
// → If not logged in → redirects to /login
// → If logged in → renders the page
//
// Route structure:
// /login              → LoginPage (public)
// /                   → Layout (navbar wrapper, protected)
//   /dashboard        → DashboardPage
//   /expenses/add     → AddExpensePage
//   /expenses/edit/:id → EditExpensePage

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AddExpensePage from './pages/AddExpensePage'
import EditExpensePage from './pages/EditExpensePage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()

  // Not logged in → redirect to login page
  if (!user) return <Navigate to="/login" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public — anyone can access */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — must be logged in */}
      {/* Layout renders the navbar and <Outlet /> for child pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* / → redirect to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expenses/add" element={<AddExpensePage />} />
        <Route path="expenses/edit/:id" element={<EditExpensePage />} />
      </Route>

      {/* Anything else → dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}