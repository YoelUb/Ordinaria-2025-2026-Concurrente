import random
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta, datetime, timezone
from src.db.session import get_db
from src.core.security import create_access_token, verify_password, get_password_hash
from src.core.config import settings
from src.models.user_model import User
from src.schemas.token_schema import Token
from src.services.firebase import verify_id_token
from src.services.email import send_verification_email

router = APIRouter()


class SocialLoginSchema(BaseModel):
    token: str


class VerificationSchema(BaseModel):
    email: EmailStr
    code: str


class ResendSchema(BaseModel):
    email: EmailStr



@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Cuenta no verificada. Revisa tu correo.")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/social", response_model=Token)
def social_login(schema: SocialLoginSchema, db: Session = Depends(get_db)):
    decoded_user = verify_id_token(schema.token)
    if not decoded_user:
        raise HTTPException(status_code=401, detail="Token inválido")

    email = decoded_user.get("email")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Crear usuario social automáticamente verificado
        new_user = User(
            email=email,
            full_name=decoded_user.get("name", "Usuario Nuevo"),
            hashed_password=get_password_hash("social_login_pass"),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verify-email")
def verify_email(schema: VerificationSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == schema.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.is_active:
        return {"message": "El usuario ya estaba verificado"}

    # Validar código y expiración
    if not user.verification_code or user.verification_code != schema.code:
        raise HTTPException(status_code=400, detail="Código inválido")

    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El código ha expirado")

    # Activar usuario
    user.is_active = True
    user.verification_code = None
    db.commit()

    return {"message": "Cuenta verificada con éxito"}


@router.post("/resend-verification")
def resend_verification(
        schema: ResendSchema,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == schema.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.is_active:
        return {"message": "El usuario ya está verificado"}

    # Generar nuevo código
    code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    user.verification_code = code
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    # Enviar email
    background_tasks.add_task(send_verification_email, user.email, code)

    return {"message": "Código reenviado"}