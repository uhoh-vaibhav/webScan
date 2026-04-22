export default function ScoreRing({ score, size = 120, label, grade }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)'
  const glow = score >= 80
    ? 'rgba(34,197,94,0.4)' : score >= 60
    ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
              transition: 'stroke-dasharray 1s ease',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size < 100 ? 18 : 26,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}>{score}</span>
          {grade && <span style={{
            fontSize: 11, color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
            marginTop: 2,
          }}>{grade}</span>}
        </div>
      </div>
      {label && <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>}
    </div>
  )
}
