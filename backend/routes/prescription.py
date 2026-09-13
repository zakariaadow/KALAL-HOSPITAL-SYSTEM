from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.prescription import Prescription
from models.patient import Patient
from models.user import User
from utils.auth import doctor_required

prescription_bp = Blueprint('prescription', __name__)

@prescription_bp.route('/', methods=['GET'])
@jwt_required()
def get_prescriptions():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    query = Prescription.query
    
    if user.role == 'patient' and user.patient:
        query = query.filter_by(patient_id=user.patient.id)
    elif user.role == 'doctor' and user.doctor:
        query = query.filter_by(doctor_id=user.doctor.id)
    
    patient_id = request.args.get('patient_id')
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    prescriptions = query.order_by(Prescription.prescribed_date.desc()).all()
    return jsonify([prescription.to_dict() for prescription in prescriptions]), 200

@prescription_bp.route('/<int:prescription_id>', methods=['GET'])
@jwt_required()
def get_prescription(prescription_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    prescription = db.session.get(Prescription, prescription_id)
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404
    
    if user.role == 'patient' and (not user.patient or user.patient.id != prescription.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(prescription.to_dict()), 200

@prescription_bp.route('/', methods=['POST'])
@jwt_required()
@doctor_required
def create_prescription():
    data = request.get_json()
    
    required_fields = ['patient_id', 'medication', 'dosage', 'frequency']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    patient = db.session.get(Patient, data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    doctor = user.doctor
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    prescription = Prescription(
        patient_id=data['patient_id'],
        doctor_id=doctor.id,
        medical_record_id=data.get('medical_record_id'),
        medication=data['medication'],
        dosage=data['dosage'],
        frequency=data['frequency'],
        duration=data.get('duration'),
        instructions=data.get('instructions'),
        quantity=data.get('quantity'),
        refills=data.get('refills', 0)
    )
    
    db.session.add(prescription)
    db.session.commit()
    
    return jsonify({'message': 'Prescription created successfully', 'prescription': prescription.to_dict()}), 201

@prescription_bp.route('/<int:prescription_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_prescription(prescription_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    prescription = db.session.get(Prescription, prescription_id)
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404
    
    if not user.doctor or user.doctor.id != prescription.doctor_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    prescription.medication = data.get('medication', prescription.medication)
    prescription.dosage = data.get('dosage', prescription.dosage)
    prescription.frequency = data.get('frequency', prescription.frequency)
    prescription.duration = data.get('duration', prescription.duration)
    prescription.instructions = data.get('instructions', prescription.instructions)
    prescription.quantity = data.get('quantity', prescription.quantity)
    prescription.status = data.get('status', prescription.status)
    prescription.refills = data.get('refills', prescription.refills)
    
    db.session.commit()
    
    return jsonify({'message': 'Prescription updated successfully', 'prescription': prescription.to_dict()}), 200

@prescription_bp.route('/<int:prescription_id>', methods=['DELETE'])
@jwt_required()
@doctor_required
def delete_prescription(prescription_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    prescription = db.session.get(Prescription, prescription_id)
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404
    
    if not user.doctor or user.doctor.id != prescription.doctor_id:
        return jsonify({'error': 'Access denied'}), 403
    
    prescription.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'message': 'Prescription cancelled successfully'}), 200