from typing import List
from datetime import datetime, timedelta, timezone
import random
import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.models.user_model import User
from src.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from src.services.email import send_verification_email
from src.core.security import get_password_hash
from src.core.deps import get_current_user, get_current_admin
from src.services.storage import upload_file
from dotenv import load_dotenv

load_dotenv()  # Cargar variables de entorno

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
    code_expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    role = "user"
    admin_email_env = os.getenv("ADMIN_EMAIL")

    # Comprobamos si el email del registro coincide con el del .env
    if admin_email_env and user_in.email.strip().lower() == admin_email_env.strip().lower():
        role = "admin"
        print(f"ADMIN DETECTADO: Asignando rol de administrador a {user_in.email}")

    # Crear usuario
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        apartment=user_in.apartment,
        phone=user_in.phone,
        address=user_in.address,
        postal_code=user_in.postal_code,
        role=role,  #
        is_active=False,
        verification_code=verification_code,
        verification_code_expires_at=code_expires
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Enviar correo (con desvío si es admin, gestionado en services/email.py)
    background_tasks.add_task(send_verification_email, new_user.email, verification_code)

    return new_user


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtener el perfil del usuario logueado.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
        user_update: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Actualizar datos del perfil"""
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.address:
        current_user.address = user_update.address
    if user_update.apartment:
        current_user.apartment = user_update.apartment.upper()
    if user_update.postal_code:
        current_user.postal_code = user_update.postal_code

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar")
def upload_avatar(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Subir foto de perfil a MinIO"""
    # Generar nombre único
    file_extension = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"

    # Subir a MinIO
    url = upload_file(file.file, filename, file.content_type)

    if not url:
        raise HTTPException(status_code=500, detail="Error al subir la imagen a MinIO")

    # Guardar URL en BD
    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)

    return {"avatar_url": url}


@router.get("/", response_model=List[UserResponse])
def read_users(
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)
):
    """Endpoint protegido solo para administradores"""
    return db.query(User).all()