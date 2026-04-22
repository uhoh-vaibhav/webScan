from database import db
from datetime import datetime


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(2048), nullable=False)
    performance_score = db.Column(db.Integer, default=0)
    security_score = db.Column(db.Integer, default=0)
    seo_score = db.Column(db.Integer, default=0)
    vulnerability_score = db.Column(db.Integer, default=0)
    report_data = db.Column(db.Text, nullable=False, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def overall_score(self):
        return int((self.performance_score + self.security_score +
                    self.seo_score + self.vulnerability_score) / 4)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'performance_score': self.performance_score,
            'security_score': self.security_score,
            'seo_score': self.seo_score,
            'vulnerability_score': self.vulnerability_score,
            'overall_score': self.overall_score(),
            'created_at': self.created_at.isoformat(),
        }


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'created_at': self.created_at.isoformat()}
