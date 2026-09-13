from datetime import datetime
from database import db

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    medical_record_id = db.Column(db.Integer, db.ForeignKey('medical_records.id'), nullable=True)
    medication = db.Column(db.String(200), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(100))
    instructions = db.Column(db.Text)
    quantity = db.Column(db.Integer)
    status = db.Column(db.String(50), default='active')
    refills = db.Column(db.Integer, default=0)
    prescribed_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships are defined in patient, doctor, and medical_record models
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name() if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name() if self.doctor else None,
            'medical_record_id': self.medical_record_id,
            'medication': self.medication,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'duration': self.duration,
            'instructions': self.instructions,
            'quantity': self.quantity,
            'status': self.status,
            'refills': self.refills,
            'prescribed_date': self.prescribed_date.isoformat() if self.prescribed_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Prescription {self.id}>'