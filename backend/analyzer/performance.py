import requests
import time
from urllib.parse import urlparse


def analyze_performance(url: str, crawl_data: dict) -> dict:
    issues = []
    improvements = []
    score = 100

    pages = crawl_data.get('pages', [])
    main_page = next((p for p in pages if not p.get('error')), None)

    if not main_page:
        return {'score': 0, 'issues': ['Could not load page'], 'improvements': [], 'metrics': {}}

    # Load time check
    load_time = main_page.get('load_time', 0)
    if load_time > 3:
        issues.append({'severity': 'critical', 'title': 'Very slow page load', 'detail': f'Page took {load_time}s to load (target: <1s)'})
        score -= 25
    elif load_time > 1.5:
        issues.append({'severity': 'warning', 'title': 'Slow page load', 'detail': f'Page took {load_time}s (target: <1s)'})
        score -= 12

    # Page size
    content_length = main_page.get('content_length', 0)
    size_kb = round(content_length / 1024, 1)
    if content_length > 5_000_000:
        issues.append({'severity': 'critical', 'title': 'Extremely large page size', 'detail': f'Page is {size_kb}KB (target: <500KB)'})
        improvements.append('Compress images and minify HTML/CSS/JS')
        score -= 20
    elif content_length > 1_000_000:
        issues.append({'severity': 'warning', 'title': 'Large page size', 'detail': f'Page is {size_kb}KB (target: <500KB)'})
        improvements.append('Consider lazy loading images and splitting JS bundles')
        score -= 10

    # Script count
    script_count = main_page.get('script_count', 0)
    if script_count > 15:
        issues.append({'severity': 'warning', 'title': 'Too many scripts', 'detail': f'{script_count} external scripts detected (target: <10)'})
        improvements.append('Bundle and minify JavaScript files')
        score -= 10
    elif script_count > 8:
        improvements.append('Consider bundling JavaScript files to reduce HTTP requests')
        score -= 5

    # Images without alt
    images_without_alt = main_page.get('images_without_alt', 0)
    if images_without_alt > 0:
        improvements.append(f'{images_without_alt} images missing alt attributes — add them for accessibility and SEO')

    # Redirect check
    if main_page.get('redirected'):
        issues.append({'severity': 'info', 'title': 'HTTP redirect detected', 'detail': f'URL redirects to {main_page.get("final_url")}'})
        improvements.append('Set up permanent 301 redirect from HTTP to HTTPS at server level')
        score -= 5

    # Check response headers for compression
    resp_headers = main_page.get('response_headers', {})
    content_encoding = resp_headers.get('Content-Encoding', '').lower()
    if content_encoding not in ('gzip', 'br', 'zstd', 'deflate'):
        issues.append({'severity': 'warning', 'title': 'No compression detected', 'detail': 'Enable Gzip or Brotli compression on your server'})
        improvements.append('Enable Gzip/Brotli compression to reduce transfer size by 60-80%')
        score -= 10

    # Cache control
    cache_control = resp_headers.get('Cache-Control', '')
    if not cache_control:
        issues.append({'severity': 'warning', 'title': 'Missing Cache-Control header', 'detail': 'No caching policy set for static assets'})
        improvements.append('Set Cache-Control headers for static assets (images, CSS, JS)')
        score -= 8

    score = max(0, min(100, score))

    return {
        'score': score,
        'grade': score_to_grade(score),
        'issues': issues,
        'improvements': improvements,
        'metrics': {
            'load_time_seconds': load_time,
            'page_size_kb': size_kb,
            'script_count': script_count,
            'images_without_alt': images_without_alt,
            'compression_enabled': content_encoding in ('gzip', 'br', 'zstd', 'deflate'),
            'cache_control_set': bool(cache_control),
        }
    }


def score_to_grade(score):
    if score >= 90: return 'A'
    if score >= 80: return 'B'
    if score >= 70: return 'C'
    if score >= 60: return 'D'
    return 'F'
