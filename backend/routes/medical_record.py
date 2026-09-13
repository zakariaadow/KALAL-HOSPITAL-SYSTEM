from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.medical_record import MedicalRecord
from models.patient import Patient
from models.user import User
from utils.auth import doctor_required

medical_record_bp = Blueprint('medical_record', __name__)

@medical_record_bp.route('', methods=['GET'])
@medical_record_bp.route('/', methods=['GET'])
@jwt_required()
def get_medical_records():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    query = MedicalRecord.query
    
    if user.role == 'patient' and user.patient:
        query = query.filter_by(patient_id=user.patient.id)
    elif user.role == 'doctor' and user.doctor:
        query = query.filter_by(doctor_id=user.doctor.id)
    
    patient_id = request.args.get('patient_id')
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    doctor_id = request.args.get('doctor_id')
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)
    
    records = query.order_by(MedicalRecord.visit_date.desc()).all()
    return jsonify([record.to_dict() for record in records]), 200

@medical_record_bp.route('/<int:record_id>', methods=['GET'])
@jwt_required()
def get_medical_record(record_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    record = db.session.get(MedicalRecord, record_id)
    if not record:
        return jsonify({'error': 'Medical record not found'}), 404
    
    if user.role == 'patient' and (not user.patient or user.patient.id != record.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(record.to_dict()), 200

@medical_record_bp.route('', methods=['POST'])
@medical_record_bp.route('/', methods=['POST'])
@jwt_required()
@doctor_required
def create_medical_record():
    data = request.get_json()
    
    required_fields = ['patient_id', 'diagnosis']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    patient = db.session.get(Patient, data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    doctor = user.doctor
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    record = MedicalRecord(
        patient_id=data['patient_id'],
        doctor_id=doctor.id,
        diagnosis=data['diagnosis'],
        symptoms=data.get('symptoms'),
        treatment=data.get('treatment'),
        notes=data.get('notes'),
        is_emergency=data.get('is_emergency', False)
    )
    
    db.session.add(record)
    db.session.commit()
    
    return jsonify({'message': 'Medical record created successfully', 'record': record.to_dict()}), 201

@medical_record_bp.route('/<int:record_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_medical_record(record_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    record = db.session.get(MedicalRecord, record_id)
    if not record:
        return jsonify({'error': 'Medical record not found'}), 404
    
    if not user.doctor or user.doctor.id != record.doctor_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    record.diagnosis = data.get('diagnosis', record.diagnosis)
    record.symptoms = data.get('symptoms', record.symptoms)
    record.treatment = data.get('treatment', record.treatment)
    record.notes = data.get('notes', record.notes)
    record.is_emergency = data.get('is_emergency', record.is_emergency)
    
    db.session.commit()
    
    return jsonify({'message': 'Medical record updated successfully', 'record': record.to_dict()}), 200

@medical_record_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
@doctor_required
def delete_medical_record(record_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    record = db.session.get(MedicalRecord, record_id)
    if not record:
        return jsonify({'error': 'Medical record not found'}), 404
    
    if not user.doctor or user.doctor.id != record.doctor_id:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(record)
    db.session.commit()
    
    return jsonify({'message': 'Medical record deleted successfully'}), 200
