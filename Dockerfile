# Imagen ligera de Python 3.11
FROM python:3.11-slim

# Variables de entorno para optimizar Python en Docker
# Evita archivos .pyc innecesarios
ENV PYTHONDONTWRITEBYTECODE 1
# Logs en tiempo real
ENV PYTHONUNBUFFERED 1
# Añadimos el directorio actual al PYTHONPATH para evitar errores de importación de 'src'
ENV PYTHONPATH "${PYTHONPATH}:/app"

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias para compilar ciertas librerías
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiamos primero el requirements.txt
COPY requirements.txt .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copiamos el resto del código
COPY . .

# Comando de inicio: Apunta a src.main
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]