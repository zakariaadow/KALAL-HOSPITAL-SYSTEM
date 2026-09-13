from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from config import Config
from database import init_db, db
import os

# Initialize extensions
jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Ensure upload directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    for subdir in ['lab_reports', 'patient_documents', 'prescriptions']:
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], subdir), exist_ok=True)
    
    # Initialize extensions
    CORS(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    mail.init_app(app)
    init_db(app)
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to KALAL Hospital System API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'patients': '/api/patients',
                'doctors': '/api/doctors',
                'appointments': '/api/appointments',
                'medical_records': '/api/medical-records',
                'prescriptions': '/api/prescriptions',
                'laboratory': '/api/laboratory',
                'billing': '/api/billing',
                'dashboard': '/api/dashboard',
                'departments': '/api/departments'
            },
            'status': 'running'
        }), 200
    
    # Import blueprints
    from routes.auth import auth_bp
    from routes.patient import patient_bp
    from routes.doctor import doctor_bp
    from routes.appointment import appointment_bp
    from routes.medical_record import medical_record_bp
    from routes.prescription import prescription_bp
    from routes.laboratory import laboratory_bp
    from routes.billing import billing_bp
    from routes.dashboard import dashboard_bp
    from routes.department import department_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
    app.register_blueprint(medical_record_bp, url_prefix='/api/medical-records')
    app.register_blueprint(prescription_bp, url_prefix='/api/prescriptions')
    app.register_blueprint(laboratory_bp, url_prefix='/api/laboratory')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(department_bp, url_prefix='/api/departments')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
