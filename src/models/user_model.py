from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Base común usuarios
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    apartment: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True


# Crear usuario
class UserCreate(UserBase):
    password: str


# Respuesta de usuario sin contraseña
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True