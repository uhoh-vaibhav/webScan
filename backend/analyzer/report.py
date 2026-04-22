from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os

OUTPUT_DIR = '/tmp/webguard_reports'
os.makedirs(OUTPUT_DIR, exist_ok=True)

COLORS = {
    'primary': colors.HexColor('#0ea5e9'),
    'dark': colors.HexColor('#0f172a'),
    'success': colors.HexColor('#22c55e'),
    'warning': colors.HexColor('#f59e0b'),
    'danger': colors.HexColor('#ef4444'),
    'info': colors.HexColor('#64748b'),
    'light_bg': colors.HexColor('#f8fafc'),
    'border': colors.HexColor('#e2e8f0'),
    'white': colors.white,
}


def score_color(score):
    if score >= 80: return COLORS['success']
    if score >= 60: return COLORS['warning']
    return COLORS['danger']


def severity_color(severity):
    return {'critical': COLORS['danger'], 'warning': COLORS['warning'],
            'info': COLORS['info']}.get(severity, COLORS['info'])


def generate_pdf_report(report_id: int, url: str, report_data: dict) -> str:
    pdf_path = os.path.join(OUTPUT_DIR, f'webguard-{report_id}.pdf')

    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=24,
                                  textColor=COLORS['dark'], spaceAfter=4, fontName='Helvetica-Bold')
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=14,
                               textColor=COLORS['dark'], spaceBefore=16, spaceAfter=6, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9,
                                 textColor=COLORS['dark'], spaceAfter=4)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8,
                                  textColor=COLORS['info'])

    story = []

    # Header
    story.append(Paragraph('WebGuard Security Report', title_style))
    story.append(Paragraph(f'<font color="#0ea5e9">{url}</font>', ParagraphStyle(
        'URL', parent=styles['Normal'], fontSize=11, spaceAfter=4)))
    story.append(Paragraph(f'Generated: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}  |  Report ID: #{report_id}', small_style))
    story.append(HRFlowable(width='100%', thickness=1, color=COLORS['border'], spaceAfter=12))

    # Score summary table
    perf = report_data.get('performance', {})
    sec = report_data.get('security', {})
    seo = report_data.get('seo', {})
    vuln = report_data.get('vulnerability', {})

    scores = [perf.get('score', 0), sec.get('score', 0), seo.get('score', 0), vuln.get('score', 0)]
    overall = int(sum(scores) / 4)

    score_data = [
        ['Category', 'Score', 'Grade', 'Status'],
        ['Overall', str(overall), score_to_grade(overall), 'PASS' if overall >= 70 else 'FAIL'],
        ['Performance', str(perf.get('score', 0)), perf.get('grade', '-'), ''],
        ['Security', str(sec.get('score', 0)), sec.get('grade', '-'), ''],
        ['SEO', str(seo.get('score', 0)), seo.get('grade', '-'), ''],
        ['Vulnerabilities', str(vuln.get('score', 0)), vuln.get('grade', '-'), ''],
    ]

    score_table = Table(score_data, colWidths=[5*cm, 3*cm, 3*cm, 4*cm])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['dark']),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLORS['white']),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, 1), COLORS['light_bg']),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 2), (-1, -1), [COLORS['white'], COLORS['light_bg']]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Paragraph('Score Summary', h2_style))
    story.append(score_table)
    story.append(Spacer(1, 12))

    # Section details
    sections = [
        ('Performance Analysis', perf),
        ('Security Analysis', sec),
        ('SEO Analysis', seo),
        ('Vulnerability Analysis', vuln),
    ]

    for section_name, section_data in sections:
        story.append(Paragraph(section_name, h2_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=COLORS['border'], spaceAfter=6))

        issues = section_data.get('issues', [])
        if issues:
            story.append(Paragraph('<b>Issues Found:</b>', body_style))
            issue_rows = [['Severity', 'Issue', 'Detail']]
            for issue in issues:
                issue_rows.append([
                    issue.get('severity', 'info').upper(),
                    issue.get('title', ''),
                    issue.get('detail', ''),
                ])
            issue_table = Table(issue_rows, colWidths=[2.5*cm, 5*cm, 7.5*cm])
            issue_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), COLORS['dark']),
                ('TEXTCOLOR', (0, 0), (-1, 0), COLORS['white']),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['white'], COLORS['light_bg']]),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('WORDWRAP', (0, 0), (-1, -1), True),
            ]))
            story.append(issue_table)
            story.append(Spacer(1, 8))

        improvements = section_data.get('improvements', [])
        if improvements:
            story.append(Paragraph('<b>How to Improve:</b>', body_style))
            for imp in improvements:
                story.append(Paragraph(f'• {imp}', ParagraphStyle('bullet', parent=body_style,
                                                                     leftIndent=12, spaceAfter=3)))
        story.append(Spacer(1, 8))

    # SSL details
    ssl_info = sec.get('ssl', {})
    if ssl_info:
        story.append(Paragraph('SSL Certificate Details', h2_style))
        ssl_rows = [
            ['Property', 'Value'],
            ['Has SSL', 'Yes' if ssl_info.get('has_ssl') else 'No'],
            ['Issuer', ssl_info.get('issuer', 'N/A')],
            ['Expiry', ssl_info.get('expiry', 'N/A')],
            ['Days Remaining', str(ssl_info.get('days_remaining', 'N/A'))],
            ['Protocol', ssl_info.get('protocol', 'N/A')],
        ]
        ssl_table = Table(ssl_rows, colWidths=[5*cm, 10*cm])
        ssl_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), COLORS['dark']),
            ('TEXTCOLOR', (0, 0), (-1, 0), COLORS['white']),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['white'], COLORS['light_bg']]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(ssl_table)

    # Footer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width='100%', thickness=0.5, color=COLORS['border']))
    story.append(Paragraph('Generated by WebGuard — Website Security & Performance Analysis Tool',
                            ParagraphStyle('footer', parent=styles['Normal'], fontSize=8,
                                           textColor=COLORS['info'], alignment=TA_CENTER, spaceBefore=6)))

    doc.build(story)
    return pdf_path


def score_to_grade(score):
    if score >= 90: return 'A'
    if score >= 80: return 'B'
    if score >= 70: return 'C'
    if score >= 60: return 'D'
    return 'F'
