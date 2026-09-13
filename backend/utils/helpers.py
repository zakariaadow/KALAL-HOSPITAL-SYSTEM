import os
import uuid
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask import current_app

def generate_unique_filename(original_filename):
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{timestamp}_{unique_id}.{ext}" if ext else f"{timestamp}_{unique_id}"

def allowed_file(filename):
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config['ALLOWED_EXTENSIONS']

def save_uploaded_file(file, subfolder=''):
    if not file or not allowed_file(file.filename):
        return None
    
    filename = secure_filename(generate_unique_filename(file.filename))
    upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    return os.path.join(subfolder, filename)

def get_date_range(days):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def format_currency(amount):
    return f"${amount:.2f}"

def generate_bill_number():
    timestamp = datetime.now().strftime('%Y%m%d')
    unique_id = str(uuid.uuid4())[:6].upper()
    return f"BILL-{timestamp}-{unique_id}"

def calculate_age(date_of_birth):
    if not date_of_birth:
        return None
    today = datetime.now().date()
    age = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    return age