// src/pages/LoginPage.jsx
// Login page — Google Sign-In only. No email/password.
//
// Flow:
// 1. User clicks "Sign in with Google"
// 2. Google popup opens
// 3. User picks their Google account
// 4. Google returns a credential (ID token)
// 5. We call login() from AuthContext
// 6. AuthContext sends it to POST /auth/google
// 7. Backend verifies and returns our JWT
// 8. User is redirected to /dashboard

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  // If already logged in — skip login page entirely
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user])

  // Called when Google Sign-In succeeds
  // credentialResponse.credential = the Google ID token (a JWT from Google)
  async function handleGoogleSuccess(credentialResponse) {
    const result = await login(credentialResponse.credential)
    if (result.success) {
      navigate('/dashboard')
    } else {
      alert(result.error || 'Sign-in failed. Please try again.')
    }
  }

  function handleGoogleError() {
    alert('Google Sign-In failed. Please try again.')
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Left — brand panel ── */}
      <div style={styles.left}>
        <div style={styles.leftContent}>

          {/* Logo */}
          <div style={styles.bigIcon}>₹</div>

          <h1 style={styles.headline}>
            Track Every Rupee,<br />Own Every Decision.
          </h1>

          <p style={styles.subline}>
            Log what you spend, see where it goes.
            Simple, fast, and private — just you and your expenses.
          </p>

          {/* Feature list */}
          {[
            'Google Sign-In — zero passwords',
            'Add multiple items per expense',
            'See your total at a glance',
          ].map(feature => (
            <div key={feature} style={styles.featureRow}>
              <span style={styles.check}>✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — login card ── */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Welcome</h2>
          <p style={styles.cardSub}>Sign in to your expense tracker</p>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Google Sign-In button from @react-oauth/google */}
          {/* GoogleLogin renders Google's official button */}
          {/* onSuccess fires with credentialResponse when user picks account */}
          <div style={styles.googleBtnWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="rectangular"
              size="large"
              text="signin_with_google"
              theme="outline"
              width="300"
            />
          </div>

          {loading && (
            <p style={styles.loadingText}>Signing you in…</p>
          )}

          <p style={styles.note}>
            No password needed. We use Google for secure authentication.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'var(--font-body)',
  },

  // Left orange panel
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #FF6B2B 0%, #FF8C42 60%, #FFB347 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  leftContent: {
    maxWidth: 420,
    color: '#fff',
  },
  bigIcon: {
    width: 64,
    height: 64,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    marginBottom: 28,
  },
  headline: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 16,
    color: '#fff',
  },
  subline: {
    fontSize: 16,
    lineHeight: 1.65,
    opacity: 0.88,
    marginBottom: 32,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  check: {
    width: 22,
    height: 22,
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  // Right card
  right: {
    width: 480,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 32,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 380,
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    background: 'var(--border)',
    margin: '28px 0',
  },
  googleBtnWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 1.5,
  },
}