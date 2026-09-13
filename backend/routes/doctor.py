from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.doctor import Doctor
from models.user import User
from models.department import Department
from utils.auth import admin_required
import uuid

doctor_bp = Blueprint('doctor', __name__)


@doctor_bp.route('', methods=['GET'])
@doctor_bp.route('/', methods=['GET'])
def get_doctors():
    """Get all doctors - Public access"""
    query = Doctor.query.filter_by(is_available=True)
    
    specialization = request.args.get('specialization')
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f'%{specialization}%'))
    
    department_id = request.args.get('department_id')
    if department_id:
        query = query.filter_by(department_id=department_id)
    
    doctors = query.all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200


@doctor_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get a specific doctor - Public access"""
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    return jsonify(doctor.to_dict()), 200


# ============================================================
# HELPER: Clean incoming data (convert '' → None/0)
# ============================================================
def _clean_int(value, default=None):
    """Convert value to int or return default (handles '', None, invalid)"""
    if value is None or value == '':
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def _clean_float(value, default=0.0):
    """Convert value to float or return default (handles '', None, invalid)"""
    if value is None or value == '':
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def _clean_str(value):
    """Strip string or return None if empty"""
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned if cleaned else None


@doctor_bp.route('', methods=['POST'])
@doctor_bp.route('/', methods=['POST'])
@jwt_required()
def create_doctor():
    """Create a new doctor - Admin only"""
    data = request.get_json() or {}
    
    # Check if user is admin
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'specialization']
    for field in required_fields:
        if not data.get(field) or not str(data[field]).strip():
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Handle license number - auto-generate if not provided
    license_number = _clean_str(data.get('license_number'))
    if not license_number:
        license_number = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    
    # Check if license number already exists
    if Doctor.query.filter_by(license_number=license_number).first():
        return jsonify({'error': 'License number already exists'}), 400
    
    # ✅ FIX: Clean department_id (convert '' to None)
    department_id = _clean_int(data.get('department_id'), None)
    if department_id is not None:
        department = db.session.get(Department, department_id)
        if not department:
            return jsonify({'error': 'Department not found'}), 404
    
    try:
        doctor = Doctor(
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            specialization=data['specialization'].strip(),
            license_number=license_number,
            department_id=department_id,                                  # ✅ Cleaned
            phone=_clean_str(data.get('phone')),
            email=_clean_str(data.get('email')),
            consultation_fee=_clean_float(data.get('consultation_fee'), 0.0),  # ✅ Cleaned
            years_of_experience=_clean_int(data.get('years_of_experience'), 0), # ✅ Cleaned
            qualifications=_clean_str(data.get('qualifications')),
            availability=data.get('availability') or {},
            is_available=bool(data.get('is_available', True))
        )
        
        db.session.add(doctor)
        db.session.commit()
        
        return jsonify({
            'message': 'Doctor created successfully',
            'doctor': doctor.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating doctor: {e}")
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    """Update a doctor - Admin, Receptionist, or the doctor themselves"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Allow admin, receptionist, or the doctor themselves
    if user.role not in ['admin', 'receptionist'] and (not user.doctor or user.doctor.id != doctor_id):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    
    try:
        # Update fields
        if 'first_name' in data:
            doctor.first_name = data['first_name'].strip()
        if 'last_name' in data:
            doctor.last_name = data['last_name'].strip()
        if 'specialization' in data:
            doctor.specialization = data['specialization'].strip()
        if 'phone' in data:
            doctor.phone = _clean_str(data['phone'])
        if 'email' in data:
            doctor.email = _clean_str(data['email'])
        if 'qualifications' in data:
            doctor.qualifications = _clean_str(data['qualifications'])
        if 'availability' in data:
            doctor.availability = data['availability'] or {}
        if 'is_available' in data:
            doctor.is_available = bool(data['is_available'])
        
        # ✅ Clean numeric fields
        if 'consultation_fee' in data:
            doctor.consultation_fee = _clean_float(data['consultation_fee'], 0.0)
        if 'years_of_experience' in data:
            doctor.years_of_experience = _clean_int(data['years_of_experience'], 0)
        
        # Update license number (only if provided and not empty)
        if 'license_number' in data:
            license_number = _clean_str(data['license_number'])
            if license_number:
                existing = Doctor.query.filter_by(license_number=license_number).first()
                if existing and existing.id != doctor_id:
                    return jsonify({'error': 'License number already exists'}), 400
                doctor.license_number = license_number
        
        # ✅ Clean department_id
        if 'department_id' in data:
            dept_id = _clean_int(data['department_id'], None)
            if dept_id is not None:
                department = db.session.get(Department, dept_id)
                if not department:
                    return jsonify({'error': 'Department not found'}), 404
            doctor.department_id = dept_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Doctor updated successfully',
            'doctor': doctor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating doctor: {e}")
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/<int:doctor_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doctor_id):
    """Delete a doctor - Admin and Receptionist only"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role not in ['admin', 'receptionist']:
        return jsonify({'error': 'Admin or Receptionist privileges required'}), 403
    
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    try:
        db.session.delete(doctor)
        db.session.commit()
        return jsonify({'message': 'Doctor deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting doctor: {e}")
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/availability/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def toggle_availability(doctor_id):
    """Toggle doctor availability"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Allow admin, receptionist, or the doctor themselves
    if user.role not in ['admin', 'receptionist'] and (not user.doctor or user.doctor.id != doctor_id):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    doctor.is_available = data.get('is_available', not doctor.is_available)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Doctor availability updated successfully',
        'doctor': doctor.to_dict()
    }), 200