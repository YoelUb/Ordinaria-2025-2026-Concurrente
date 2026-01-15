import random
import string
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
from src.services.email import send_verification_email, send_reset_password_email

router = APIRouter()


# --- SCHEMAS ---
class SocialLoginSchema(BaseModel):
    token: str


class VerificationSchema(BaseModel):
    email: EmailStr
    code: str


class ResendSchema(BaseModel):
    email: EmailStr


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    code: str
    new_password: str


# --- ENDPOINTS ---

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
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/social", response_model=Token)
def social_login(schema: SocialLoginSchema, db: Session = Depends(get_db)):
    decoded_user = verify_id_token(schema.token)
    if not decoded_user:
        raise HTTPException(status_code=401, detail="Token inválido")

    email = decoded_user.get("email")

    # --- FIX GITHUB: Si no viene nombre, usar el email o genérico ---
    user_name = decoded_user.get("name")
    if not user_name:
        user_name = email.split("@")[0] if email else "Usuario GitHub"
    # ---------------------------------------------------------------

    user = db.query(User).filter(User.email == email).first()

    if not user:
        new_user = User(
            email=email,
            full_name=user_name,
            hashed_password=get_password_hash("social_login_pass"),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    # Generar token para el usuario (existente o nuevo)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verify-email")
def verify_email(schema: VerificationSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == schema.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.is_active:
        return {"message": "El usuario ya estaba verificado"}

    if not user.verification_code or user.verification_code != schema.code:
        raise HTTPException(status_code=400, detail="Código inválido")

    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El código ha expirado")

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

    code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    user.verification_code = code
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    background_tasks.add_task(send_verification_email, user.email, code)
    return {"message": "Código reenviado"}



@router.post("/forgot-password")
def forgot_password(schema: ForgotPasswordSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Inicia el proceso de recuperación. Genera un código, lo guarda en la BD y lo envía por email.
    """
    user = db.query(User).filter(User.email == schema.email).first()

    code = ''.join(random.choices(string.digits, k=6))

    if user:
        # Guardar en la Base de Datos con expiración de 15 min
        user.reset_password_code = code
        user.reset_password_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        # Commit para persistir el código aunque se reinicie el servidor
        db.commit()

        # Enviar email en segundo plano
        background_tasks.add_task(send_reset_password_email, schema.email, code)

    return {"message": "Si el correo existe, se ha enviado un código."}


@router.post("/reset-password")
def reset_password(schema: ResetPasswordSchema, db: Session = Depends(get_db)):
    """
    Verifica el código desde la BD y cambia la contraseña.
    """
    user = db.query(User).filter(User.email == schema.email).first()

    # Verificar si el usuario existe y tiene un código activo
    if not user or not user.reset_password_code:
        raise HTTPException(status_code=400, detail="Solicitud no encontrada o expirada")

    # Verificar expiración
    if datetime.now(timezone.utc) > user.reset_password_code_expires_at:
        # Limpiar el código expirado
        user.reset_password_code = None
        user.reset_password_code_expires_at = None
        db.commit()
        raise HTTPException(status_code=400, detail="El código ha expirado")

    # Verificar coincidencia del código
    if user.reset_password_code != schema.code:
        raise HTTPException(status_code=400, detail="Código incorrecto")

    # Actualizar contraseña en BD
    user.hashed_password = get_password_hash(schema.new_password)

    # Limpiar código usado para que no se pueda reusar
    user.reset_password_code = None
    user.reset_password_code_expires_at = None

    db.commit()

    return {"message": "Contraseña actualizada correctamente"}