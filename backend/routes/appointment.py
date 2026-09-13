from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.appointment import Appointment
from models.patient import Patient
from models.doctor import Doctor
from models.user import User
from models.billing import Bill
from datetime import datetime, timedelta
import pytz
import uuid

appointment_bp = Blueprint('appointment', __name__)


# ============================================================
# GET ALL APPOINTMENTS - Filter by role
# ============================================================
@appointment_bp.route('', methods=['GET'])
@appointment_bp.route('/', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get appointments filtered by user role"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    print(f"🔍 get_appointments: user={user.username}, role={user.role}")
    
    query = Appointment.query
    
    # ✅ PATIENT: only their own appointments
    if user.role == 'patient':
        if not user.patient:
            print(f"❌ Patient {user.username} has no patient profile — returning empty")
            return jsonify([]), 200
        print(f"   → Filtering by patient_id={user.patient.id} ({user.patient.full_name()})")
        query = query.filter_by(patient_id=user.patient.id)
    
    # ✅ DOCTOR: only their own appointments
    elif user.role == 'doctor':
        if not user.doctor:
            print(f"❌ Doctor {user.username} has no doctor profile — returning empty")
            return jsonify([]), 200
        print(f"   → Filtering by doctor_id={user.doctor.id} ({user.doctor.full_name()})")
        query = query.filter_by(doctor_id=user.doctor.id)
    
    # ✅ ADMIN/RECEPTIONIST: all appointments (with optional filters)
    else:
        patient_id = request.args.get('patient_id')
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        
        doctor_id = request.args.get('doctor_id')
        if doctor_id:
            query = query.filter_by(doctor_id=doctor_id)
    
    # Optional status filter (all roles)
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    # Optional date range
    start_date = request.args.get('start_date')
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Appointment.appointment_date >= start)
        except ValueError:
            pass
    
    end_date = request.args.get('end_date')
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Appointment.appointment_date <= end)
        except ValueError:
            pass
    
    appointments = query.order_by(Appointment.appointment_date.desc()).all()
    print(f"   → Found {len(appointments)} appointments")
    
    return jsonify([apt.to_dict() for apt in appointments]), 200


