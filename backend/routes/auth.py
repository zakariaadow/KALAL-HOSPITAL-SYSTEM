from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from database import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from utils.validators import validate_email, validate_password
from utils.auth import admin_required
from datetime import datetime
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register-request', methods=['POST'])
def register_request():
    """Request registration - Patients auto-approved, others need approval"""
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    try:
        # Patients are auto-approved, others need admin approval
        is_patient = data['role'] == 'patient'
        
        user = User(
            username=data['username'],
            email=data['email'],
            role=data['role'],
            is_active=True,
            is_approved=is_patient
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()
        
        # Create profile based on role
        if data['role'] == 'patient':
            patient = Patient(
                user_id=user.id,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                date_of_birth=data.get('date_of_birth'),
                gender=data.get('gender', ''),
                phone=data.get('phone'),
                address=data.get('address')
            )
            db.session.add(patient)
        elif data['role'] == 'doctor':
            license_number = f"DOC-{uuid.uuid4().hex[:8].upper()}"
            doctor = Doctor(
                user_id=user.id,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                specialization=data.get('specialization', 'General Medicine'),
                license_number=license_number,
                phone=data.get('phone'),
                email=data['email']
            )
            db.session.add(doctor)
        elif data['role'] == 'receptionist':
            pass
        
        db.session.commit()
        
        if is_patient:
            message = 'Registration successful! You can now login.'
        else:
            message = 'Registration request submitted. Waiting for admin approval.'
        
        return jsonify({
            'message': message,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Original register endpoint - kept for backwards compatibility"""
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            role=data['role'],
            is_active=True,
            is_approved=True
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()
        
        if data['role'] == 'patient':
            patient = Patient(
                user_id=user.id,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                date_of_birth=data.get('date_of_birth'),
                gender=data.get('gender', ''),
                phone=data.get('phone'),
                address=data.get('address')
            )
            db.session.add(patient)
        elif data['role'] == 'doctor':
            license_number = f"DOC-{uuid.uuid4().hex[:8].upper()}"
            doctor = Doctor(
                user_id=user.id,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                specialization=data.get('specialization', 'General Medicine'),
                license_number=license_number,
                phone=data.get('phone'),
                email=data['email']
            )
            db.session.add(doctor)
        
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Check if user is approved (except for admin)
    if user.role != 'admin' and not user.is_approved:
        return jsonify({'error': 'Account pending admin approval. Please wait.'}), 403
    
    tokens = user.get_tokens()
    
    return jsonify({
        'message': 'Login successful',
        'tokens': tokens,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    access_token = create_access_token(identity=str(user_id))
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    if user.role == 'patient' and user.patient:
        user_data['patient'] = user.patient.to_dict()
        user_data['patient_id'] = user.patient.id
    elif user.role == 'doctor' and user.doctor:
        user_data['doctor'] = user.doctor.to_dict()
        user_data['doctor_id'] = user.doctor.id
    
    return jsonify(user_data), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old and new passwords are required'}), 400
    
    if not user.check_password(data['old_password']):
        return jsonify({'error': 'Invalid old password'}), 401
    
    if not validate_password(data['new_password']):
        return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# ============================================================
# ADMIN APPROVAL ENDPOINTS (MISSING - ADD THESE)
# ============================================================

@auth_bp.route('/pending-approvals', methods=['GET'])
@jwt_required()
def get_pending_approvals():
    """Get all pending user approvals - Admin only"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    pending_users = User.query.filter_by(is_approved=False).all()
    return jsonify([u.to_dict() for u in pending_users]), 200

@auth_bp.route('/approve-user/<int:user_id>', methods=['PUT'])
@jwt_required()
def approve_user(user_id):
    """Approve or deny a user - Admin only"""
    admin_id = get_jwt_identity()
    admin = db.session.get(User, int(admin_id))
    
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404
    
    if admin.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_approved:
        return jsonify({'error': 'User already approved'}), 400
    
    data = request.get_json()
    action = data.get('action')
    
    if action == 'approve':
        user.is_approved = True
        user.is_active = True
        user.approved_by = admin.id
        user.approved_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
            'message': 'User approved successfully',
            'user': user.to_dict()
        }), 200
    elif action == 'deny':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User request denied and removed'}), 200
    else:
        return jsonify({'error': 'Invalid action. Use "approve" or "deny"'}), 400

@auth_bp.route('/pending-count', methods=['GET'])
@jwt_required()
def get_pending_count():
    """Get count of pending approvals - Admin only"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    count = User.query.filter_by(is_approved=False).count()
    return jsonify({'pending_count': count}), 200