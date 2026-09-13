#!/usr/bin/env python3
"""
KALAL Hospital System - Default Users Setup Script
This script creates default admin user and department
"""
from app import create_app
from database import db
from models.user import User
from models.department import Department
from models.patient import Patient
from models.doctor import Doctor
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def create_default_users():
    """Create default users and departments for the system"""
    app = create_app()
    
    with app.app_context():
        print("=" * 70)
        print("  🏥 KALAL Hospital System - Default Users Setup")
        print("=" * 70)
        
        # ============================================================
        # 1. CREATE ADMIN USER
        # ============================================================
        print("\n📝 Creating Admin User...")
        
        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@kalalhospital.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
        
        admin = User.query.filter_by(username=admin_username).first()
        if not admin:
            admin = User(
                username=admin_username,
                email=admin_email,
                role='admin',
                is_active=True,
                is_approved=True  # Admin is auto-approved
            )
            admin.set_password(admin_password)
            db.session.add(admin)
            db.session.flush()
            print(f"  ✅ Admin user created")
            print(f"     Username: {admin_username}")
            print(f"     Email: {admin_email}")
            print(f"     Password: {admin_password}")
        else:
            print(f"  ℹ️ Admin user already exists: {admin.username}")
        
        # ============================================================
        # 2. CREATE DEFAULT DEPARTMENT
        # ============================================================
        print("\n📝 Creating Default Department...")
        
        dept = Department.query.filter_by(name='General Medicine').first()
        if not dept:
            dept = Department(
                name='General Medicine',
                description='General medical services for all patients',
                head_of_department=admin_username,
                location='Building A, Floor 1',
                phone='+254 712 345 686',
                email='general@kalalhospital.com',
                is_active=True
            )
            db.session.add(dept)
            db.session.flush()
            print(f"  ✅ Department created: General Medicine")
        else:
            print(f"  ℹ️ Department already exists: {dept.name}")
        
        # ============================================================
        # 3. CREATE SAMPLE DOCTORS (Optional)
        # ============================================================
        print("\n📝 Creating Sample Doctors...")
        
        doctors_data = [
            {
                'first_name': 'Dr. Sarah',
                'last_name': 'Johnson',
                'specialization': 'Cardiology',
                'license_number': 'DOC2024001',
                'consultation_fee': 5000.00,
                'years_of_experience': 10,
                'is_available': True,
                'phone': '+254712345670',
                'email': 'sarah.johnson@kalalhospital.com'
            },
            {
                'first_name': 'Dr. James',
                'last_name': 'Wilson',
                'specialization': 'Orthopedics',
                'license_number': 'DOC2024002',
                'consultation_fee': 6000.00,
                'years_of_experience': 8,
                'is_available': True,
                'phone': '+254712345671',
                'email': 'james.wilson@kalalhospital.com'
            },
            {
                'first_name': 'Dr. Emily',
                'last_name': 'Brown',
                'specialization': 'Neurology',
                'license_number': 'DOC2024003',
                'consultation_fee': 5500.00,
                'years_of_experience': 12,
                'is_available': True,
                'phone': '+254712345672',
                'email': 'emily.brown@kalalhospital.com'
            }
        ]
        
        doctor_count = 0
        for data in doctors_data:
            existing = Doctor.query.filter_by(license_number=data['license_number']).first()
            if not existing:
                doctor = Doctor(
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    specialization=data['specialization'],
                    license_number=data['license_number'],
                    consultation_fee=data['consultation_fee'],
                    years_of_experience=data['years_of_experience'],
                    is_available=data['is_available'],
                    phone=data['phone'],
                    email=data['email']
                )
                db.session.add(doctor)
                doctor_count += 1
        
        if doctor_count > 0:
            db.session.flush()
            print(f"  ✅ {doctor_count} sample doctors created")
        else:
            print(f"  ℹ️ Sample doctors already exist")
        
        # ============================================================
        # 4. CREATE SAMPLE PATIENTS (Optional)
        # ============================================================
        print("\n📝 Creating Sample Patients...")
        
        patients_data = [
            {
                'first_name': 'John',
                'last_name': 'Doe',
                'date_of_birth': '1985-06-15',
                'gender': 'Male',
                'phone': '+254712345678',
                'address': '123 Nairobi Street',
                'blood_type': 'A+',
                'allergies': 'None'
            },
            {
                'first_name': 'Jane',
                'last_name': 'Smith',
                'date_of_birth': '1990-03-20',
                'gender': 'Female',
                'phone': '+254712345679',
                'address': '456 Mombasa Road',
                'blood_type': 'O-',
                'allergies': 'Penicillin'
            },
            {
                'first_name': 'Michael',
                'last_name': 'Johnson',
                'date_of_birth': '1978-11-10',
                'gender': 'Male',
                'phone': '+254712345680',
                'address': '789 Kisumu Road',
                'blood_type': 'B+',
                'allergies': 'None'
            }
        ]
        
        patient_count = 0
        for data in patients_data:
            existing = Patient.query.filter_by(
                first_name=data['first_name'],
                last_name=data['last_name']
            ).first()
            if not existing:
                patient = Patient(
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    date_of_birth=data['date_of_birth'],
                    gender=data['gender'],
                    phone=data['phone'],
                    address=data['address'],
                    blood_type=data['blood_type'],
                    allergies=data['allergies']
                )
                db.session.add(patient)
                patient_count += 1
        
        if patient_count > 0:
            db.session.flush()
            print(f"  ✅ {patient_count} sample patients created")
        else:
            print(f"  ℹ️ Sample patients already exist")
        
        # ============================================================
        # 5. COMMIT ALL CHANGES
        # ============================================================
        db.session.commit()
        
        # ============================================================
        # 6. DISPLAY SUMMARY
        # ============================================================
        print("\n" + "=" * 70)
        print("  ✅ Setup Complete!")
        print("=" * 70)
        
        # Show users
        print("\n👤 Users:")
        users = User.query.all()
        for u in users:
            approved_status = "✅ Approved" if u.is_approved else "⏳ Pending"
            active_status = "🟢 Active" if u.is_active else "🔴 Inactive"
            print(f"  - {u.username} ({u.role}) - {approved_status} - {active_status}")
        
        # Show departments
        print("\n🏥 Departments:")
        depts = Department.query.all()
        for d in depts:
            status = "🟢 Active" if d.is_active else "🔴 Inactive"
            print(f"  - {d.name} - {status}")
        
        # Show doctors
        print("\n👨‍⚕️ Doctors:")
        docs = Doctor.query.all()
        for d in docs:
            status = "🟢 Available" if d.is_available else "🔴 Unavailable"
            print(f"  - {d.full_name()} - {d.specialization} - {status}")
        
        # Show patients
        print("\n👤 Patients:")
        pats = Patient.query.all()
        for p in pats[:5]:  # Show first 5 patients
            print(f"  - {p.full_name()} - {p.gender} - {p.blood_type}")
        if len(pats) > 5:
            print(f"  ... and {len(pats) - 5} more patients")
        
        # Login credentials
        print("\n" + "=" * 70)
        print("  🔐 Login Credentials")
        print("=" * 70)
        print("\n📋 Admin Credentials:")
        print(f"  Username: {admin_username}")
        print(f"  Password: {admin_password}")
        print(f"  Email: {admin_email}")
        print("\n" + "=" * 70)
        print("  ⚠️  Please change passwords in production!")
        print("=" * 70)

if __name__ == '__main__':
    try:
        create_default_users()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()