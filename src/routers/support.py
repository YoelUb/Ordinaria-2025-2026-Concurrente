import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from src.services.email import send_support_email

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class SupportSchema(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
def contact_support(form: SupportSchema, background_tasks: BackgroundTasks):
    """
    Recibe el formulario de contacto del frontend y envía un email al administrador.
    """
    logger.info(f"📨 [SOPORTE] Recibida solicitud de contacto.")
    logger.info(f"    - De: {form.name} <{form.email}>")
    logger.info(f"    - Asunto: {form.subject}")

    background_tasks.add_task(send_support_email, form.dict())

    return {"message": "Mensaje enviado al equipo de soporte"}