// src/components/Layout.jsx
// Top navigation bar shown on all authenticated pages.
// Uses <Outlet /> from React Router to render the current page below it.
//
// Shows:
// → Logo (left)
// → User avatar + name (right)
// → Sign Out button (right)

import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Top Navbar ── */}
      <nav style={styles.nav}>

        {/* Logo — clicking it goes to dashboard */}
        <div style={styles.logo} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoIcon}>₹</div>
          <span style={styles.logoText}>ExpenseTracker</span>
        </div>

        {/* Right side — avatar + name + logout */}
        <div style={styles.navRight}>

          {/* Profile picture from Google, or initial fallback */}
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarFallback}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}

          <span style={styles.userName}>{user?.name}</span>

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E8EAF0'}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Page content rendered here ── */}
      <main style={styles.main}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
    <Outlet />
  </div>
      </main>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 64,
    background: '#FFFFFF',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    left: 0,             // ← add this
    right: 0,    
    zIndex: 100,
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--orange)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--text-primary)',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--border)',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--orange)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 15,
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  logoutBtn: {
    padding: '7px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  main: {
  position: 'fixed',        // ← fix main too
  top: 64,                  // ← exactly navbar height
  left: 0,
  right: 0,
  bottom: 0,                // ← stretches to bottom
  padding: '32px',
  overflowY: 'auto',        // ← only main scrolls if needed
  display: 'flex',
  justifyContent: 'center', // ← centers content horizontally
},
}