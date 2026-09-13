#!/usr/bin/env python3
from app import create_app
from database import db
from models.user import User
from models.department import Department
import os
from dotenv import load_dotenv

load_dotenv()

def create_default_users():
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("  KALAL Hospital System - Default Users Setup")
        print("=" * 60)
        
        # Create Admin
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@kalalhospital.com',
                role='admin',
                is_active=True
            )
            admin.set_password('Admin@123')
            db.session.add(admin)
            print("✓ Admin user created")
        else:
            print("✓ Admin user already exists")
        
        # Create Receptionist from .env
        rec_username = os.environ.get('RECEPTIONIST_USERNAME', 'receptionist')
        rec_email = os.environ.get('RECEPTIONIST_EMAIL', 'receptionist@kalalhospital.com')
        rec_password = os.environ.get('RECEPTIONIST_PASSWORD', 'Receptionist@123')
        
        receptionist = User.query.filter_by(username=rec_username).first()
        if not receptionist:
            receptionist = User(
                username=rec_username,
                email=rec_email,
                role='receptionist',
                is_active=True
            )
            receptionist.set_password(rec_password)
            db.session.add(receptionist)
            print(f"✓ Receptionist user created from .env")
        else:
            print(f"✓ Receptionist user already exists")
        
        # Create default department
        dept = Department.query.filter_by(name='General Medicine').first()
        if not dept:
            dept = Department(
                name='General Medicine',
                description='General medical services',
                head_of_department='admin',
                is_active=True
            )
            db.session.add(dept)
            print("✓ Default department created: General Medicine")
        
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("  ✅ Setup Complete!")
        print("=" * 60)
        print("\n📋 Login Credentials:")
        print("  Admin:")
        print("    Username: admin")
        print("    Password: Admin@123")
        print("  Receptionist:")
        print(f"    Username: {rec_username}")
        print(f"    Password: {rec_password}")
        print(f"    Email: {rec_email}")
        print("\n⚠️  Please change passwords in production!")

if __name__ == '__main__':
    create_default_users()