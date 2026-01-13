import firebase_admin
from firebase_admin import credentials, auth
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)

def initialize_firebase():
    """Inicializa Firebase Admin con el archivo de credenciales"""
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin inicializado correctamente.")
    except Exception as e:
        logger.error(f"Error al iniciar Firebase: {e}")

def verify_id_token(token: str):
    """
    Verifica el token ID de Firebase enviado por el cliente.
    Retorna el diccionario con los datos del usuario o None si falla.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verificando token de Firebase: {e}")
        return None