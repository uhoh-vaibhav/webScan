import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time


def crawl_site(url: str, max_pages: int = 5) -> dict:
    """Crawl a website and collect basic metadata."""
    visited = set()
    to_visit = [url]
    pages = []
    base_domain = urlparse(url).netloc

    headers = {
        'User-Agent': 'WebGuard-Bot/1.0 (Security Analysis Tool)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }

    start_time = time.time()

    while to_visit and len(visited) < max_pages:
        current_url = to_visit.pop(0)
        if current_url in visited:
            continue
        visited.add(current_url)

        try:
            t0 = time.time()
            resp = requests.get(current_url, headers=headers, timeout=10, allow_redirects=True)
            load_time = round(time.time() - t0, 3)

            soup = BeautifulSoup(resp.text, 'html.parser')
            title = soup.find('title')
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            h1s = [h.get_text(strip=True) for h in soup.find_all('h1')]
            images = soup.find_all('img')
            scripts = soup.find_all('script', src=True)
            stylesheets = soup.find_all('link', rel='stylesheet')

            # Collect internal links
            for a in soup.find_all('a', href=True):
                href = urljoin(current_url, a['href'])
                parsed = urlparse(href)
                if parsed.netloc == base_domain and href not in visited and href not in to_visit:
                    to_visit.append(href)

            pages.append({
                'url': current_url,
                'status_code': resp.status_code,
                'load_time': load_time,
                'title': title.get_text(strip=True) if title else None,
                'meta_description': meta_desc.get('content', '') if meta_desc else None,
                'h1_count': len(h1s),
                'h1_tags': h1s[:3],
                'image_count': len(images),
                'images_without_alt': sum(1 for img in images if not img.get('alt')),
                'script_count': len(scripts),
                'stylesheet_count': len(stylesheets),
                'content_length': len(resp.content),
                'response_headers': dict(resp.headers),
                'redirected': resp.url != current_url,
                'final_url': resp.url,
            })

        except requests.exceptions.SSLError:
            pages.append({'url': current_url, 'error': 'SSL Error', 'status_code': 0})
        except requests.exceptions.ConnectionError:
            pages.append({'url': current_url, 'error': 'Connection refused', 'status_code': 0})
        except requests.exceptions.Timeout:
            pages.append({'url': current_url, 'error': 'Timeout', 'status_code': 0})
        except Exception as e:
            pages.append({'url': current_url, 'error': str(e), 'status_code': 0})

    total_time = round(time.time() - start_time, 3)

    return {
        'base_url': url,
        'pages_crawled': len(pages),
        'total_crawl_time': total_time,
        'pages': pages,
    }
