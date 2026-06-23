<div align="center">

# Ordinaria-2025-2026-Concurrente

### Modernizando la vida en comunidad: gestión inteligente, convivencia simplificada

<br>

![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

---

##  Tabla de contenidos

1. [Descripción general](#-descripción-general)
2. [Características principales](#-características-principales)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Instalación](#-instalación)
5. [Uso](#-uso)
6. [Administrador](#-administrador)
7. [Pruebas](#-pruebas)
8. [Contacto](#-contacto)

---

##  Descripción general

**Ordinaria-2025-2026-Concurrente** es una plataforma SaaS integral diseñada para la gestión inteligente de comunidades residenciales. El sistema aborda las complejidades de la administración de instalaciones compartidas mediante una arquitectura moderna, escalable y centrada en el usuario.

### El problema que resolvemos

Las comunidades modernas enfrentan desafíos en la gestión de recursos compartidos: reservas conflictivas, falta de transparencia financiera, comunicación ineficiente y procesos administrativos manuales. Esta plataforma automatiza y optimiza estos procesos, mejorando la convivencia y reduciendo la carga administrativa.

### Valor principal

| | |
|---|---|
|  **Transparencia total** | Disponibilidad y costes visibles en todo momento |
|  **Automatización inteligente** | Procesos repetitivos sin intervención manual |
|  **Experiencia unificada** | Una sola plataforma para residentes y administradores |
|  **Escalabilidad** | Arquitectura preparada para crecer |
|  **Seguridad** | Protección en todos los niveles |

---

##  Características principales

###  Para residentes

- **Reserva inteligente de instalaciones** — booking en tiempo real para pistas de pádel, piscinas, gimnasio, sauna y salas comunales
- **Panel financiero personalizado** — gastos mensuales, historial de pagos y recibos digitales
- **Gestión de perfil avanzada** — avatares, preferencias y notificaciones personalizadas
- **Comunicación integrada** — mensajería interna y tablón de anuncios comunitario
- **Diseño responsive** — experiencia optimizada para dispositivos móviles

###  Para administradores

- **Dashboard analítico** — métricas en tiempo real de utilización, ingresos y satisfacción
- **Gestión dinámica de precios** — ajuste de tarifas según demanda y temporada
- **Control de aforo automático** — previene sobrecupos y optimiza recursos
- **Herramientas de moderación** — gestión de usuarios, contenido e incidencias
- **Reportes exportables** — informes financieros y de uso en múltiples formatos

###  Pasarela de pagos integrada (simulación)

- **Integración con Stripe** — procesamiento seguro con múltiples métodos (tarjeta, Bizum, transferencia)
- **Facturación automática** — generación de facturas y recordatorios de pago
- **Suscripciones recurrentes** — gestión de cuotas mensuales de comunidad
- **Modo sandbox** — entorno de pruebas completo para desarrollo

###  Sistema de avatares y multimedia

- **Upload inteligente** — compresión y optimización automática de imágenes
- **CDN integrado** — distribución mediante MinIO con cache estratégico
- **Edición en navegador** — recorte, filtros y redimensionado básicos
- **Multi-formato** — JPG, PNG, WEBP y GIF animados (hasta 10 MB)

###  Seguridad y cumplimiento

- **Autenticación multi-factor** — 2FA mediante apps y SMS
- **RBAC avanzado** — roles y permisos granulares
- **Auditoría completa** — logs detallados de todas las acciones
- **GDPR compliant** — gestión de privacidad y derecho al olvido

---

##  Stack tecnológico

### Backend
- **Python 3.11+** con **FastAPI** para APIs de alto rendimiento
- **SQLAlchemy** + **psycopg2-binary** para operaciones con PostgreSQL
- **Alembic** para migraciones de base de datos
- **Pydantic** para validación de datos
- **Firebase Admin SDK** para autenticación
- **MinIO Client** para almacenamiento de objetos

### Frontend
- **React 18** con **TypeScript** para una UI tipada
- **Vite** como bundler y entorno de desarrollo
- **React Router v6** para navegación
- **Tailwind CSS** para estilos utilitarios
- **Axios** para peticiones HTTP
- **Firebase Auth** para autenticación en cliente
- **React Dropzone** para subida de archivos

### Infraestructura y DevOps
- **Docker** y **Docker Compose** para contenerización
- **PostgreSQL 15** como base de datos principal
- **MinIO** para almacenamiento de objetos (compatible con S3)
- **Pytest** + **pytest-asyncio** para testing de backend
- **Vitest** + **React Testing Library** para testing de frontend
- **ESLint** y **Prettier** para calidad de código

---

##  Instalación

### Requisitos previos

Antes de ejecutar el proyecto, asegúrate de contar con:

- **Docker** y **Docker Compose**
- **Pip** (gestor de paquetes de Python)
- **Npm** (gestor de paquetes de Node)

### 1. Clonar el repositorio

```bash
git clone https://github.com/YoelUb/Ordinaria-2025-2026-Concurrente
```

### 2. Entrar en el directorio del proyecto

```bash
cd Ordinaria-2025-2026-Concurrente
```

### 3. Configurar el entorno

Crea un archivo **`.env`** en la raíz basado en **`env.example`**, tanto en el frontend como en el backend.

---

## 🚀 Uso

La forma más sencilla de ejecutar la aplicación completa es mediante Docker Compose:

```bash
docker-compose up --build
```

Esto iniciará los siguientes servicios:

| Servicio | URL / Puerto |
|---|---|
|  Backend (FastAPI) | http://localhost:8000 |
|  Frontend (React) | http://localhost:5173 |
|  PostgreSQL | `localhost:5432` |
|  MinIO Console | http://localhost:9001 |

Una vez levantado, abre tu navegador en **http://localhost:5173**.

---

##  Administrador

Credenciales de prueba para acceder a la aplicación:

>  **Nota:** son valores de ejemplo. Podrás configurarlos en tu archivo `.env` personal.

```
Correo:     admin@comunidadvecinos.com
Contraseña: Admin_Vecinos2026!
```

---

##  Pruebas

>  Para ejecutar los tests, primero levanta el servicio:
> ```bash
> docker-compose up --build
> ```

### Backend (Python)

Ejecuta los tests del backend dentro del contenedor:

```bash
docker-compose exec web pytest
```

### Frontend (React)

Las pruebas del frontend usan **Vitest** y **React Testing Library**:

```bash
docker-compose exec frontend npx vitest
```

---

<div align="center">

**¡Disfruta de tu sistema de gestión de instalaciones para comunidades de vecinos!** 

##  Contacto

¿Dudas o sugerencias? Escribe a **yurqubar@myuax.com**

</div>
