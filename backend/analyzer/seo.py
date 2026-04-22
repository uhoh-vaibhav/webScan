from bs4 import BeautifulSoup
import requests


def analyze_seo(url: str, crawl_data: dict) -> dict:
    issues = []
    improvements = []
    score = 100

    pages = crawl_data.get('pages', [])
    main_page = next((p for p in pages if not p.get('error')), None)

    if not main_page:
        return {'score': 0, 'issues': ['Page could not be loaded'], 'improvements': [], 'metrics': {}}

    headers = {'User-Agent': 'WebGuard-Bot/1.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
    except Exception:
        soup = None

    # Title checks
    title = main_page.get('title')
    if not title:
        issues.append({'severity': 'critical', 'title': 'Missing page title', 'detail': 'No <title> tag found'})
        improvements.append('Add a descriptive <title> tag (50-60 characters)')
        score -= 20
    elif len(title) < 10:
        issues.append({'severity': 'warning', 'title': 'Title too short', 'detail': f'Title is only {len(title)} chars (target: 50-60)'})
        improvements.append('Expand page title to 50-60 characters with primary keyword')
        score -= 10
    elif len(title) > 70:
        issues.append({'severity': 'warning', 'title': 'Title too long', 'detail': f'Title is {len(title)} chars — may be cut off in search results'})
        improvements.append('Shorten page title to under 60 characters')
        score -= 5

    # Meta description
    meta_desc = main_page.get('meta_description')
    if not meta_desc:
        issues.append({'severity': 'critical', 'title': 'Missing meta description', 'detail': 'No meta description found'})
        improvements.append('Add a meta description (150-160 characters) summarizing the page content')
        score -= 15
    elif len(meta_desc) < 50:
        issues.append({'severity': 'warning', 'title': 'Meta description too short', 'detail': f'{len(meta_desc)} chars (target: 150-160)'})
        improvements.append('Expand meta description to 150-160 characters')
        score -= 8
    elif len(meta_desc) > 170:
        issues.append({'severity': 'warning', 'title': 'Meta description too long', 'detail': f'{len(meta_desc)} chars — truncated in search results'})
        score -= 5

    # H1 tag
    h1_count = main_page.get('h1_count', 0)
    if h1_count == 0:
        issues.append({'severity': 'critical', 'title': 'Missing H1 tag', 'detail': 'No H1 heading found on page'})
        improvements.append('Add one H1 tag with your primary keyword near the top of the page')
        score -= 15
    elif h1_count > 1:
        issues.append({'severity': 'warning', 'title': 'Multiple H1 tags', 'detail': f'{h1_count} H1 tags found — use exactly one'})
        improvements.append('Keep only one H1 per page; use H2-H6 for subheadings')
        score -= 8

    # Images without alt
    images_without_alt = main_page.get('images_without_alt', 0)
    total_images = main_page.get('image_count', 0)
    if images_without_alt > 0:
        issues.append({'severity': 'warning', 'title': 'Images missing alt text',
                       'detail': f'{images_without_alt}/{total_images} images have no alt attribute'})
        improvements.append('Add descriptive alt text to all images for accessibility and SEO')
        score -= min(10, images_without_alt * 2)

    if soup:
        # Canonical tag
        canonical = soup.find('link', rel='canonical')
        if not canonical:
            issues.append({'severity': 'warning', 'title': 'Missing canonical tag', 'detail': 'No canonical URL declared'})
            improvements.append('Add <link rel="canonical" href="..."> to prevent duplicate content issues')
            score -= 8

        # Open Graph
        og_title = soup.find('meta', property='og:title')
        og_desc = soup.find('meta', property='og:description')
        og_image = soup.find('meta', property='og:image')
        if not og_title or not og_desc or not og_image:
            missing_og = [x for x, y in [('og:title', og_title), ('og:description', og_desc), ('og:image', og_image)] if not y]
            issues.append({'severity': 'info', 'title': 'Missing Open Graph tags', 'detail': f'Missing: {", ".join(missing_og)}'})
            improvements.append('Add Open Graph meta tags to improve social media sharing previews')
            score -= 5

        # Viewport
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if not viewport:
            issues.append({'severity': 'warning', 'title': 'Missing viewport meta tag', 'detail': 'Site may not be mobile-friendly'})
            improvements.append('Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile support')
            score -= 10

        # Schema / structured data
        schema = soup.find('script', type='application/ld+json')
        if not schema:
            improvements.append('Add JSON-LD structured data (Schema.org) to improve rich search results')

    score = max(0, min(100, score))

    return {
        'score': score,
        'grade': score_to_grade(score),
        'issues': issues,
        'improvements': improvements,
        'metrics': {
            'title': title,
            'title_length': len(title) if title else 0,
            'meta_description': meta_desc,
            'meta_description_length': len(meta_desc) if meta_desc else 0,
            'h1_count': h1_count,
            'h1_tags': main_page.get('h1_tags', []),
            'images_without_alt': images_without_alt,
            'total_images': total_images,
        }
    }


def score_to_grade(score):
    if score >= 90: return 'A'
    if score >= 80: return 'B'
    if score >= 70: return 'C'
    if score >= 60: return 'D'
    return 'F'
