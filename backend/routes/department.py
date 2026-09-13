from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.department import Department
from utils.auth import admin_required

department_bp = Blueprint('department', __name__)

@department_bp.route('', methods=['GET'])
@department_bp.route('/', methods=['GET'])
def get_departments():
    departments = Department.query.filter_by(is_active=True).all()
    return jsonify([dept.to_dict() for dept in departments]), 200

@department_bp.route('/<int:dept_id>', methods=['GET'])
def get_department(dept_id):
    dept = db.session.get(Department, dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    return jsonify(dept.to_dict()), 200

@department_bp.route('', methods=['POST'])
@department_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_department():
    data = request.get_json()
    
    if 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    if Department.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Department already exists'}), 400
    
    dept = Department(
        name=data['name'],
        description=data.get('description'),
        head_of_department=data.get('head_of_department'),
        location=data.get('location'),
        phone=data.get('phone'),
        email=data.get('email'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(dept)
    db.session.commit()
    
    return jsonify({'message': 'Department created successfully', 'department': dept.to_dict()}), 201

@department_bp.route('/<int:dept_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_department(dept_id):
    dept = db.session.get(Department, dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    
    data = request.get_json()
    
    dept.name = data.get('name', dept.name)
    dept.description = data.get('description', dept.description)
    dept.head_of_department = data.get('head_of_department', dept.head_of_department)
    dept.location = data.get('location', dept.location)
    dept.phone = data.get('phone', dept.phone)
    dept.email = data.get('email', dept.email)
    dept.is_active = data.get('is_active', dept.is_active)
    
    db.session.commit()
    
    return jsonify({'message': 'Department updated successfully', 'department': dept.to_dict()}), 200

@department_bp.route('/<int:dept_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_department(dept_id):
    dept = db.session.get(Department, dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    
    dept.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Department deleted successfully'}), 200
