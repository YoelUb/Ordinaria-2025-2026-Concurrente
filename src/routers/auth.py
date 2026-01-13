from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.db.session import get_db
from src.core.security import create_access_token, verify_password, get_password_hash
from src.core.config import settings
from src.models.user_model import User
from src.schemas.token_schema import Token
from src.services.firebase import verify_id_token

router = APIRouter()

# Schema simple para recibir el token en el body
class SocialLoginSchema(BaseModel):
    token: str

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/social", response_model=Token)
def social_login(schema: SocialLoginSchema, db: Session = Depends(get_db)):
    """
    Inicia sesión o registra un usuario mediante Firebase (Google/GitHub).
    """
    # Verificar el token con Firebase
    decoded_user = verify_id_token(schema.token)
    if not decoded_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Firebase inválido o expirado",
        )

    email = decoded_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="El proveedor no retornó un email")

    # Buscar usuario en la Base de datos
    user = db.query(User).filter(User.email == email).first()

    # Si no existe, lo registramos automáticamente
    if not user:
        new_user = User(
            email=email,
            full_name=decoded_user.get("name", "Usuario Nuevo"),
            hashed_password=get_password_hash("social_login_placeholder_password"),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    # Generar el Token de acceso JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}