# ============================================================
# GET SINGLE APPOINTMENT
# ============================================================
@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """Get a specific appointment"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Access control
    if user.role == 'patient' and (not user.patient or user.patient.id != appointment.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    if user.role == 'doctor' and (not user.doctor or user.doctor.id != appointment.doctor_id):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(appointment.to_dict()), 200


# ============================================================
# CREATE APPOINTMENT (auto-creates bill)
# ============================================================
@appointment_bp.route('', methods=['POST'])
@appointment_bp.route('/', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new appointment — auto-creates a bill if doctor has a fee"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json() or {}
    
    # Required fields
    required_fields = ['patient_id', 'doctor_id', 'appointment_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate patient
    patient = db.session.get(Patient, data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Validate doctor
    doctor = db.session.get(Doctor, data['doctor_id'])
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    if not doctor.is_available:
        return jsonify({'error': 'Doctor is not available'}), 400
    
    # Parse date
    try:
        if isinstance(data['appointment_date'], str):
            try:
                appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
            except ValueError:
                appointment_date = datetime.fromisoformat(data['appointment_date'].split('.')[0])
        else:
            appointment_date = data['appointment_date']
        
        if appointment_date.tzinfo is None:
            appointment_date = appointment_date.replace(tzinfo=pytz.UTC)
    except Exception as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    
    # Must be in the future
    now = datetime.now(pytz.UTC)
    if appointment_date <= now:
        return jsonify({'error': 'Appointment must be in the future'}), 400
    
    # Conflict check
    existing = Appointment.query.filter_by(
        doctor_id=data['doctor_id'],
        status='scheduled'
    ).filter(Appointment.appointment_date == appointment_date).first()
    
    if existing:
        return jsonify({'error': 'Doctor already has an appointment at this time'}), 400
    
    try:
        # Create appointment
        appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            type=data.get('type', 'regular'),
            reason=data.get('reason', ''),
            notes=data.get('notes', ''),
            created_by=user.id,
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.flush()  # Get appointment.id
        
        # ✅ AUTO-CREATE BILL based on doctor's consultation fee
        consultation_fee = float(doctor.consultation_fee or 0)
        if consultation_fee > 0:
            bill_number = f"BILL-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            bill = Bill(
                patient_id=data['patient_id'],
                appointment_id=appointment.id,
                bill_number=bill_number,
                total_amount=consultation_fee,
                paid_amount=0.0,
                balance=consultation_fee,
                status='pending',
                description=f'Consultation with {doctor.full_name()} - {appointment_date.strftime("%Y-%m-%d")}',
                items=[
                    {'name': f'Consultation Fee - {doctor.full_name()}', 'amount': consultation_fee}
                ],
                created_by=user.id
            )
            db.session.add(bill)
            print(f"✅ Auto-created bill {bill_number} for {patient.full_name()}: ${consultation_fee}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating appointment: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================
# UPDATE APPOINTMENT
# ============================================================
@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update appointment (change status, reschedule, etc.)"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Access control
    if user.role == 'patient' and (not user.patient or user.patient.id != appointment.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    if user.role == 'doctor' and (not user.doctor or user.doctor.id != appointment.doctor_id):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    
    # Update appointment_date
    if 'appointment_date' in data:
        try:
            if isinstance(data['appointment_date'], str):
                try:
                    new_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
                except ValueError:
                    new_date = datetime.fromisoformat(data['appointment_date'].split('.')[0])
            else:
                new_date = data['appointment_date']
            
            if new_date.tzinfo is None:
                new_date = new_date.replace(tzinfo=pytz.UTC)
            
            now = datetime.now(pytz.UTC)
            if new_date <= now:
                return jsonify({'error': 'Appointment must be in the future'}), 400
            
            appointment.appointment_date = new_date
        except Exception as e:
            return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    
    # Update status
    if 'status' in data:
        valid_statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        appointment.status = data['status']
    
    # Update other fields
    if 'type' in data:
        appointment.type = data['type']
    if 'reason' in data:
        appointment.reason = data['reason']
    if 'notes' in data:
        appointment.notes = data['notes']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# CANCEL/DELETE APPOINTMENT (soft delete)
# ============================================================
@appointment_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    """Cancel an appointment (soft delete)"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Access control
    if user.role == 'patient' and (not user.patient or user.patient.id != appointment.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    if user.role == 'doctor' and (not user.doctor or user.doctor.id != appointment.doctor_id):
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        appointment.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': 'Appointment cancelled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# APPOINTMENT STATISTICS
# ============================================================
@appointment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_appointment_stats():
    """Get appointment statistics based on user role"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    query = Appointment.query
    
    if user.role == 'patient':
        if not user.patient:
            return jsonify({
                'total': 0, 'scheduled': 0, 'confirmed': 0,
                'completed': 0, 'cancelled': 0, 'no_show': 0, 'today': 0
            }), 200
        query = query.filter_by(patient_id=user.patient.id)
    elif user.role == 'doctor':
        if not user.doctor:
            return jsonify({
                'total': 0, 'scheduled': 0, 'confirmed': 0,
                'completed': 0, 'cancelled': 0, 'no_show': 0, 'today': 0
            }), 200
        query = query.filter_by(doctor_id=user.doctor.id)
    
    total = query.count()
    scheduled = query.filter_by(status='scheduled').count()
    confirmed = query.filter_by(status='confirmed').count()
    completed = query.filter_by(status='completed').count()
    cancelled = query.filter_by(status='cancelled').count()
    no_show = query.filter_by(status='no-show').count()
    
    # Today's appointments
    today = datetime.now(pytz.UTC).date()
    today_start = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=pytz.UTC)
    today_end = today_start + timedelta(days=1)
    
    today_count = query.filter(
        Appointment.appointment_date >= today_start,
        Appointment.appointment_date < today_end
    ).count()
    
    return jsonify({
        'total': total,
        'scheduled': scheduled,
        'confirmed': confirmed,
        'completed': completed,
        'cancelled': cancelled,
        'no_show': no_show,
        'today': today_count
    }), 200


# ============================================================
# CHECK DOCTOR AVAILABILITY
# ============================================================
@appointment_bp.route('/check-availability/<int:doctor_id>', methods=['GET'])
def check_availability(doctor_id):
    """Check doctor availability for a specific date"""
    date_str = request.args.get('date')
    
    if not date_str:
        return jsonify({'error': 'Date parameter required (YYYY-MM-DD)'}), 400
    
    try:
        date = datetime.fromisoformat(date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Get booked slots for that day
    start = datetime(date.year, date.month, date.day, 0, 0, 0)
    end = datetime(date.year, date.month, date.day, 23, 59, 59)
    
    appointments = Appointment.query.filter_by(
        doctor_id=doctor_id,
        status='scheduled'
    ).filter(
        Appointment.appointment_date >= start,
        Appointment.appointment_date <= end
    ).all()
    
    booked_slots = [apt.appointment_date.strftime('%H:%M') for apt in appointments]
    
    return jsonify({
        'doctor_id': doctor_id,
        'date': date_str,
        'booked_slots': booked_slots,
        'available': len(booked_slots) < 8  # Max 8 appointments/day
    }), 200