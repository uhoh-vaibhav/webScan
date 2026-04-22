import requests
import ssl
import socket
from urllib.parse import urlparse
from datetime import datetime


SECURITY_HEADERS = {
    'Strict-Transport-Security': {
        'severity': 'critical',
        'description': 'HSTS not set — forces HTTPS connections',
        'fix': 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains'
    },
    'Content-Security-Policy': {
        'severity': 'critical',
        'description': 'CSP missing — prevents XSS and injection attacks',
        'fix': 'Add a Content-Security-Policy header restricting allowed content sources'
    },
    'X-Frame-Options': {
        'severity': 'warning',
        'description': 'X-Frame-Options missing — site may be embedded in iframes (clickjacking)',
        'fix': 'Add: X-Frame-Options: DENY or SAMEORIGIN'
    },
    'X-Content-Type-Options': {
        'severity': 'warning',
        'description': 'X-Content-Type-Options missing — MIME sniffing possible',
        'fix': 'Add: X-Content-Type-Options: nosniff'
    },
    'Referrer-Policy': {
        'severity': 'info',
        'description': 'Referrer-Policy not set — referrer data may leak to third parties',
        'fix': 'Add: Referrer-Policy: no-referrer-when-downgrade'
    },
    'Permissions-Policy': {
        'severity': 'info',
        'description': 'Permissions-Policy not set — browser features uncontrolled',
        'fix': 'Add: Permissions-Policy: geolocation=(), microphone=(), camera=()'
    },
}


def analyze_security(url: str, crawl_data: dict) -> dict:
    issues = []
    improvements = []
    score = 100

    parsed = urlparse(url)
    domain = parsed.netloc

    # SSL / HTTPS check
    ssl_info = check_ssl(domain)
    if not ssl_info['has_ssl']:
        issues.append({'severity': 'critical', 'title': 'No HTTPS / SSL', 'detail': 'Site is not using HTTPS. All traffic is unencrypted.'})
        improvements.append('Install a free SSL certificate via Let\'s Encrypt and force HTTPS redirects')
        score -= 30
    elif ssl_info.get('expired'):
        issues.append({'severity': 'critical', 'title': 'SSL Certificate Expired', 'detail': f'Certificate expired on {ssl_info.get("expiry")}'})
        score -= 25
    elif ssl_info.get('days_remaining', 365) < 30:
        issues.append({'severity': 'warning', 'title': 'SSL Certificate Expiring Soon', 'detail': f'Certificate expires in {ssl_info.get("days_remaining")} days'})
        score -= 10

    # Check security headers
    pages = crawl_data.get('pages', [])
    main_page = next((p for p in pages if not p.get('error')), None)
    resp_headers = {}
    if main_page:
        resp_headers = {k.lower(): v for k, v in main_page.get('response_headers', {}).items()}

    missing_headers = []
    for header, meta in SECURITY_HEADERS.items():
        if header.lower() not in resp_headers:
            missing_headers.append({'header': header, **meta})
            if meta['severity'] == 'critical':
                score -= 15
            elif meta['severity'] == 'warning':
                score -= 8
            else:
                score -= 3

    for h in missing_headers:
        issues.append({'severity': h['severity'], 'title': f'Missing header: {h["header"]}', 'detail': h['description']})
        improvements.append(h['fix'])

    # Server header leak
    server_header = resp_headers.get('server', '')
    if server_header and any(v in server_header.lower() for v in ['apache', 'nginx', 'iis', 'php']):
        issues.append({'severity': 'info', 'title': 'Server version exposed', 'detail': f'Server header reveals: {server_header}'})
        improvements.append('Remove or obscure the Server response header to hide software versions')
        score -= 5

    # X-Powered-By
    powered_by = resp_headers.get('x-powered-by', '')
    if powered_by:
        issues.append({'severity': 'info', 'title': 'X-Powered-By header exposed', 'detail': f'Reveals backend: {powered_by}'})
        improvements.append('Remove X-Powered-By header from server configuration')
        score -= 5

    score = max(0, min(100, score))

    return {
        'score': score,
        'grade': score_to_grade(score),
        'ssl': ssl_info,
        'issues': issues,
        'improvements': improvements,
        'headers_checked': list(SECURITY_HEADERS.keys()),
        'missing_headers': [h['header'] for h in missing_headers],
    }


def check_ssl(domain: str) -> dict:
    # Strip port if present
    host = domain.split(':')[0]
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.create_connection((host, 443), timeout=8), server_hostname=host) as ssock:
            cert = ssock.getpeercert()
            expiry_str = cert.get('notAfter', '')
            expiry_dt = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z') if expiry_str else None
            days_remaining = (expiry_dt - datetime.utcnow()).days if expiry_dt else None
            return {
                'has_ssl': True,
                'expired': days_remaining is not None and days_remaining < 0,
                'days_remaining': days_remaining,
                'expiry': expiry_dt.strftime('%Y-%m-%d') if expiry_dt else None,
                'issuer': dict(x[0] for x in cert.get('issuer', [])).get('organizationName', 'Unknown'),
                'subject': host,
                'protocol': ssock.version(),
            }
    except ssl.SSLCertVerificationError:
        return {'has_ssl': False, 'error': 'SSL certificate verification failed'}
    except ssl.SSLError as e:
        return {'has_ssl': False, 'error': str(e)}
    except (socket.timeout, ConnectionRefusedError, OSError):
        return {'has_ssl': False, 'error': 'Could not connect on port 443'}


def score_to_grade(score):
    if score >= 90: return 'A'
    if score >= 80: return 'B'
    if score >= 70: return 'C'
    if score >= 60: return 'D'
    return 'F'
