# verify_password.py
from app import create_app
from database import db
from models.user import User

def verify_passwords():
    """Verify password hashing for all users"""
    app = create_app()
    with app.app_context():
        print("=" * 70)
        print("  🔐 Password Verification Test")
        print("=" * 70)
        
        users = User.query.all()
        
        if not users:
            print("❌ No users found in database!")
            return
        
        print(f"\n📊 Total users: {len(users)}")
        print("-" * 70)
        
        for user in users:
            print(f"\n👤 User: {user.username}")
            print(f"   📧 Email: {user.email}")
            print(f"   🎭 Role: {user.role}")
            print(f"   ✅ Active: {user.is_active}")
            print(f"   ✅ Approved: {user.is_approved}")
            
            # Show password hash
            if user.password_hash:
                print(f"   🔑 Password Hash: {user.password_hash[:40]}...")
                print(f"   🔒 Hash Length: {len(user.password_hash)} characters")
            else:
                print(f"   ⚠️ No password hash found!")
            
            # Test known passwords
            print(f"\n   📝 Testing known passwords:")
            
            # Test admin password
            if user.username == 'admin':
                test_password = 'Admin@123'
                is_valid = user.check_password(test_password)
                print(f"   ✅ Password '{test_password}': {'✅ CORRECT' if is_valid else '❌ INCORRECT'}")
            
            # Test receptionist password
            elif user.username == 'receptionist':
                test_password = 'Receptionist@2024!'
                is_valid = user.check_password(test_password)
                print(f"   ✅ Password '{test_password}': {'✅ CORRECT' if is_valid else '❌ INCORRECT'}")
            
            # Test patient passwords
            elif user.username == 'Amal':
                test_password = 'Amal@Patient123'
                is_valid = user.check_password(test_password)
                print(f"   ✅ Password '{test_password}': {'✅ CORRECT' if is_valid else '❌ INCORRECT'}")
            elif user.username == 'patient':
                test_password = 'Patient@123'
                is_valid = user.check_password(test_password)
                print(f"   ✅ Password '{test_password}': {'✅ CORRECT' if is_valid else '❌ INCORRECT'}")
            elif user.username == 'doctor':
                test_password = 'Doctor@123'
                is_valid = user.check_password(test_password)
                print(f"   ✅ Password '{test_password}': {'✅ CORRECT' if is_valid else '❌ INCORRECT'}")
            else:
                print(f"   ℹ️ No known test password for this user")
            
            # Test wrong password
            wrong_password = 'WrongPassword123'
            is_valid = user.check_password(wrong_password)
            print(f"   ❌ Wrong password '{wrong_password}': {'✅ NOT MATCH (correct)' if not is_valid else '❌ INCORRECTLY MATCHED'}")
            
            # Hash format check
            if user.password_hash:
                if user.password_hash.startswith('$2b$'):
                    print(f"   🔒 Hash Format: BCrypt (✅ Secure)")
                elif user.password_hash.startswith('$2a$'):
                    print(f"   🔒 Hash Format: BCrypt (✅ Secure)")
                else:
                    print(f"   ⚠️ Unknown hash format: {user.password_hash[:10]}")
        
        # Summary
        print("\n" + "=" * 70)
        print("  📊 Summary")
        print("=" * 70)
        
        total_users = User.query.count()
        hashed_users = sum(1 for u in User.query.all() if u.password_hash and u.password_hash.startswith('$2'))
        
        print(f"   Total users: {total_users}")
        print(f"   Properly hashed: {hashed_users}/{total_users}")
        
        if hashed_users == total_users:
            print("   ✅ All passwords are properly hashed!")
        else:
            print(f"   ⚠️ {total_users - hashed_users} users have unhashed passwords!")

def reset_password(username, new_password):
    """Reset a user's password"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"❌ User '{username}' not found!")
            return False
        
        user.set_password(new_password)
        db.session.commit()
        print(f"✅ Password for '{username}' reset to: {new_password}")
        return True

if __name__ == '__main__':
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == 'reset' and len(sys.argv) == 4:
            username = sys.argv[2]
            new_password = sys.argv[3]
            reset_password(username, new_password)
        else:
            print("Usage:")
            print("  python verify_password.py                - Verify all passwords")
            print("  python verify_password.py reset <username> <new_password>  - Reset a user's password")
    else:
        verify_passwords()