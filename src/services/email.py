import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# Configuración SMTP (Gmail)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("MAIL_USERNAME")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD")


def send_verification_email(to_email: str, code: str):
    """
    Envía un correo de verificación con un diseño premium y elegante.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠ ERROR: Faltan credenciales SMTP en el archivo .env")
        return

    subject = "Código de verificación · Residencial"

    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificación de cuenta</title>
</head>
<body style="
    margin:0;
    padding:0;
    background-color:#0a0a0a;
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color:#ffffff;
">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#0a0a0a;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="
            background-color:#111111;
            border-radius:20px;
            overflow:hidden;
            box-shadow:0 20px 50px rgba(0,0,0,0.6);
        ">

          <!-- Header -->
          <tr>
            <td style="
                padding:40px;
                text-align:center;
                background:linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
            ">
              <div style="
                  width:56px;
                  height:56px;
                  border-radius:50%;
                  background:#ffffff;
                  color:#000000;
                  display:inline-flex;
                  align-items:center;
                  justify-content:center;
                  font-weight:700;
                  font-size:20px;
                  margin-bottom:20px;
              ">
                R
              </div>

              <p style="
                  margin:0;
                  font-size:12px;
                  letter-spacing:4px;
                  text-transform:uppercase;
                  color:#9ca3af;
              ">
                Sistema Residencial
              </p>

              <h1 style="
                  margin:20px 0 0;
                  font-size:32px;
                  font-weight:300;
                  line-height:1.2;
              ">
                Verifica tu<br>
                <span style="font-weight:600;">cuenta</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="
                  font-size:16px;
                  line-height:1.6;
                  color:#d1d5db;
                  margin:0 0 20px;
              ">
                Hola,
              </p>

              <p style="
                  font-size:16px;
                  line-height:1.6;
                  color:#d1d5db;
                  margin:0 0 30px;
              ">
                Estás a un paso de acceder a todas las instalaciones y servicios
                de tu comunidad. Introduce el siguiente código para completar
                tu registro:
              </p>

              <div style="
                  background:#0a0a0a;
                  border:1px solid rgba(255,255,255,0.08);
                  border-radius:16px;
                  padding:24px;
                  text-align:center;
                  margin:30px 0;
              ">
                <span style="
                    font-size:36px;
                    font-weight:600;
                    letter-spacing:8px;
                    color:#ffffff;
                ">
                  {code}
                </span>
              </div>

              <p style="
                  font-size:14px;
                  color:#9ca3af;
                  text-align:center;
                  margin:0;
              ">
                Este código expirará en <strong>15 minutos</strong>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px; background:rgba(255,255,255,0.08);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px; text-align:center;">
              <p style="
                  font-size:12px;
                  line-height:1.6;
                  color:#6b7280;
                  margin:0 0 10px;
              ">
                Si no has solicitado este registro, puedes ignorar este mensaje.
              </p>
              <p style="
                  font-size:12px;
                  color:#6b7280;
                  margin:0;
              ">
                © 2026 Sistema Residencial · Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Residencial <{SMTP_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"Email enviado correctamente a {to_email}")
    except Exception as e:
        print(f"Error enviando email: {e}")
