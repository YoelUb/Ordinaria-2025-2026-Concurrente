from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core.config import settings
from src.services.firebase import initialize_firebase
from src.routers import users, auth, reservations
from src.services.storage import init_bucket


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Arrancando sistema...")

    # 1. Inicializar Firebase (Auth)
    try:
        initialize_firebase()
        print("✅ Firebase inicializado correctamente")
    except Exception as e:
        print(f"⚠️ Error al inicializar Firebase: {e}")

    # 2. Inicializar MinIO (Storage)
    try:
        init_bucket()
        print("✅ MinIO (Bucket 'avatars') verificado/creado")
    except Exception as e:
        print(f"⚠️ Error al conectar con MinIO: {e}")

    yield
    print("🛑 Apagando sistema...")


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- CONFIGURACIÓN CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RUTAS ---
app.include_router(auth.router, tags=["Authentication"], prefix="/api/v1/auth")
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(reservations.router, prefix="/api/v1/reservations", tags=["Reservations"])


@app.get("/")
def root():
    return {"message": "API Reservas Vecinos Funcionando 🎾🏊‍♂️"}