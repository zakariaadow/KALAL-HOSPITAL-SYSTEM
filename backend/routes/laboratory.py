from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.laboratory import LabTest
from models.patient import Patient
from models.user import User
from utils.auth import doctor_required
from utils.helpers import save_uploaded_file

laboratory_bp = Blueprint('laboratory', __name__)

@laboratory_bp.route('/', methods=['GET'])
@jwt_required()
def get_lab_tests():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    query = LabTest.query
    
    if user.role == 'patient' and user.patient:
        query = query.filter_by(patient_id=user.patient.id)
    
    patient_id = request.args.get('patient_id')
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    tests = query.order_by(LabTest.request_date.desc()).all()
    return jsonify([test.to_dict() for test in tests]), 200

@laboratory_bp.route('/<int:test_id>', methods=['GET'])
@jwt_required()
def get_lab_test(test_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    test = db.session.get(LabTest, test_id)
    if not test:
        return jsonify({'error': 'Lab test not found'}), 404
    
    if user.role == 'patient' and (not user.patient or user.patient.id != test.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(test.to_dict()), 200

@laboratory_bp.route('/', methods=['POST'])
@jwt_required()
@doctor_required
def create_lab_test():
    data = request.get_json()
    
    required_fields = ['patient_id', 'test_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    patient = db.session.get(Patient, data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    user_id = get_jwt_identity()
    
    test = LabTest(
        patient_id=data['patient_id'],
        test_name=data['test_name'],
        test_type=data.get('test_type'),
        requested_by=user_id,
        notes=data.get('notes')
    )
    
    db.session.add(test)
    db.session.commit()
    
    return jsonify({'message': 'Lab test created successfully', 'test': test.to_dict()}), 201

@laboratory_bp.route('/<int:test_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_lab_test(test_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    test = db.session.get(LabTest, test_id)
    if not test:
        return jsonify({'error': 'Lab test not found'}), 404
    
    data = request.get_json()
    
    test.test_name = data.get('test_name', test.test_name)
    test.test_type = data.get('test_type', test.test_type)
    test.status = data.get('status', test.status)
    test.results = data.get('results', test.results)
    test.performed_by = data.get('performed_by', test.performed_by)
    test.notes = data.get('notes', test.notes)
    
    if data.get('status') == 'completed':
        test.result_date = data.get('result_date')
    
    db.session.commit()
    
    return jsonify({'message': 'Lab test updated successfully', 'test': test.to_dict()}), 200

@laboratory_bp.route('/<int:test_id>/upload', methods=['POST'])
@jwt_required()
@doctor_required
def upload_lab_report(test_id):
    test = db.session.get(LabTest, test_id)
    if not test:
        return jsonify({'error': 'Lab test not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    file_path = save_uploaded_file(file, 'lab_reports')
    if not file_path:
        return jsonify({'error': 'Invalid file type'}), 400
    
    test.report_file = file_path
    db.session.commit()
    
    return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200