from datetime import datetime
from database import db

class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    bill_number = db.Column(db.String(50), unique=True, nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    total_amount = db.Column(db.Float, nullable=False)
    paid_amount = db.Column(db.Float, default=0.0)
    balance = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='pending')
    payment_method = db.Column(db.String(50))
    payment_date = db.Column(db.DateTime)
    description = db.Column(db.Text)
    items = db.Column(db.JSON, default=[])
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_balance(self):
        self.balance = self.total_amount - self.paid_amount
        if self.balance <= 0:
            self.status = 'paid'
        elif self.paid_amount > 0:
            self.status = 'partially_paid'
        return self.balance
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name() if self.patient else None,
            'bill_number': self.bill_number,
            'appointment_id': self.appointment_id,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'total_amount': self.total_amount,
            'paid_amount': self.paid_amount,
            'balance': self.balance,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'description': self.description,
            'items': self.items,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }