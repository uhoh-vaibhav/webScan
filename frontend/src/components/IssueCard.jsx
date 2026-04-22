export default function IssueCard({ issue }) {
  const { severity = 'info', title, detail } = issue

  const meta = {
    critical: { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.25)', label: 'CRITICAL', icon: '🔴' },
    warning:  { color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(245,158,11,0.25)', label: 'WARNING', icon: '🟡' },
    info:     { color: 'var(--text-2)', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', label: 'INFO', icon: '🔵' },
  }[severity] || {}

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: 8,
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 12 }}>{meta.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: meta.color, letterSpacing: '0.08em',
          }}>{meta.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{detail}</p>
      </div>
    </div>
  )
}
