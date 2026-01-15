from fastapi import APIRouter, HTTPException
from src.services.email import send_support_email
from pydantic import BaseModel, EmailStr

router = APIRouter()


class SupportSchema(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
def contact_support(form: SupportSchema):
    """
    Recibe el formulario de contacto y envía un email al admin.
    """
    sent = send_support_email(form.dict())

    if not sent:
        raise HTTPException(status_code=500, detail="Error al enviar el mensaje de soporte")

    return {"message": "Mensaje enviado al equipo de soporte"}