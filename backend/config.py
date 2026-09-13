import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:

    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        SECRET_KEY = 'dev-secret-key'

    # Database
    DATABASE_URL = os.environ.get('DATABASE_URL')

    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///hospital.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }


    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)


    # Mail
    MAIL_SERVER = os.environ.get(
        'MAIL_SERVER',
        'smtp.gmail.com'
    )

    MAIL_PORT = int(
        os.environ.get('MAIL_PORT', 587)
    )

    MAIL_USE_TLS = os.environ.get(
        'MAIL_USE_TLS',
        'True'
    ) == 'True'

    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')


    # Uploads
    UPLOAD_FOLDER = os.environ.get(
        'UPLOAD_FOLDER',
        'uploads'
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        'png',
        'jpg',
        'jpeg',
        'gif',
        'pdf',
        'doc',
        'docx'
    }


    # Admin default credentials
    ADMIN_USERNAME = os.environ.get(
        'ADMIN_USERNAME',
        'admin'
    )

    ADMIN_EMAIL = os.environ.get(
        'ADMIN_EMAIL',
        'admin@kalalhospital.com'
    )

    ADMIN_PASSWORD = os.environ.get(
        'ADMIN_PASSWORD',
        'Admin@123'
    )


    # Receptionist credentials
    RECEPTIONIST_USERNAME = os.environ.get(
        'RECEPTIONIST_USERNAME',
        'receptionist'
    )

    RECEPTIONIST_EMAIL = os.environ.get(
        'RECEPTIONIST_EMAIL',
        'receptionist@kalalhospital.com'
    )

    RECEPTIONIST_PASSWORD = os.environ.get(
        'RECEPTIONIST_PASSWORD',
        'Receptionist@123'
    )


    # CORS
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173'
    ]


    # Pagination
    PER_PAGE = 10