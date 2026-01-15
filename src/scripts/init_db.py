import logging
from sqlalchemy.orm import Session
from src.db.session import SessionLocal
from src.core.config import settings
from src.core.security import get_password_hash
from src.models.user_model import User
from src.models.facility_model import Facility
from src.db.base import Base
from src.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración inicial (Datos por defecto)
DEFAULT_FACILITIES = [
    {"name": "Pádel court 1", "price": 15.00, "capacity": 1, "icon": "🎾", "color": "from-blue-500 to-cyan-500"},
    {"name": "Pádel court 2", "price": 15.00, "capacity": 1, "icon": "🎾", "color": "from-blue-500 to-cyan-500"},
    {"name": "Piscina", "price": 8.00, "capacity": 20, "icon": "🏊", "color": "from-cyan-500 to-teal-500"},
    {"name": "Gimnasio", "price": 5.00, "capacity": 30, "icon": "💪", "color": "from-purple-500 to-pink-500"},
    {"name": "Sauna", "price": 10.00, "capacity": 10, "icon": "🔥", "color": "from-orange-500 to-red-500"},
]


def init_db(db: Session) -> None:
    # 1. Crear tablas si no existen (IMPORTANTE para que funcione el nuevo modelo)
    Base.metadata.create_all(bind=engine)

    # Crear Superusuario (Tu código actual...)
    user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not user:
        logger.info(f"--- CREANDO SUPERUSUARIO: {settings.ADMIN_EMAIL} ---")
        user = User(
            email=settings.ADMIN_EMAIL,
            full_name="Administrador",
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            role="admin",
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Superusuario creado correctamente")
    else:
        logger.info("El superusuario ya existe. Omitiendo creación.")

    # 3. CREAR INSTALACIONES POR DEFECTO (Nuevo)
    for fac_data in DEFAULT_FACILITIES:
        facility = db.query(Facility).filter(Facility.name == fac_data["name"]).first()
        if not facility:
            logger.info(f"Creando instalación: {fac_data['name']}")
            new_fac = Facility(**fac_data)
            db.add(new_fac)

    db.commit()
    logger.info("Instalaciones inicializadas.")


if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)

def create_initial_data() -> None:
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()