from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.db.session import get_db
from src.core.deps import get_current_user, get_current_admin
from src.models.user_model import User
from src.models.reservation_model import Reservation
from src.models.facility_model import Facility
from src.schemas.reservation_schema import ReservationCreate, ReservationResponse
from pydantic import BaseModel

router = APIRouter()


# Modelo para las estadísticas del admin
class AdminStats(BaseModel):
    total_reservations: int
    total_earnings: float
    popular_facility: str


# Gestión de instalaciones 

@router.get("/facilities")
def get_facilities(db: Session = Depends(get_db)):
    """
    Devuelve la configuración actual (precios y aforo) de todas las instalaciones.
    El frontend usa esto para pintar la interfaz dinámicamente.
    """
    return db.query(Facility).all()


@router.put("/facilities/{facility_id}")
def update_facility(
        facility_id: int,
        price: float,
        capacity: int,
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)  # Solo admin puede cambiar precios
):
    """Permite al administrador cambiar precio y capacidad en tiempo real"""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")

    facility.price = price
    facility.capacity = capacity
    db.commit()
    return {"message": f"Instalación {facility.name} actualizada correctamente"}


# Gestión de reservas

@router.post("/", response_model=ReservationResponse)
def create_reservation(
        reservation: ReservationCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Validar fechas
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser anterior a la de fin")

    facility_conf = db.query(Facility)\
        .filter(Facility.name == reservation.facility)\
        .with_for_update()\
        .first()

    if not facility_conf:
        raise HTTPException(status_code=404, detail="Instalación no encontrada o no disponible")

    # Evitar duplicados 
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

    # Control de aforo
    existing_count = db.query(Reservation).filter(
        Reservation.facility == reservation.facility,
        Reservation.start_time < reservation.end_time,
        Reservation.end_time > reservation.start_time
    ).count()

    if existing_count >= facility_conf.capacity:
        raise HTTPException(
            status_code=409,
            detail=f"Aforo completo ({existing_count}/{facility_conf.capacity} plazas ocupadas)."
        )

    # Calcular precio (Precio base de BD + 21% IVA)
    price_with_tax = facility_conf.price * 1.21

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


@router.get("/", response_model=List[ReservationResponse])
def read_all_reservations(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Endpoint general.
    - Si es ADMIN: Devuelve TODAS las reservas (para el panel de control).
    - Si es USER: Devuelve solo las suyas.
    """
    if current_user.role == "admin":
        return db.query(Reservation).order_by(Reservation.start_time.desc()).all()
    else:
        return db.query(Reservation).filter(Reservation.user_id == current_user.id).order_by(
            Reservation.start_time.desc()).all()


@router.get("/me", response_model=List[ReservationResponse])
def read_my_reservations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Devuelve las reservas del usuario actual"""
    return db.query(Reservation) \
        .filter(Reservation.user_id == current_user.id) \
        .order_by(Reservation.start_time.desc()) \
        .all()


@router.get("/availability")
def get_availability(facility: str, date_str: str, db: Session = Depends(get_db)):
    """
    Devuelve ocupación real vs capacidad de la BD.
    Aquí NO hace falta bloqueo porque es solo lectura.
    """
    try:
        search_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato fecha inválido (YYYY-MM-DD)")

    # Buscar configuración en BD
    facility_conf = db.query(Facility).filter(Facility.name == facility).first()
    if not facility_conf:
        return []

    # Obtener reservas
    reservations = db.query(Reservation).filter(
        Reservation.facility == facility,
        func.date(Reservation.start_time) == search_date
    ).all()

    # Agrupar
    slots_data = {}
    for res in reservations:
        start_iso = res.start_time.isoformat()

        if start_iso not in slots_data:
            slots_data[start_iso] = {
                "start": start_iso,
                "end": res.end_time.isoformat(),
                "count": 0,
                "capacity": facility_conf.capacity  # Capacidad dinámica de la BD
            }

        slots_data[start_iso]["count"] += 1

    return list(slots_data.values())


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)
):
    """Estadísticas financieras y de uso"""
    total_res = db.query(Reservation).count()
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

    # Solo dueño o admin pueden borrar
    if res.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permiso")

    db.delete(res)
    db.commit()
    return None
