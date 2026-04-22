import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScanProgress from '../components/ScanProgress.jsx'

const FEATURES = [
  { icon: '⚡', title: 'Performance', desc: 'Load times, compression, caching, page weight analysis' },
  { icon: '🔐', title: 'Security', desc: 'SSL/TLS, security headers, HSTS, CSP, XSS protection' },
  { icon: '📈', title: 'SEO', desc: 'Meta tags, headings, Open Graph, canonical URLs' },
  { icon: '🚨', title: 'Vulnerabilities', desc: 'Exposed files, outdated libraries, cookie flags' },
]

export default function Home() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanState, setScanState] = useState({ step: '', progress: 0, message: 'Starting...' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleScan = async () => {
    const trimmed = url.trim()
    if (!trimmed) { setError('Please enter a URL'); return }
    setError('')
    setScanning(true)
    setScanState({ step: 'crawl', progress: 5, message: 'Initializing scan...' })

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            setScanState({ step: data.step, progress: data.progress, message: data.message })
            if (data.step === 'done') {
              setTimeout(() => navigate(`/report/${data.report_id}`, { state: data }), 600)
              return
            }
            if (data.step === 'error') {
              setError(data.message)
              setScanning(false)
              return
            }
          } catch {}
        }
      }
    } catch (err) {
      setError('Failed to connect to backend. Is Flask running on port 5000?')
      setScanning(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleScan() }

  if (scanning) {
    return (
      <div style={{ paddingTop: 80, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <ScanProgress {...scanState} url={url} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Hero glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ maxWidth: 800, paddingTop: 80, paddingBottom: 80 }}>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeUp 0.4s ease forwards' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'var(--cyan-dim)', border: '1px solid var(--border-bright)',
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)',
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.5s ease infinite' }} />
            REAL-TIME WEBSITE ANALYSIS
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          textAlign: 'center', fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
          marginBottom: 20,
          animation: 'fadeUp 0.5s ease 0.1s forwards', opacity: 0,
        }}>
          Scan. Analyze.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--cyan), #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Secure Your Site.</span>
        </h1>

        <p style={{
          textAlign: 'center', fontSize: 18, color: 'var(--text-2)',
          maxWidth: 520, margin: '0 auto 48px',
          lineHeight: 1.6,
          animation: 'fadeUp 0.5s ease 0.2s forwards', opacity: 0,
        }}>
          Instant deep analysis of performance, security headers, SEO, and vulnerabilities — with a downloadable PDF report.
        </p>

        {/* URL Input */}
        <div style={{
          display: 'flex', gap: 0,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14,
          padding: 6,
          boxShadow: '0 0 0 1px rgba(14,165,233,0.1), 0 20px 60px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.5s ease 0.3s forwards', opacity: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            flex: 1, padding: '0 16px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://example.com"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-mono)',
                padding: '14px 0',
              }}
            />
          </div>
          <button
            onClick={handleScan}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, var(--cyan), #0284c7)',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, color: 'white',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.02em',
              boxShadow: '0 4px 16px rgba(14,165,233,0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Scan Now →
          </button>
        </div>

        {error && (
          <p style={{
            marginTop: 12, textAlign: 'center', fontSize: 13,
            color: 'var(--red)', fontFamily: 'var(--font-mono)',
          }}>{error}</p>
        )}

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, marginTop: 80,
          animation: 'fadeUp 0.5s ease 0.5s forwards', opacity: 0,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: '24px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
