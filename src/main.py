from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.core.config import settings
from src.services.firebase import initialize_firebase
from src.routers import users

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Arrancando sistema...")
    initialize_firebase()
    yield
    print("🛑 Apagando sistema...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Incluimos el router
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "API Reservas Vecinos Funcionando 🟢"}