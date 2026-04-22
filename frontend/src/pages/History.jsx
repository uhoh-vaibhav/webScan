import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)'
  const bg = score >= 80 ? 'var(--green-dim)' : score >= 60 ? 'var(--yellow-dim)' : 'var(--red-dim)'
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 100, fontSize: 12,
      fontFamily: 'var(--font-mono)', fontWeight: 700,
      color, background: bg,
    }}>{score}</span>
  )
}

export default function History() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => { setReports(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 40 }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Scan History
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Your previous website analyses
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-2)' }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Loading...
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80,
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No scans yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>Run your first website analysis to see results here.</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '10px 24px',
              background: 'linear-gradient(135deg, var(--cyan), #0284c7)',
              borderRadius: 10, color: 'white', textDecoration: 'none',
              fontSize: 14, fontWeight: 700,
            }}>Start Scanning</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reports.map((r, i) => (
              <Link key={r.id} to={`/report/${r.id}`} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 24px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                animation: `fadeUp 0.4s ease ${i * 0.05}s forwards`, opacity: 0,
                flexWrap: 'wrap',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Shield icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.05))',
                  border: '1px solid var(--border-bright)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>🛡️</div>

                {/* URL */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>
                    {r.url.replace(/^https?:\/\//, '')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Scores */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Perf', score: r.performance_score },
                    { label: 'Sec', score: r.security_score },
                    { label: 'SEO', score: r.seo_score },
                    { label: 'Vuln', score: r.vulnerability_score },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{s.label}</div>
                      <ScoreBadge score={s.score} />
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Overall</div>
                    <ScoreBadge score={r.overall_score} />
                  </div>
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-3)' }}>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
