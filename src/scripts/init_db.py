import os
import logging
from sqlalchemy.orm import Session
from src.db.session import SessionLocal
from src.models.user_model import User
from src.core.security import get_password_hash
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Leer datos del .env
    admin_email = os.getenv("ADMIN_EMAIL", "admin@residencial.com")
    # Contraseña por defecto si no está en env
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin1234")

    # Comprobar si ya existe
    user = db.query(User).filter(User.email == admin_email).first()

    if not user:
        logger.info(f"--- CREANDO SUPERUSUARIO: {admin_email} ---")
        user = User(
            full_name="Administrador Sistema",
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role="admin",
            is_active=True,
            is_superuser=True,
            apartment="ADMIN",
            phone="000000000",
            address="Oficina Central",
            postal_code="00000"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Superusuario creado correctamente")
    else:
        logger.info("ℹEl superusuario ya existe. Omitiendo creación.")


def create_initial_data() -> None:
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()