from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from database import db
from models import Report
from auth import auth_bp
from analyzer.crawler import crawl_site
from analyzer.performance import analyze_performance
from analyzer.security import analyze_security
from analyzer.seo import analyze_seo
from analyzer.vulnerability import analyze_vulnerability
from analyzer.report import generate_pdf_report
import json
import time
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///webguard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'webguard-secret-change-in-prod')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CORS(app, origins=["http://localhost:5173", "https://web-scan-two.vercel.app"], supports_credentials=True)
db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')

with app.app_context():
    db.create_all()


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({'error': 'URL is required'}), 400
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    def generate():
        try:
            yield f"data: {json.dumps({'step': 'crawl', 'message': 'Crawling website pages...', 'progress': 10})}\n\n"
            crawl_data = crawl_site(url)

            yield f"data: {json.dumps({'step': 'performance', 'message': 'Analyzing performance metrics...', 'progress': 30})}\n\n"
            perf_data = analyze_performance(url, crawl_data)

            yield f"data: {json.dumps({'step': 'security', 'message': 'Checking SSL & security headers...', 'progress': 50})}\n\n"
            sec_data = analyze_security(url, crawl_data)

            yield f"data: {json.dumps({'step': 'seo', 'message': 'Running SEO analysis...', 'progress': 70})}\n\n"
            seo_data = analyze_seo(url, crawl_data)

            yield f"data: {json.dumps({'step': 'vulnerability', 'message': 'Scanning for vulnerabilities...', 'progress': 85})}\n\n"
            vuln_data = analyze_vulnerability(url, crawl_data)

            yield f"data: {json.dumps({'step': 'saving', 'message': 'Saving report...', 'progress': 95})}\n\n"

            report = Report(
                url=url,
                performance_score=perf_data.get('score', 0),
                security_score=sec_data.get('score', 0),
                seo_score=seo_data.get('score', 0),
                vulnerability_score=vuln_data.get('score', 0),
                report_data=json.dumps({
                    'crawl': crawl_data,
                    'performance': perf_data,
                    'security': sec_data,
                    'seo': seo_data,
                    'vulnerability': vuln_data,
                })
            )
            with app.app_context():
                db.session.add(report)
                db.session.commit()
                report_id = report.id

            overall = int((perf_data['score'] + sec_data['score'] + seo_data['score'] + vuln_data['score']) / 4)

            result = {
                'step': 'done',
                'message': 'Analysis complete!',
                'progress': 100,
                'report_id': report_id,
                'url': url,
                'overall_score': overall,
                'performance': perf_data,
                'security': sec_data,
                'seo': seo_data,
                'vulnerability': vuln_data,
                'crawl': crawl_data,
            }
            yield f"data: {json.dumps(result)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'step': 'error', 'message': str(e), 'progress': 0})}\n\n"

    return Response(generate(), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})


@app.route('/api/report/<int:report_id>/pdf', methods=['GET'])
def download_pdf(report_id):
    report = Report.query.get_or_404(report_id)
    report_data = json.loads(report.report_data)
    pdf_path = generate_pdf_report(report_id, report.url, report_data)
    return send_file(pdf_path, as_attachment=True, download_name=f'webguard-report-{report_id}.pdf')


@app.route('/api/reports', methods=['GET'])
def get_reports():
    reports = Report.query.order_by(Report.created_at.desc()).limit(20).all()
    return jsonify([r.to_dict() for r in reports])


@app.route('/api/report/<int:report_id>', methods=['GET'])
def get_report(report_id):
    report = Report.query.get_or_404(report_id)
    data = report.to_dict()
    data['details'] = json.loads(report.report_data)
    return jsonify(data)


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'WebGuard API'})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
