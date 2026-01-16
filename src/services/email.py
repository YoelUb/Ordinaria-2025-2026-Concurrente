import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.core.config import settings

# --- CONFIGURACIÓN DE LOGS ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _send_email(to_email: str, subject: str, html_content: str):
    """
    Función interna para manejar la conexión SMTP y el envío con LOGS detallados.
    """
    logger.info(f"🚀 [EMAIL] Iniciando proceso de envío a: {to_email}")

    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.error("❌ [EMAIL] ERROR CRÍTICO: Faltan credenciales SMTP en el archivo .env")
        return False

    # Lógica de desvío para Admin (Evitar spam al correo real durante pruebas)
    target_email = to_email
    if to_email == settings.ADMIN_EMAIL and settings.DEVIATION_EMAIL:
        logger.warning(f"🔒 [EMAIL] MODO ADMIN: Desviando correo de {to_email} a {settings.DEVIATION_EMAIL}")
        target_email = settings.DEVIATION_EMAIL

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_USERNAME}>"
    msg["To"] = target_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        logger.info(f"🔌 [EMAIL] Conectando al servidor SMTP: {settings.MAIL_SERVER}:{settings.MAIL_PORT}...")

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()  # Seguridad TLS

            logger.info(f"🔑 [EMAIL] Autenticando usuario: {settings.MAIL_USERNAME}")
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)

            logger.info(f"📤 [EMAIL] Enviando paquete de datos...")
            server.sendmail(settings.MAIL_USERNAME, target_email, msg.as_string())

            logger.info(f"✅ [EMAIL] ¡ÉXITO! Correo entregado al servidor para: {target_email}")
            return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"❌ [EMAIL] ERROR DE AUTENTICACIÓN: Usuario o contraseña incorrectos.")
        logger.error(f"    - Detalle técnico: {e}")
        return False
    except smtplib.SMTPConnectError as e:
        logger.error(f"❌ [EMAIL] ERROR DE CONEXIÓN: No se pudo conectar al servidor SMTP.")
        logger.error(f"    - Detalle técnico: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ [EMAIL] ERROR DESCONOCIDO: {e}")
        return False


# --- FUNCIONES PÚBLICAS ---

def send_verification_email(to_email: str, code: str):
    logger.info(f"📝 [EMAIL] Preparando email de VERIFICACIÓN para {to_email}")
    subject = "Código de verificación · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <div style="text-align:center; padding: 40px;">
    <h1 style="color:#ffffff;">Verifica tu cuenta</h1>
    <p style="color:#d1d5db;">Tu código de acceso es:</p>
    <div style="background:#1a1a1a; border:1px solid #333; border-radius:10px; padding:20px; font-size:32px; letter-spacing:5px; display:inline-block; margin:20px 0;">
      {code}
    </div>
    <p style="font-size:12px; color:#666;">Expira en 15 minutos</p>
  </div>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_welcome_email(to_email: str, name: str):
    logger.info(f"📝 [EMAIL] Preparando email de BIENVENIDA para {to_email}")
    subject = "¡Bienvenido a casa! · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <div style="text-align:center; padding: 40px;">
    <h1 style="color:#4ade80;">¡Cuenta Verificada!</h1>
    <p style="color:#d1d5db;">Hola {name}, ya tienes acceso total a las instalaciones.</p>
  </div>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_reset_password_email(to_email: str, code: str):
    logger.info(f"📝 [EMAIL] Preparando email de RESET PASSWORD para {to_email}")
    subject = "Recuperación de Contraseña · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <div style="text-align:center; padding: 40px;">
    <h1 style="color:#a78bfa;">Recuperar Contraseña</h1>
    <p style="color:#d1d5db;">Usa este código para cambiar tu clave:</p>
    <div style="background:#1a1a1a; border:1px solid #7c3aed; border-radius:10px; padding:20px; font-size:32px; letter-spacing:5px; display:inline-block; margin:20px 0;">
      {code}
    </div>
  </div>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_support_email(data: dict):
    # CORREGIDO: Usamos MAIL_USERNAME para que llegue al correo del sistema
    destinatario = settings.MAIL_USERNAME
    logger.info(f"📝 [EMAIL] Preparando email de SOPORTE.")
    logger.info(f"    - Origen: {data['email']}")
    logger.info(f"    - Destino: {destinatario} (Admin/Sistema)")

    subject = f"Soporte: {data['subject']} - {data['name']}"

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;">
    <h2>Nuevo mensaje de soporte recibido</h2>
    <ul>
        <li><strong>Nombre:</strong> {data['name']}</li>
        <li><strong>Email:</strong> {data['email']}</li>
        <li><strong>Asunto:</strong> {data['subject']}</li>
    </ul>
    <hr>
    <h3>Mensaje:</h3>
    <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">{data['message']}</p>
</body>
</html>
"""
    return _send_email(destinatario, subject, html_content)