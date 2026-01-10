from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.models.user_model import User
from src.schemas.user_schema import UserCreate, UserResponse
from src.core.security import get_password_hash

router = APIRouter()


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
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