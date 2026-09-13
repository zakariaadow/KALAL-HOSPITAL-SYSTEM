import re
from datetime import datetime

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    pattern = r'^\+?[\d\s-()]{10,15}$'
    return re.match(pattern, phone) is not None

def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def validate_date(date_str, format='%Y-%m-%d'):
    try:
        datetime.strptime(date_str, format)
        return True
    except ValueError:
        return False

def validate_required_fields(data, required_fields):
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    return missing_fields