from datetime import datetime
from database import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='scheduled')
    type = db.Column(db.String(50), default='regular')
    reason = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name() if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.full_name() if self.doctor else None,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'type': self.type,
            'reason': self.reason,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Appointment {self.id} - {self.status}>'