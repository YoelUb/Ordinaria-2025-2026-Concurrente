# ORDINARIA-2025-2026-CONCURRENTE

**Modernizando la vida en comunidad: Gestión inteligente, convivencia simplificada.**

---

## Stack Tecnológico

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Pip](https://img.shields.io/badge/PIP-3775A9?style=for-the-badge&logo=python&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005863?style=for-the-badge&logo=fastapi&logoColor=white)![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### **Backend**
- **Python 3.11+** con **FastAPI** para APIs de alto rendimiento
- **SQLAlchemy** con **psycopg2-binary** para operaciones asíncronas con PostgreSQL
- **Alembic** para migraciones de base de datos
- **Pydantic** para validación de datos
- **Firebase Admin SDK** para autenticación
- **MinIO Client** para gestión de almacenamiento de objetos

### **Frontend**
- **React 18** con **TypeScript** para una UI tipada
- **Vite** como bundler y herramienta de desarrollo
- **React Router v6** para navegación
- **Tailwind CSS** para estilos utilitarios
- **Axios** para peticiones HTTP
- **Firebase Auth** para autenticación en cliente
- **React Dropzone** para subida de archivos

### **Infraestructura & DevOps**
- **Docker** y **Docker Compose** para contenerización
- **PostgreSQL 15** como base de datos principal
- **MinIO** para almacenamiento de objetos (S3-compatible)
- **Pytest** con **pytest-asyncio** para testing
- **Vitest** y **React Testing Library** para tests de frontend
- **ESLint** y **Prettier** para calidad de código

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Instalación](#instalación)
4. [Uso](#uso)
5. [Administrador](#administrador)
6. [Pruebas](#pruebas)
7. [Contacto](#contacto)

---

## Descripción general

**Ordinaria-2025-2026-Concurrente** es una plataforma SaaS integral diseñada para la gestión inteligente de comunidades residenciales. El sistema aborda las complejidades de la administración de instalaciones compartidas mediante una arquitectura moderna, escalable y centrada en el usuario.

### **Problema que resolvemos**
Las comunidades modernas enfrentan desafíos en la gestión de recursos compartidos: reservas conflictivas, falta de transparencia financiera, comunicación ineficiente y procesos administrativos manuales. Nuestra plataforma automatiza y optimiza estos procesos, mejorando la convivencia y reduciendo la carga administrativa.

### **Valor principal**
- **Transparencia total** en disponibilidad y costos
- **Automatización inteligente** de procesos repetitivos
- **Experiencia unificada** para residentes y administradores
- **Escalabilidad garantizada** mediante arquitectura microservicios
- **Seguridad enterprise-grade** en todos los niveles

---

## Características principales

### Para Residentes
- **Reserva Inteligente de Instalaciones**: Sistema de booking en tiempo real para pistas de pádel, piscinas, gimnasio, sauna y salas comunales
- **Panel Financiero Personalizado**: Visualización detallada de gastos mensuales, historial de pagos y recibos digitales
- **Gestión de Perfil Avanzada**: Sistema completo de avatares, preferencias y notificaciones personalizadas
- **Comunicación Integrada**: Sistema de mensajería interna y tablón de anuncios comunitario
- **App Móvil Responsive**: Experiencia optimizada para dispositivos móviles

### Para Administradores
- **Dashboard Analytics**: Métricas en tiempo real de utilización, ingresos y satisfacción
- **Gestión Dinámica de Precios**: Ajuste inteligente de tarifas según demanda y temporada
- **Control de Aforo Automático**: Sistema que previene sobrecupos y optimiza recursos
- **Herramientas de Moderación**: Gestión de usuarios, contenido y resolución de incidencias
- **Reportes Exportables**: Generación de informes financieros y de uso en múltiples formatos

###  Pasarela de gagos integrada (simulación)
- **Integración con Stripe**: Procesamiento seguro de pagos con soporte para múltiples métodos (tarjeta, Bizum, transferencia)
- **Facturación Automática**: Generación automática de facturas y recordatorios de pago
- **Suscripciones Recurrentes**: Gestión de cuotas mensuales de comunidad
- **Conciliación Bancaria**: Herramientas para reconciliación automática de pagos
- **Modo Sandbox**: Entorno de pruebas completo para desarrollo y testing

### Sistema de avatares y multimedia
- **Upload Inteligente**: Subida de imágenes con compresión y optimización automática
- **CDN Integrado**: Distribución global mediante MinIO con cache estratégico
- **Edición en Navegador**: Herramientas básicas de edición (recorte, filtros, redimensionado)
- **Soporte Multi-formato**: JPG, PNG, WEBP, GIF animados (hasta 10MB)
- **Sistema de Moderación**: Detección automática de contenido inapropiado

### Seguridad y cumplimiento
- **Autenticación Multi-factor**: Soporte para 2FA mediante apps y SMS
- **RBAC Avanzado**: Sistema de roles y permisos granulares
- **Encriptación End-to-End**: Para datos sensibles y comunicaciones
- **Auditoría Completa**: Logs detallados de todas las acciones del sistema
- **GDPR Compliant**: Herramientas para gestión de privacidad y derecho al olvido

---

## Primeros Pasos

### Requisitos Previos
Antes de ejecutar el proyecto, asegúrate de contar con:

- Lenguaje de programación: **TypeScript**  
- Gestores de paquetes: **Pip**, **Npm**  
- Contenedores: **Docker**

---

## Instalación

Construye un **Sistema de reservas de la comunidad de vecinos** desde el código fuente e instala las dependencias:

### 1. Clonar el repositorio:
```bash
   git clone https://github.com/YoelUb/Ordinaria-2025-2026-Concurrente
```

### 2. Entrar en el directorio del proyecto:
```bash
  cd Ordinaria-2025-2026-Concurrente
```

### 3. Configuración de entorno:

- Crea un archivo **".env"** en la raíz basado en **"env.example"** tanto en el frontend como en el backend.

## Uso

La forma más sencilla de ejecutar la aplicación completa es utilizando Docker Compose.

### Levantar la aplicación

```bash
   docker-compose up --build
```

Esto iniciará:

- El backend (FastAPI) en http://localhost:8000


- El frontend (React) en http://localhost:5173


- La base de datos (PostgreSQL, si está configurada en el docker-compose) en el puerto **5432**.

- MinIO Console: http://localhost:9001

### Acceder a la aplicación:

Abre tu navegador y navega a http://localhost:5173.

---


# Administrador

- El administrador de prueba para poder acceder a la aplicación es:

- **NOTA** => Es un ejemplo, podras configurarlo en tu **.env** personal

- Correo: admin@comunidadvecinos.com
- Contraseña: Admin_Vecinos2026!


---

# Pruebas

## Backend (Python)

Para ejecutar los tests del backend:

- **NOTA** => Deberas tener el servcio levantado y funcionando: 
```bash
   docker-compose up --build
```

**Asegúrate de tener Docker, puedes ejecutar docker-compose exec app pytest.**

 **Docker**, puedes ejecutar docker-compose exec app pytest.

```bash
  docker-compose exec web pytest
```
---

## Frontend (React)

Las pruebas del frontend utilizan **Vitest** y **React Testing Library**.

**Asegurate de tener la aplicación levantada con Docker Compose, y así correr los tests dentro del contenedor**


```bash
   docker-compose exec frontend npx vitest
```

---

**¡Disfruta de tu Sistema robusto de gestión de instalaciones de comunidades de vecinos! **

---

## Contacto

Escribir ante cualquier duda --> yoelurquijo13@gmail.com

---





