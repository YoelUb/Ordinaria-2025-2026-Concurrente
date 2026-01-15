from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re

# --- Reglas de validación ---
PHONE_REGEX = r'^\+?[0-9]{9,15}$'


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=3, description="Nombre completo (min 3 letras)")
    apartment: Optional[str] = Field(None, min_length=1, description="Apartamento (ej: 4B)")
    phone: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    is_active: bool = True
    role: Optional[str] = "user"

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        # Eliminar espacios y guiones para validar
        clean_phone = re.sub(r'[\s-]', '', v)
        if not re.match(PHONE_REGEX, clean_phone):
            raise ValueError('El teléfono debe tener entre 9 y 15 dígitos.')
        return clean_phone


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        # Validar longitud
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres.')

        # Validar complejidad una por una (Más seguro que un solo Regex complejo)
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una mayúscula.')
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una minúscula.')
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número.')

        return v


# Esquema para actualizar perfil
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3)
    apartment: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        clean_phone = re.sub(r'[\s-]', '', v)
        if not re.match(PHONE_REGEX, clean_phone):
            raise ValueError('El teléfono debe tener entre 9 y 15 dígitos.')
        return clean_phone


class UserResponse(UserBase):
    id: int
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True