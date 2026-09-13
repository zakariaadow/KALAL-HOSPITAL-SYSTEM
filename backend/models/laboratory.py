from datetime import datetime
from database import db

class LabTest(db.Model):
    __tablename__ = 'lab_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    test_name = db.Column(db.String(200), nullable=False)
    test_type = db.Column(db.String(100))
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    result_date = db.Column(db.DateTime)
    results = db.Column(db.Text)
    normal_range = db.Column(db.String(200))
    status = db.Column(db.String(50), default='pending')
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    performed_by = db.Column(db.String(100))
    notes = db.Column(db.Text)
    report_file = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name() if self.patient else None,
            'test_name': self.test_name,
            'test_type': self.test_type,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'result_date': self.result_date.isoformat() if self.result_date else None,
            'results': self.results,
            'normal_range': self.normal_range,
            'status': self.status,
            'requested_by': self.requested_by,
            'performed_by': self.performed_by,
            'notes': self.notes,
            'report_file': self.report_file,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }