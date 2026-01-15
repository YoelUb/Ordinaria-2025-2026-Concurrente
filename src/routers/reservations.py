from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from src.db.session import get_db
from src.core.deps import get_current_user, get_current_admin
from src.models.user_model import User
from src.models.reservation_model import Reservation
from src.schemas.reservation_schema import ReservationCreate, ReservationResponse
from pydantic import BaseModel

router = APIRouter()

# --- CONFIGURACIÓN DE INSTALACIONES (PRECIOS Y AFORO) ---
FACILITIES_CONFIG = {
    "Pádel Court 1": {"price": 15.00, "capacity": 1},
    "Pádel Court 2": {"price": 15.00, "capacity": 1},
    "Piscina": {"price": 8.00, "capacity": 20},
    "Gimnasio": {"price": 5.00, "capacity": 30},
    "Sauna": {"price": 10.00, "capacity": 10},
}


class AdminStats(BaseModel):
    total_reservations: int
    total_earnings: float
    popular_facility: str


@router.post("/", response_model=ReservationResponse)
def create_reservation(
        reservation: ReservationCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # 1. Validar fechas
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser anterior a la de fin")

    # 2. Obtener config de la instalación
    config = FACILITIES_CONFIG.get(reservation.facility)
    if not config:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")

    # 3. VERIFICAR AFORO (Concurrentemente)
    # Contamos cuántas reservas hay YA CONFIRMADAS para esa instalación en ese intervalo
    # Se solapan si: (StartA < EndB) y (EndA > StartB)
    existing_count = db.query(Reservation).filter(
        Reservation.facility == reservation.facility,
        Reservation.start_time < reservation.end_time,
        Reservation.end_time > reservation.start_time
    ).count()

    if existing_count >= config["capacity"]:
        raise HTTPException(
            status_code=409,
            detail=f"Aforo completo. Ya hay {existing_count}/{config['capacity']} plazas ocupadas."
        )

    # 4. Crear reserva con precio
    price_with_tax = config["price"] * 1.21  # Aplicando IVA por ejemplo, o precio base

    new_reservation = Reservation(
        facility=reservation.facility,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        user_id=current_user.id,
        price=round(price_with_tax, 2)  # Guardamos el precio calculado
    )

    try:
        db.add(new_reservation)
        db.commit()
        db.refresh(new_reservation)
        return new_reservation
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error al crear reserva")


@router.get("/me", response_model=List[ReservationResponse])
def read_my_reservations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Reservation).filter(Reservation.user_id == current_user.id).order_by(
        Reservation.start_time.desc()).all()


@router.get("/availability")
def get_availability(facility: str, date_str: str, db: Session = Depends(get_db)):
    """Devuelve horarios ocupados AL COMPLETO (cuando aforo está lleno)"""
    try:
        search_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato YYYY-MM-DD requerido")

    config = FACILITIES_CONFIG.get(facility)
    if not config: return []

    # Buscar reservas del día
    reservations = db.query(Reservation).filter(
        Reservation.facility == facility,
        func.date(Reservation.start_time) == search_date
    ).all()

    # Agrupar por hora de inicio para ver cuántas hay en cada slot
    slots_count = {}
    for res in reservations:
        start_iso = res.start_time.isoformat()
        slots_count[start_iso] = slots_count.get(start_iso, 0) + 1

    # Devolver solo los slots donde count >= capacity
    busy_slots = []
    for start_time, count in slots_count.items():
        if count >= config["capacity"]:
            # Necesitamos devolver formato objeto para el frontend
            # Ojo: el frontend espera {start: iso, end: iso}
            # Buscamos una reserva de ejemplo para sacar el end time
            example_res = next(r for r in reservations if r.start_time.isoformat() == start_time)
            busy_slots.append({
                "start": start_time,
                "end": example_res.end_time.isoformat()
            })

    return busy_slots


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)  # Solo admin puede ver esto
):
    """Devuelve estadísticas financieras para el administrador"""

    total_res = db.query(Reservation).count()

    # Sumar columna precio
    total_money = db.query(func.sum(Reservation.price)).scalar() or 0.0

    # Instalación más popular
    popular = db.query(
        Reservation.facility, func.count(Reservation.id)
    ).group_by(Reservation.facility).order_by(func.count(Reservation.id).desc()).first()

    popular_name = popular[0] if popular else "N/A"

    return {
        "total_reservations": total_res,
        "total_earnings": round(total_money, 2),
        "popular_facility": popular_name
    }


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Permitir borrar si es el dueño O si es admin
    if res.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permiso")

    db.delete(res)
    db.commit()
    return None