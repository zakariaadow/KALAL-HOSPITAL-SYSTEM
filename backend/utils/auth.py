from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User
from database import db

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def doctor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role not in ['admin', 'doctor']:
            return jsonify({'error': 'Doctor privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id))