// src/pages/LoginPage.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user])

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

        {/* ── SVG Doodles ── */}
        <svg style={styles.doodles} viewBox="0 0 500 800" xmlns="http://www.w3.org/2000/svg">
          {/* Rupee symbol top right */}
          <text x="380" y="80" fontSize="72" fill="rgba(255,255,255,0.08)" fontWeight="bold">₹</text>

          {/* Large circle top left */}
          <circle cx="30" cy="120" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

          {/* Small circle */}
          <circle cx="420" cy="200" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"/>

          {/* Dashed circle */}
          <circle cx="60" cy="650" r="55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 4"/>

          {/* Receipt doodle */}
          <rect x="350" y="580" width="60" height="80" rx="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <line x1="360" y1="600" x2="400" y2="600" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <line x1="360" y1="615" x2="395" y2="615" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <line x1="360" y1="630" x2="400" y2="630" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <line x1="360" y1="645" x2="385" y2="645" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

          {/* Coin stack doodle */}
          <ellipse cx="420" cy="710" rx="28" ry="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <ellipse cx="420" cy="700" rx="28" ry="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <ellipse cx="420" cy="690" rx="28" ry="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

          {/* Arrow up — growth */}
          <polyline points="80,500 80,440 120,440" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <polyline points="60,460 80,440 100,460" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

          {/* Grid dots pattern */}
          {[0,1,2,3,4].map(row =>
            [0,1,2,3].map(col => (
              <circle
                key={`${row}-${col}`}
                cx={310 + col * 18}
                cy={300 + row * 18}
                r="2"
                fill="rgba(255,255,255,0.12)"
              />
            ))
          )}

          {/* Wavy line */}
          <path
            d="M 20 380 Q 60 360 100 380 Q 140 400 180 380"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />

          {/* Small rupee bottom */}
          <text x="40" y="760" fontSize="36" fill="rgba(255,255,255,0.07)" fontWeight="bold">₹</text>

          {/* Diamond */}
          <polygon
            points="200,120 220,150 200,180 180,150"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />

          {/* Plus signs */}
          <text x="260" y="680" fontSize="28" fill="rgba(255,255,255,0.1)" fontWeight="300">+</text>
          <text x="140" y="200" fontSize="20" fill="rgba(255,255,255,0.1)" fontWeight="300">+</text>
          <text x="460" y="420" fontSize="24" fill="rgba(255,255,255,0.1)" fontWeight="300">+</text>
        </svg>

        <div style={styles.leftContent}>
          <div style={styles.bigIcon}>₹</div>

          <h1 style={styles.headline}>
            Track Every Rupee,<br />Own Every Decision.
          </h1>

          <p style={styles.subline}>
            Log what you spend, see where it goes.
            Simple, fast, and private.
          </p>

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

          <div style={styles.divider} />

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
              {/* <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: 18, height: 18 }}
              /> */}
              {/* Sign in with Google */}
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
    height: '100vh',
    fontFamily: 'var(--font-body)',
    overflow: 'hidden',
  },

  // Left orange panel — reduced from flex:1 to fixed width
  left: {
    width: '45%',             // ← reduced (was flex:1 ~60%)
    background: 'linear-gradient(145deg, #FF6B2B 0%, #FF8C42 60%, #FFB347 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    position: 'relative',    // ← for doodles positioning
    overflow: 'hidden',      // ← clip doodles at edges
  },

  // Doodles — full area SVG behind content
  doodles: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },

  leftContent: {
    maxWidth: 360,
    color: '#fff',
    position: 'relative', // ← above doodles
    zIndex: 1,
  },
  bigIcon: {
    width: 56,
    height: 56,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    marginBottom: 24,
  },
  headline: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 14,
    color: '#fff',
  },
  subline: {
    fontSize: 15,
    lineHeight: 1.65,
    opacity: 0.88,
    marginBottom: 28,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  check: {
    width: 20,
    height: 20,
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },

  // Right panel — takes remaining space
  right: {
    flex: 1,                  // ← takes remaining 55%
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
  devBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 24px',
    border: '1px solid #dadce0',
    borderRadius: 4,
    background: '#fff',
    fontSize: 14,
    fontWeight: 500,
    color: '#3c4043',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
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