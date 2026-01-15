import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.core.config import settings


def _send_email(to_email: str, subject: str, html_content: str):
    """
    Función interna para manejar la conexión SMTP y el envío.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print("⚠ ERROR: Faltan credenciales SMTP en el archivo .env")
        return

    # Lógica de desvío para Admin (Evitar spam al correo real del admin durante pruebas)
    target_email = to_email
    if to_email == settings.ADMIN_EMAIL and settings.DEVIATION_EMAIL:
        print(f"🔒 MODO ADMIN DETECTADO: Desviando correo de {to_email} a {settings.DEVIATION_EMAIL}")
        target_email = settings.DEVIATION_EMAIL

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_USERNAME}>"
    msg["To"] = target_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_USERNAME, target_email, msg.as_string())
            print(f"Email enviado correctamente a {target_email}")
            return True
    except Exception as e:
        print(f"Error enviando email a {to_email}: {e}")
        return False


def send_verification_email(to_email: str, code: str):
    subject = "Código de verificación · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#0a0a0a;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111; border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding:40px; text-align:center; background:linear-gradient(180deg, #0a0a0a 0%, #111111 100%);">
              <div style="width:56px; height:56px; border-radius:50%; background:#ffffff; color:#000000; font-weight:700; font-size:20px; line-height:56px; text-align:center; margin:0 auto 20px;">R</div>
              <h1 style="margin:20px 0 0; font-size:32px; font-weight:300;">Verifica tu<br><span style="font-weight:600;">cuenta</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#d1d5db;">Introduce el siguiente código para completar tu registro:</p>
              <div style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; text-align:center; margin:30px 0;">
                <span style="font-size:36px; font-weight:600; letter-spacing:8px; color:#ffffff;">{code}</span>
              </div>
              <p style="font-size:14px; color:#9ca3af; text-align:center;">Este código expira en 15 minutos</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_welcome_email(to_email: str, name: str):
    subject = "¡Bienvenido a casa! · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#0a0a0a;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111; border-radius:20px; overflow:hidden;">
          <tr>
            <td style="padding:40px; text-align:center; background:linear-gradient(180deg, #0a0a0a 0%, #111111 100%);">
              <h1 style="margin:20px 0 0; font-size:32px; font-weight:300;">Tu cuenta está<br><span style="font-weight:600; color:#4ade80;">Verificada</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#d1d5db;">Hola <strong>{name}</strong>, ya tienes acceso total a la plataforma.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_reset_password_email(to_email: str, code: str):
    subject = "Recuperación de Contraseña · Residencial"
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:sans-serif; color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#0a0a0a;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111; border-radius:20px; border: 1px solid #7c3aed;">
          <tr>
            <td style="padding:40px; text-align:center;">
              <h1 style="color:#a78bfa; margin:0;">Recuperar Acceso</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#d1d5db;">Has solicitado restablecer tu contraseña. Usa este código:</p>
              <div style="background:#0a0a0a; border:1px solid #7c3aed; border-radius:16px; padding:24px; text-align:center; margin:30px 0;">
                <span style="font-size:36px; font-weight:600; letter-spacing:8px; color:#a78bfa;">{code}</span>
              </div>
              <p style="font-size:12px; color:#6b7280; text-align:center;">Si no fuiste tú, ignora este mensaje.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return _send_email(to_email, subject, html_content)


def send_support_email(data: dict):
    # Este correo se envía AL ADMINISTRADOR
    subject = f"Soporte: {data['subject']} - {data['name']}"
    to_email = settings.MAIL_USERNAME

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;">
    <h2>Nuevo mensaje de soporte</h2>
    <p><strong>De:</strong> {data['name']} ({data['email']})</p>
    <p><strong>Asunto:</strong> {data['subject']}</p>
    <hr>
    <p style="white-space: pre-wrap;">{data['message']}</p>
</body>
</html>
"""
    # Enviamos el correo al admin
    return _send_email(to_email, subject, html_content)