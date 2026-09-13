from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.billing import Bill
from models.patient import Patient
from models.user import User
from datetime import datetime
import uuid

billing_bp = Blueprint('billing', __name__)

@billing_bp.route('', methods=['GET'])
@billing_bp.route('/', methods=['GET'])
@jwt_required()
def get_bills():
    """Get all bills - Filter by user role"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    query = Bill.query
    
    # If patient, only show their bills
    if user.role == 'patient' and user.patient:
        query = query.filter_by(patient_id=user.patient.id)
    
    # Filter by patient_id if provided
    patient_id = request.args.get('patient_id')
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    # Filter by status if provided
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    bills = query.order_by(Bill.issue_date.desc()).all()
    return jsonify([bill.to_dict() for bill in bills]), 200


@billing_bp.route('/<int:bill_id>', methods=['GET'])
@jwt_required()
def get_bill(bill_id):
    """Get a specific bill"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    bill = db.session.get(Bill, bill_id)
    if not bill:
        return jsonify({'error': 'Bill not found'}), 404
    
    # Check access rights
    if user.role == 'patient' and (not user.patient or user.patient.id != bill.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(bill.to_dict()), 200


@billing_bp.route('', methods=['POST'])
@billing_bp.route('/', methods=['POST'])
@jwt_required()
def create_bill():
    """Create a new bill - Admin and Receptionist can create"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    # Allow admin and receptionist to create bills
    if user.role not in ['admin', 'receptionist']:
        return jsonify({'error': 'Admin or Receptionist privileges required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['patient_id', 'total_amount']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check patient exists
    patient = db.session.get(Patient, data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Validate total_amount
    try:
        total_amount = float(data['total_amount'])
        if total_amount <= 0:
            return jsonify({'error': 'Total amount must be greater than 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid total amount format'}), 400
    
    # Generate bill number
    bill_number = f"BILL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    
    # Create bill
    bill = Bill(
        patient_id=data['patient_id'],
        bill_number=bill_number,
        total_amount=total_amount,
        paid_amount=0.0,
        balance=total_amount,
        description=data.get('description', ''),
        items=data.get('items', []),
        status='pending',
        created_by=user.id
    )
    
    db.session.add(bill)
    db.session.commit()
    
    return jsonify({
        'message': 'Bill created successfully',
        'bill': bill.to_dict()
    }), 201


@billing_bp.route('/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_bill(bill_id):
    """Update a bill - Admin and Receptionist can update"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    # Allow admin and receptionist to update bills
    if user.role not in ['admin', 'receptionist']:
        return jsonify({'error': 'Admin or Receptionist privileges required'}), 403
    
    bill = db.session.get(Bill, bill_id)
    if not bill:
        return jsonify({'error': 'Bill not found'}), 404
    
    data = request.get_json()
    
    # Update total_amount
    if 'total_amount' in data:
        try:
            total_amount = float(data['total_amount'])
            if total_amount <= 0:
                return jsonify({'error': 'Total amount must be greater than 0'}), 400
            bill.total_amount = total_amount
            bill.balance = bill.total_amount - bill.paid_amount
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid total amount format'}), 400
    
    # Update paid_amount
    if 'paid_amount' in data:
        try:
            paid_amount = float(data['paid_amount'])
            if paid_amount < 0:
                return jsonify({'error': 'Paid amount cannot be negative'}), 400
            if paid_amount > bill.total_amount:
                return jsonify({'error': 'Paid amount cannot exceed total amount'}), 400
            bill.paid_amount = paid_amount
            bill.balance = bill.total_amount - bill.paid_amount
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid paid amount format'}), 400
    
    # Update description
    if 'description' in data:
        bill.description = data['description']
    
    # Update items
    if 'items' in data:
        bill.items = data['items']
    
    # Update status
    if 'status' in data:
        if data['status'] in ['pending', 'paid', 'partially_paid', 'cancelled']:
            bill.status = data['status']
        else:
            return jsonify({'error': 'Invalid status'}), 400
    
    # Update payment method
    if 'payment_method' in data:
        bill.payment_method = data['payment_method']
    
    # Update payment date
    if 'payment_date' in data:
        try:
            bill.payment_date = data['payment_date']
        except:
            return jsonify({'error': 'Invalid payment date format'}), 400
    
    # Auto-calculate status if not manually set
    if 'status' not in data:
        if bill.balance <= 0:
            bill.status = 'paid'
        elif bill.paid_amount > 0:
            bill.status = 'partially_paid'
        else:
            bill.status = 'pending'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Bill updated successfully',
        'bill': bill.to_dict()
    }), 200


@billing_bp.route('/<int:bill_id>/pay', methods=['POST'])
@jwt_required()
def pay_bill(bill_id):
    """Process payment for a bill - Admin, Receptionist, or Patient can pay"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    bill = db.session.get(Bill, bill_id)
    if not bill:
        return jsonify({'error': 'Bill not found'}), 404
    
    # Check access rights
    if user.role == 'patient' and (not user.patient or user.patient.id != bill.patient_id):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or 'amount' not in data:
        return jsonify({'error': 'Payment amount is required'}), 400
    
    try:
        amount = float(data.get('amount', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid payment amount format'}), 400
    
    payment_method = data.get('payment_method', 'cash')
    
    # Calculate remaining balance
    remaining_balance = bill.total_amount - bill.paid_amount
    
    if amount <= 0:
        return jsonify({'error': 'Payment amount must be greater than 0'}), 400
    
    if amount > remaining_balance:
        return jsonify({'error': f'Payment amount exceeds remaining balance of ${remaining_balance:.2f}'}), 400
    
    # Update bill
    bill.paid_amount += amount
    bill.balance = bill.total_amount - bill.paid_amount
    
    if bill.balance <= 0:
        bill.status = 'paid'
    elif bill.paid_amount > 0:
        bill.status = 'partially_paid'
    else:
        bill.status = 'pending'
    
    bill.payment_method = payment_method
    bill.payment_date = datetime.now()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Payment processed successfully',
        'bill': bill.to_dict()
    }), 200


@billing_bp.route('/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_bill(bill_id):
    """Delete a bill - Admin only"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    # Only admin can delete bills
    if user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    bill = db.session.get(Bill, bill_id)
    if not bill:
        return jsonify({'error': 'Bill not found'}), 404
    
    db.session.delete(bill)
    db.session.commit()
    
    return jsonify({'message': 'Bill deleted successfully'}), 200


@billing_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_billing_stats():
    """Get billing statistics"""
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    query = Bill.query
    
    # If patient, only their bills
    if user.role == 'patient' and user.patient:
        query = query.filter_by(patient_id=user.patient.id)
    
    total_bills = query.count()
    total_revenue = db.session.query(db.func.sum(Bill.total_amount)).filter_by(status='paid').scalar() or 0
    pending_amount = db.session.query(db.func.sum(Bill.total_amount)).filter_by(status='pending').scalar() or 0
    partially_paid = db.session.query(db.func.sum(Bill.total_amount)).filter_by(status='partially_paid').scalar() or 0
    total_paid = db.session.query(db.func.sum(Bill.paid_amount)).filter_by(status='paid').scalar() or 0
    
    return jsonify({
        'total_bills': total_bills,
        'total_revenue': float(total_revenue),
        'pending_amount': float(pending_amount),
        'partially_paid': float(partially_paid),
        'total_paid': float(total_paid),
        'paid_bills': Bill.query.filter_by(status='paid').count(),
        'pending_bills': Bill.query.filter_by(status='pending').count(),
        'partially_paid_bills': Bill.query.filter_by(status='partially_paid').count(),
    }), 200