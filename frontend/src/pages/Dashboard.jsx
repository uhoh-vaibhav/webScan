import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import ScoreRing from '../components/ScoreRing.jsx'
import SectionPanel from '../components/SectionPanel.jsx'

export default function Dashboard() {
  const { id } = useParams()
  const location = useLocation()
  const [report, setReport] = useState(location.state || null)
  const [loading, setLoading] = useState(!location.state)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!report) {
      fetch(`/api/report/${id}`)
        .then(r => r.json())
        .then(data => {
          setReport({ ...data, ...data.details })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [id])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const resp = await fetch(`/api/report/${id}/pdf`)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `webguard-report-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF download failed')
    }
    setDownloading(false)
  }

  if (loading) return (
    <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-2)' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      Loading report...
    </div>
  )

  if (!report) return (
    <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-2)' }}>
      Report not found. <Link to="/" style={{ color: 'var(--cyan)' }}>Go home</Link>
    </div>
  )

  const overall = report.overall_score ?? Math.round(
    ((report.performance?.score || 0) + (report.security?.score || 0) +
     (report.seo?.score || 0) + (report.vulnerability?.score || 0)) / 4
  )
  const siteUrl = report.url || ''
  const ssl = report.security?.ssl || {}

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: 80 }}>
      <div className="container">

        {/* Header */}
        <div style={{
          marginTop: 40, marginBottom: 32,
          display: 'flex', flexWrap: 'wrap', gap: 16,
          alignItems: 'flex-start', justifyContent: 'space-between',
          animation: 'fadeUp 0.4s ease forwards',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none', fontSize: 13 }}>← New Scan</Link>
              <span style={{ color: 'var(--border)', fontSize: 13 }}>/</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>Report #{id}</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Analysis Report
            </h1>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)',
              textDecoration: 'none',
            }}>{siteUrl}</a>
          </div>
          <button onClick={handleDownloadPDF} disabled={downloading} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: downloading ? 'var(--bg-3)' : 'linear-gradient(135deg, var(--cyan), #0284c7)',
            border: 'none', borderRadius: 10, cursor: downloading ? 'wait' : 'pointer',
            fontSize: 13, fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-mono)',
            boxShadow: downloading ? 'none' : '0 4px 16px rgba(14,165,233,0.3)',
            transition: 'all 0.2s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M3 19h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Score Overview */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 24, marginBottom: 32,
          animation: 'fadeUp 0.5s ease 0.1s forwards', opacity: 0,
        }}>
          {/* Overall score */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px',
            display: 'flex', alignItems: 'center', gap: 32,
            backdropFilter: 'blur(10px)', flexWrap: 'wrap',
          }}>
            <ScoreRing score={overall} size={140} label="Overall Score" />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                {overall >= 80 ? '✅ Great job!' : overall >= 60 ? '⚠️ Needs attention' : '🚨 Critical issues found'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {overall >= 80
                  ? 'Your site is performing well overall. Review the details below for any remaining improvements.'
                  : overall >= 60
                  ? 'Some issues were found that should be addressed. Check the sections below for specific recommendations.'
                  : 'Several critical issues were detected. Prioritize the red items in the report below.'}
              </p>
              {ssl.has_ssl && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                  padding: '4px 12px', borderRadius: 100,
                  background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: 12, color: 'var(--green)',
                }}>
                  🔒 SSL Valid · {ssl.days_remaining} days remaining
                </div>
              )}
            </div>
          </div>

          {/* Individual scores grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start',
          }}>
            {[
              { label: 'Performance', key: 'performance', icon: '⚡' },
              { label: 'Security', key: 'security', icon: '🔐' },
              { label: 'SEO', key: 'seo', icon: '📈' },
              { label: 'Vulnerability', key: 'vulnerability', icon: '🚨' },
            ].map(s => {
              const sec = report[s.key] || {}
              return (
                <div key={s.key} style={{
                  padding: '16px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  backdropFilter: 'blur(10px)',
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <ScoreRing score={sec.score || 0} size={64} grade={sec.grade} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* SSL Info */}
        {ssl.has_ssl && (
          <div style={{
            marginBottom: 24,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center',
            backdropFilter: 'blur(10px)',
            animation: 'fadeUp 0.5s ease 0.2s forwards', opacity: 0,
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>SSL Issuer</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{ssl.issuer}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Expires</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{ssl.expiry}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Protocol</div>
              <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{ssl.protocol}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Days Remaining</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ssl.days_remaining < 30 ? 'var(--red)' : 'var(--green)' }}>
                {ssl.days_remaining} days
              </div>
            </div>
          </div>
        )}

        {/* Section panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { title: 'Performance Analysis', icon: '⚡', key: 'performance' },
            { title: 'Security Analysis', icon: '🔐', key: 'security' },
            { title: 'SEO Analysis', icon: '📈', key: 'seo' },
            { title: 'Vulnerability Analysis', icon: '🚨', key: 'vulnerability' },
          ].map((s, i) => (
            <div key={s.key} style={{ animation: `fadeUp 0.5s ease ${0.2 + i * 0.1}s forwards`, opacity: 0 }}>
              <SectionPanel {...s} data={report[s.key]} />
            </div>
          ))}
        </div>

        {/* Technologies */}
        {report.vulnerability?.metrics?.detected_technologies?.length > 0 && (
          <div style={{
            marginTop: 24,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-2)' }}>
              🧩 Detected Technologies
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {report.vulnerability.metrics.detected_technologies.map(tech => (
                <span key={tech} style={{
                  padding: '4px 12px', borderRadius: 100,
                  background: 'var(--cyan-dim)', border: '1px solid var(--border-bright)',
                  fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)',
                }}>{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Crawled pages */}
        {report.crawl?.pages?.length > 0 && (
          <div style={{
            marginTop: 24,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-2)' }}>
              🌐 Crawled Pages ({report.crawl.pages.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.crawl.pages.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: p.status_code === 200 ? 'var(--green)' : p.status_code >= 400 ? 'var(--red)' : 'var(--yellow)',
                    minWidth: 36,
                  }}>{p.status_code || 'ERR'}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)',
                    textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{p.url}</a>
                  {p.load_time && (
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      color: p.load_time > 2 ? 'var(--red)' : p.load_time > 1 ? 'var(--yellow)' : 'var(--green)',
                    }}>{p.load_time}s</span>
                  )}
                  {p.error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{p.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
