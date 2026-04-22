const STEPS = [
  { key: 'crawl',        label: 'Crawling pages',          icon: '🌐' },
  { key: 'performance',  label: 'Performance analysis',    icon: '⚡' },
  { key: 'security',     label: 'Security & SSL check',    icon: '🔐' },
  { key: 'seo',          label: 'SEO analysis',            icon: '📈' },
  { key: 'vulnerability',label: 'Vulnerability scan',      icon: '🚨' },
  { key: 'saving',       label: 'Generating report',       icon: '📄' },
]

export default function ScanProgress({ step, progress, message, url }) {
  const currentIdx = STEPS.findIndex(s => s.key === step)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 40, paddingTop: 60,
    }}>
      {/* Scanning animation */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        {/* Pulse rings */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid var(--cyan)',
            animation: `pulse-ring 2s ease-out ${i * 0.4}s infinite`,
            opacity: 0,
          }} />
        ))}
        {/* Shield icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          border: '2px solid var(--border-bright)',
          animation: 'glow-pulse 2s ease-in-out infinite',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
              fill="rgba(14,165,233,0.2)" stroke="var(--cyan)" strokeWidth="1.5"/>
            <path d="M9 12l2 2 4-4" stroke="var(--cyan)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 10, right: 10, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
          animation: 'scan-line 2s linear infinite',
          boxShadow: '0 0 8px var(--cyan)',
        }} />
      </div>

      {/* URL + message */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13,
          color: 'var(--cyan)', marginBottom: 8,
          background: 'var(--cyan-dim)', padding: '4px 16px',
          borderRadius: 100, border: '1px solid var(--border-bright)',
          display: 'inline-block',
        }}>{url}</div>
        <p style={{ fontSize: 15, color: 'var(--text-2)', marginTop: 8 }}>{message}</p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{
          height: 4, background: 'rgba(255,255,255,0.06)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--cyan), #38bdf8)',
            borderRadius: 99, transition: 'width 0.8s ease',
            boxShadow: '0 0 12px var(--cyan-glow)',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 8, fontSize: 12, color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>Scanning...</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Steps checklist */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {STEPS.map((s, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px',
              borderRadius: 10,
              background: active ? 'var(--cyan-dim)' : done ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${active ? 'var(--border-bright)' : done ? 'rgba(34,197,94,0.15)' : 'var(--border)'}`,
              transition: 'all 0.4s ease',
            }}>
              <span style={{ fontSize: 16 }}>
                {done ? '✅' : active ? '⏳' : '⬜'}
              </span>
              <span style={{ fontSize: 13, color: active ? 'var(--cyan)' : done ? 'var(--green)' : 'var(--text-3)', fontWeight: active ? 600 : 400 }}>
                {s.icon} {s.label}
              </span>
              {active && (
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{
                    width: 14, height: 14, border: '2px solid var(--cyan)',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
