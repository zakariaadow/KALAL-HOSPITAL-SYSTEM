import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def _normalize_db_url(url: str) -> str:
    """Render gives postgres:// which SQLAlchemy 1.4+ rejects."""
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    # ---------- Security ----------
    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        if os.environ.get("FLASK_DEBUG") in ("0", "false", "False"):
            raise RuntimeError("SECRET_KEY must be set in production")
        SECRET_KEY = "dev-secret-key"

    # ---------- Database ----------
    DATABASE_URL = _normalize_db_url(os.environ.get("DATABASE_URL"))

    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///hospital.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Pool only for real DBs (not SQLite)
    if SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        SQLALCHEMY_ENGINE_OPTIONS = {}
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_size": 5,
            "max_overflow": 5,
            "pool_recycle": 300,       # Render closes idle conns
            "pool_pre_ping": True,
        }

    # ---------- JWT ----------
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ---------- Mail ----------
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")

    # ---------- Uploads ----------
    UPLOAD_FOLDER = os.environ.get(
        "UPLOAD_FOLDER",
        "/tmp/uploads" if os.environ.get("RENDER") else "uploads",
    )
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "doc", "docx"}

    # ---------- Seed accounts ----------
    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@kalalhospital.com")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")

    RECEPTIONIST_USERNAME = os.environ.get("RECEPTIONIST_USERNAME", "receptionist")
    RECEPTIONIST_EMAIL = os.environ.get("RECEPTIONIST_EMAIL", "receptionist@kalalhospital.com")
    RECEPTIONIST_PASSWORD = os.environ.get("RECEPTIONIST_PASSWORD", "Receptionist@123")

    # ---------- CORS ----------
    CORS_ORIGINS = [
        o.strip()
        for o in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ]

    PER_PAGE = 10