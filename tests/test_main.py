import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from datetime import datetime, timedelta, timezone  # <--- AÑADIDO timezone
from src.main import app
from src.db.session import get_db
from src.models.user_model import User
from src.core.security import get_password_hash
from src.core.deps import get_current_user, get_current_admin


# --- FIXTURES (Configuración reutilizable) ---

@pytest.fixture
def mock_db():
    """
    Crea un Mock de base de datos y configura la inyección de dependencias
    para que la app use este mismo mock.
    """
    db = MagicMock()

    # Definimos la función override que devolverá NUESTRO mock específico
    def override_get_db():
        yield db

    # Aplicamos el override
    app.dependency_overrides[get_db] = override_get_db

    yield db  # Devolvemos el mock al test para que pueda configurarlo

    # Limpieza después del test
    app.dependency_overrides = {}


@pytest.fixture
def client():
    """Cliente de pruebas reutilizable"""
    return TestClient(app)


# --- TESTS DE AUTH ---

def test_login_wrong_password(client, mock_db):
    """1. Verifica que el login falla con contraseña incorrecta"""
    # Configurar el comportamiento del Mock DB
    mock_user = User(email="test@test.com", hashed_password=get_password_hash("correcta"), is_active=True)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    # Ejecutar petición
    response = client.post("/api/v1/auth/login", data={"username": "test@test.com", "password": "incorrecta"})

    assert response.status_code == 401
    assert "incorrectos" in response.json()["detail"]


def test_login_inactive_user(client, mock_db):
    """2. Verifica que no se puede loguear un usuario no activo"""
    mock_user = User(email="inactive@test.com", hashed_password=get_password_hash("pass"), is_active=False)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    response = client.post("/api/v1/auth/login", data={"username": "inactive@test.com", "password": "pass"})

    assert response.status_code == 400
    assert "Cuenta no verificada" in response.json()["detail"]


def test_forgot_password_sends_email(client, mock_db):
    """3. Verifica que forgot-password genera código y lo 'envía'"""
    mock_user = User(email="user@test.com", is_active=True)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    response = client.post("/api/v1/auth/forgot-password", json={"email": "user@test.com"})

    assert response.status_code == 200
    # Verificamos que se llamó al commit para guardar el código
    mock_db.commit.assert_called()


def test_reset_password_invalid_code(client, mock_db):
    """4. Verifica fallo al resetear con código incorrecto"""
    # CORREGIDO: Usar datetime con timezone.utc para coincidir con la app
    mock_user = User(
        email="user@test.com",
        reset_password_code="123456",
        reset_password_code_expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    response = client.post("/api/v1/auth/reset-password", json={
        "email": "user@test.com", "code": "999999", "new_password": "newpass"
    })

    assert response.status_code == 400
    assert "Código incorrecto" in response.json()["detail"]


# --- TESTS DE RESERVAS ---

def test_create_reservation_end_before_start(client, mock_db):
    """5. Validar lógica de fechas incoherentes"""
    # Mockear usuario autenticado
    app.dependency_overrides[get_current_user] = lambda: User(id=1, role="user")

    payload = {
        "facility": "Gym",
        "start_time": "2026-01-20T10:00:00",
        "end_time": "2026-01-20T09:00:00"  # Fin antes que inicio
    }

    response = client.post("/api/v1/reservations/", json=payload)
    assert response.status_code == 400
    assert "debe ser anterior" in response.json()["detail"]


def test_create_reservation_no_capacity(client, mock_db):
    """6. Verificar control de aforo lleno"""
    # Mockear usuario
    app.dependency_overrides[get_current_user] = lambda: User(id=1, role="user")

    mock_facility = MagicMock(capacity=10, price=10.0)

    # CORREGIDO: side_effect para manejar las múltiples llamadas a .first()
    # 1ª llamada: Busca configuración Facility -> Devuelve mock_facility
    # 2ª llamada: Busca duplicados (already_booked) -> Devuelve None (no tiene reserva)
    mock_db.query.return_value.filter.return_value.first.side_effect = [mock_facility, None]

    # Simulamos que ya hay 10 reservas en el count()
    mock_db.query.return_value.filter.return_value.count.return_value = 10

    payload = {
        "facility": "Gym",
        "start_time": "2026-01-20T10:00:00",
        "end_time": "2026-01-20T11:00:00"
    }
    response = client.post("/api/v1/reservations/", json=payload)

    assert response.status_code == 409
    assert "Aforo completo" in response.json()["detail"]


def test_create_reservation_duplicate_user(client, mock_db):
    """7. Verificar que un usuario no reserve dos veces el mismo slot"""
    app.dependency_overrides[get_current_user] = lambda: User(id=1, role="user")

    mock_facility = MagicMock(capacity=50, price=10.0)
    # 1ª llamada: Configuración -> mock_facility
    # 2ª llamada: Already Booked -> MagicMock() (simula que encontró una reserva)
    mock_db.query.return_value.filter.return_value.first.side_effect = [mock_facility, MagicMock()]

    payload = {
        "facility": "Padel",
        "start_time": "2026-01-20T10:00:00",
        "end_time": "2026-01-20T11:00:00"
    }
    response = client.post("/api/v1/reservations/", json=payload)

    assert response.status_code == 400
    assert "Ya tienes una plaza reservada" in response.json()["detail"]


def test_get_availability_empty(client, mock_db):
    """8. Verificar disponibilidad cuando no hay reservas"""
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock(capacity=10)
    mock_db.query.return_value.filter.return_value.all.return_value = []

    response = client.get("/api/v1/reservations/availability?facility=Gym&date_str=2026-01-01")

    assert response.status_code == 200
    assert response.json() == []


def test_cancel_reservation_permission_denied(client, mock_db):
    """9. Usuario intenta borrar reserva de otro"""
    app.dependency_overrides[get_current_user] = lambda: User(id=1, role="user")

    mock_res = MagicMock(id=1, user_id=999)  # Dueño ID 999
    mock_db.query.return_value.filter.return_value.first.return_value = mock_res

    response = client.delete("/api/v1/reservations/1")

    assert response.status_code == 403


def test_update_facility_price_admin(client, mock_db):
    """10. Verificar que Admin puede cambiar precios"""
    # Usar la función importada como clave para el override
    app.dependency_overrides[get_current_admin] = lambda: User(id=1, role="admin")

    mock_facility = MagicMock(id=1, name="Gym")
    mock_db.query.return_value.filter.return_value.first.return_value = mock_facility

    response = client.put("/api/v1/reservations/facilities/1?price=25.0&capacity=30")

    assert response.status_code == 200
    assert mock_facility.price == 25.0