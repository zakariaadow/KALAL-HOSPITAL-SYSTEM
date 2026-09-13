from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from database import db
from models.patient import Patient
from models.doctor import Doctor
from models.appointment import Appointment
from models.billing import Bill
from models.department import Department
from datetime import datetime, timedelta
from utils.auth import admin_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.filter_by(is_available=True).count()
    total_departments = Department.query.filter_by(is_active=True).count()
    
    today = datetime.now().date()
    today_start = datetime(today.year, today.month, today.day)
    today_end = today_start + timedelta(days=1)
    
    today_appointments = Appointment.query.filter(
        Appointment.appointment_date >= today_start,
        Appointment.appointment_date < today_end
    ).count()
    
    pending_appointments = Appointment.query.filter_by(status='scheduled').count()
    
    total_revenue = db.session.query(db.func.sum(Bill.total_amount)).filter_by(status='paid').scalar() or 0
    pending_payments = db.session.query(db.func.sum(Bill.total_amount)).filter_by(status='pending').scalar() or 0
    
    recent_appointments = Appointment.query.order_by(
        Appointment.appointment_date.desc()
    ).limit(5).all()
    
    recent_patients = Patient.query.order_by(
        Patient.created_at.desc()
    ).limit(5).all()
    
    return jsonify({
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_departments': total_departments,
        'today_appointments': today_appointments,
        'pending_appointments': pending_appointments,
        'total_revenue': float(total_revenue),
        'pending_payments': float(pending_payments),
        'recent_appointments': [app.to_dict() for app in recent_appointments],
        'recent_patients': [patient.to_dict() for patient in recent_patients]
    }), 200