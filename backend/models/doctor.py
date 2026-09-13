from datetime import datetime
from database import db
import uuid

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(200), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    consultation_fee = db.Column(db.Float, default=0.0)
    years_of_experience = db.Column(db.Integer, default=0)
    qualifications = db.Column(db.Text)
    availability = db.Column(db.JSON, default={})
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    department = db.relationship('Department', backref='doctors', lazy=True)
    appointments = db.relationship('Appointment', backref='doctor', lazy=True, cascade='all, delete-orphan')
    medical_records = db.relationship('MedicalRecord', backref='doctor', lazy=True, cascade='all, delete-orphan')
    prescriptions = db.relationship('Prescription', backref='doctor', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        # Auto-generate license number if not provided or empty
        license_num = kwargs.get('license_number')
        if not license_num or license_num.strip() == '':
            kwargs['license_number'] = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        super(Doctor, self).__init__(**kwargs)
    
    def full_name(self):
        return f"Dr. {self.first_name} {self.last_name}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name(),
            'specialization': self.specialization,
            'license_number': self.license_number,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'phone': self.phone,
            'email': self.email,
            'consultation_fee': self.consultation_fee,
            'years_of_experience': self.years_of_experience,
            'qualifications': self.qualifications,
            'availability': self.availability,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Doctor {self.full_name()}>'