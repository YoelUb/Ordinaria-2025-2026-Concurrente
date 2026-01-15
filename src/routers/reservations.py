from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.db.session import get_db
from src.core.deps import get_current_user, get_current_admin
from src.models.user_model import User
from src.models.reservation_model import Reservation
from src.schemas.reservation_schema import ReservationCreate, ReservationResponse
from pydantic import BaseModel

router = APIRouter()

# --- CONFIGURACIÓN: PRECIOS Y AFORO ---
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

    # 2. Configuración
    config = FACILITIES_CONFIG.get(reservation.facility)
    if not config:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")

    # 3. EVITAR DUPLICADOS DEL MISMO USUARIO
    # Comprobamos si este usuario YA tiene reserva en ese hueco
    already_booked = db.query(Reservation).filter(
        Reservation.user_id == current_user.id,
        Reservation.facility == reservation.facility,
        Reservation.start_time < reservation.end_time,
        Reservation.end_time > reservation.start_time
    ).first()

    if already_booked:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una plaza reservada en este horario."
        )

    # 4. CONTROL DE AFORO (CAPACIDAD)
    # Contamos cuántas personas hay en total en ese intervalo
    existing_count = db.query(Reservation).filter(
        Reservation.facility == reservation.facility,
        Reservation.start_time < reservation.end_time,
        Reservation.end_time > reservation.start_time
    ).count()

    if existing_count >= config["capacity"]:
        raise HTTPException(
            status_code=409,
            detail=f"Aforo completo ({existing_count}/{config['capacity']} plazas ocupadas)."
        )

    # 5. Crear reserva con precio calculado
    price_with_tax = config["price"] * 1.21

    new_reservation = Reservation(
        facility=reservation.facility,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        user_id=current_user.id,
        price=round(price_with_tax, 2)
    )

    try:
        db.add(new_reservation)
        db.commit()
        db.refresh(new_reservation)
        return new_reservation
    except Exception as e:
        db.rollback()
        print(f"Error creando reserva: {e}")
        raise HTTPException(status_code=500, detail="Error interno al guardar reserva")


@router.get("/me", response_model=List[ReservationResponse])
def read_my_reservations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Devuelve las reservas del usuario para el Dashboard.
    """
    return db.query(Reservation) \
        .filter(Reservation.user_id == current_user.id) \
        .order_by(Reservation.start_time.desc()) \
        .all()


@router.get("/availability")
def get_availability(facility: str, date_str: str, db: Session = Depends(get_db)):
    """
    Devuelve el estado de ocupación de los horarios reservados.
    Incluye 'count' (ocupados) y 'capacity' (total) para que el front muestre 'X de Y'.
    """
    try:
        search_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato fecha inválido (YYYY-MM-DD)")

    config = FACILITIES_CONFIG.get(facility)
    if not config:
        return []

    # Obtener reservas del día
    reservations = db.query(Reservation).filter(
        Reservation.facility == facility,
        func.date(Reservation.start_time) == search_date
    ).all()

    # Agrupar por hora de inicio
    slots_data = {}
    for res in reservations:
        start_iso = res.start_time.isoformat()

        if start_iso not in slots_data:
            slots_data[start_iso] = {
                "start": start_iso,
                "end": res.end_time.isoformat(),
                "count": 0,
                "capacity": config["capacity"]
            }

        slots_data[start_iso]["count"] += 1

    # Devolvemos la lista de slots que tienen al menos 1 reserva
    # El frontend usará 'count' y 'capacity' para mostrar "2 de 10" o pintar colores
    return list(slots_data.values())


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)
):
    """Estadísticas para el administrador (dinero y reservas totales)"""
    total_res = db.query(Reservation).count()
    # Sumar el campo precio de todas las reservas
    total_money = db.query(func.sum(Reservation.price)).scalar() or 0.0

    popular = db.query(
        Reservation.facility, func.count(Reservation.id)
    ).group_by(Reservation.facility).order_by(func.count(Reservation.id).desc()).first()

    popular_name = popular[0] if popular else "Sin datos"

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

    # Solo el dueño o el admin pueden borrar
    if res.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permiso")

    db.delete(res)
    db.commit()
    return None