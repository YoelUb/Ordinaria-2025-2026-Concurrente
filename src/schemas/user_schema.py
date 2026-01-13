from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Propiedades compartidas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    apartment: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True


# Propiedades para recibir vía API al crear con password
class UserCreate(UserBase):
    password: str


# Propiedades para devolver vía API sin password
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Propiedades de informacion del usuario
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    apartment: Optional[str] = None