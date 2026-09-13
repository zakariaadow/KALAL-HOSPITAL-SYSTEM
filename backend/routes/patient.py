# routes/patient.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.patient import Patient
from models.user import User
from models.billing import Bill
from utils.auth import admin_required
from datetime import datetime
import uuid

patient_bp = Blueprint('patient', __name__)


@patient_bp.route('', methods=['POST'])
@patient_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_patient():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        user_id = data.get('user_id')
        if user_id:
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            if user.role != 'patient':
                return jsonify({'error': 'User is not a patient'}), 400
            if Patient.query.filter_by(user_id=user_id).first():
                return jsonify({'error': 'Patient profile already exists'}), 400
        
        # Create patient
        patient = Patient(
            user_id=user_id,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            date_of_birth=data.get('date_of_birth'),
            gender=data.get('gender', ''),
            phone=data.get('phone'),
            address=data.get('address'),
            emergency_contact=data.get('emergency_contact'),
            emergency_phone=data.get('emergency_phone'),
            blood_type=data.get('blood_type'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history')
        )
        
        db.session.add(patient)
        db.session.flush()  # Get patient.id
        
        # ✅ AUTO-CREATE CONSULTATION BILL
        bill_number = f"BILL-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        consultation_fee = float(data.get('consultation_fee', 500.00))
        
        bill = Bill(
            patient_id=patient.id,
            bill_number=bill_number,
            total_amount=consultation_fee,
            paid_amount=0.0,
            balance=consultation_fee,
            status='pending',
            description=f'Initial Consultation - {patient.full_name()}',
            items=[
                {'name': 'Consultation Fee', 'amount': consultation_fee},
                {'name': 'Registration', 'amount': 0.0},
            ],
            created_by=int(get_jwt_identity())
        )
        db.session.add(bill)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully with initial bill',
            'patient': patient.to_dict(),
            'bill': bill.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating patient: {e}")
        return jsonify({'error': str(e)}), 500