import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(3,7,18,0.85)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--cyan), #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--cyan-glow)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Web<span style={{ color: 'var(--cyan)' }}>Guard</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[{ to: '/', label: 'Analyzer' }, { to: '/history', label: 'History' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              textDecoration: 'none', padding: '6px 16px', borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              color: location.pathname === to ? 'var(--cyan)' : 'var(--text-2)',
              background: location.pathname === to ? 'var(--cyan-dim)' : 'transparent',
            }}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
