from datetime import datetime
from database import db

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    diagnosis = db.Column(db.Text)
    symptoms = db.Column(db.Text)
    treatment = db.Column(db.Text)
    notes = db.Column(db.Text)
    follow_up_date = db.Column(db.DateTime)
    is_emergency = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - defined here
    prescriptions = db.relationship('Prescription', backref='medical_record', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name() if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name() if self.doctor else None,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
            'diagnosis': self.diagnosis,
            'symptoms': self.symptoms,
            'treatment': self.treatment,
            'notes': self.notes,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'is_emergency': self.is_emergency,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<MedicalRecord {self.id}>'
