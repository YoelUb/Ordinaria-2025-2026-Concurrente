from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.models.user_model import User
from src.core.security import get_password_hash
from src.core.deps import get_current_user
from src.schemas.user_schema import UserCreate, UserResponse, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en la base de datos.
    """
    # Verificar si el email ya existe
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Crear el objeto usuario (hasheando la contraseña)
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        apartment=user.apartment,
        phone=user.phone,
        is_active=user.is_active
    )

    # Guardar en BD
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene el perfil del usuario actual autenticado.
    Usa el token JWT enviado en el header 'Authorization'.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza la información del perfil del usuario actual."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.apartment is not None:
        current_user.apartment = user_update.apartment

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user