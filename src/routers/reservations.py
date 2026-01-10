from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import and_

from src.db.session import get_db
from src.core.deps import get_current_user
from src.models.user_model import User
from src.models.reservation_model import Reservation
from src.schemas.reservation_schema import ReservationCreate, ReservationResponse

router = APIRouter()


@router.post("/", response_model=ReservationResponse)
def create_reservation(
        reservation: ReservationCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Validar lógica básica de fechas
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(
            status_code=400,
            detail="La hora de inicio debe ser anterior a la de fin"
        )

    #cValidar disponibilidad
    overlapping_reservation = db.query(Reservation).filter(
        Reservation.facility == reservation.facility,
        Reservation.start_time < reservation.end_time,
        Reservation.end_time > reservation.start_time
    ).first()

    if overlapping_reservation:
        raise HTTPException(
            status_code=409,
            detail="La pista ya está reservada en ese horario"
        )

    # Crear la reserva si todo está libre
    new_reservation = Reservation(
        facility=reservation.facility,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        user_id=current_user.id
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    return new_reservation


@router.get("/me", response_model=List[ReservationResponse])
def read_my_reservations(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    return db.query(Reservation).filter(Reservation.user_id == current_user.id).all()


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_reservation(
        reservation_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Buscar la reserva
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Verificar que la reserva pertenece al usuario (o es admin)
    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para cancelar esta reserva"
        )

    # 3. Borrar
    db.delete(reservation)
    db.commit()
    return None