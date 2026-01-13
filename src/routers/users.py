from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.models.user_model import User
from src.schemas.user_schema import UserCreate, UserResponse
from src.services.email import send_verification_email
from src.core.security import get_password_hash, get_current_user

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Verificar si el email ya existe
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado en el sistema."
        )

    # Generar código de verificación
    verification_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    code_expires = datetime.utcnow() + timedelta(minutes=15)

    # Crear usuario
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        apartment=user_in.apartment,
        phone=user_in.phone,
        is_active=False,
        verification_code=verification_code,
        verification_code_expires_at=code_expires
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Enviar correo
    background_tasks.add_task(send_verification_email, new_user.email, verification_code)

    return new_user

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtener el perfil del usuario logueado.
    """
    return current_user