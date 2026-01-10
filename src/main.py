from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.core.config import settings
from src.services.firebase import initialize_firebase
from src.routers import users, auth, reservations

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Arrancando sistema...")
    initialize_firebase()
    yield
    print("🛑 Apagando sistema...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.include_router(auth.router, tags=["Authentication"], prefix="/api/v1/auth")
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# 2. AÑADIR ROUTER DE RESERVAS
app.include_router(reservations.router, prefix="/api/v1/reservations", tags=["Reservations"])

@app.get("/")
def root():
    return {"message": "API Reservas Vecinos Funcionando 🟢"}