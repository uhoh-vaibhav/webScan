import { useState } from 'react'
import ScoreRing from './ScoreRing.jsx'
import IssueCard from './IssueCard.jsx'

export default function SectionPanel({ title, icon, data, accentColor }) {
  const [open, setOpen] = useState(true)
  if (!data) return null

  const issues = data.issues || []
  const improvements = data.improvements || []
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const warningCount = issues.filter(i => i.severity === 'warning').length

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {criticalCount > 0 && <span style={{ color: 'var(--red)' }}>{criticalCount} critical  </span>}
            {warningCount > 0 && <span style={{ color: 'var(--yellow)' }}>{warningCount} warnings  </span>}
            {criticalCount === 0 && warningCount === 0 && <span style={{ color: 'var(--green)' }}>No major issues</span>}
          </div>
        </div>
        <ScoreRing score={data.score || 0} size={72} grade={data.grade} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
          color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s',
        }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Issues Found
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {issues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
              </div>
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                How to Improve
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {improvements.map((imp, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 14px',
                    background: 'rgba(14,165,233,0.05)',
                    borderRadius: 8,
                    border: '1px solid rgba(14,165,233,0.1)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1, color: 'var(--cyan)' }}>
                      <path d="M9 12l2 2 4-4M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {data.metrics && Object.keys(data.metrics).length > 0 && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Metrics
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {Object.entries(data.metrics).map(([key, val]) => {
                  if (typeof val === 'object') return null
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  const isGood = val === true
                  const isBad = val === false
                  return (
                    <div key={key} style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                      <div style={{
                        fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: isGood ? 'var(--green)' : isBad ? 'var(--red)' : 'var(--cyan)',
                      }}>
                        {typeof val === 'boolean' ? (val ? '✓ Yes' : '✗ No') : String(val)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
