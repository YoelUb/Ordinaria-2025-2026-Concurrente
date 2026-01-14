from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
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
    # 1. Validar lógica de fechas básica
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La hora de inicio debe ser anterior a la de fin"
        )

    # 2. Crear la reserva
    new_reservation = Reservation(
        facility=reservation.facility,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        user_id=current_user.id
    )

    try:
        db.add(new_reservation)
        db.commit()
        db.refresh(new_reservation)
        return new_reservation

    except IntegrityError:
        # 3. CAPTURAR EL ERROR DE DUPLICADO
        db.rollback()  # Cancelar la transacción
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="¡Ups! Alguien ha sido más rápido y acaba de reservar este horario."
        )
    except Exception as e:
        db.rollback()
        print(f"Error creando reserva: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar la reserva"
        )


@router.get("/me", response_model=List[ReservationResponse])
def read_my_reservations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Añadimos order_by para que salgan ordenadas
    return db.query(Reservation).filter(Reservation.user_id == current_user.id).order_by(
        Reservation.start_time.desc()).all()


@router.get("/availability")
def get_availability(facility: str, date_str: str, db: Session = Depends(get_db)):
    try:
        # Aseguramos que solo leemos la parte de la fecha
        search_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido (YYYY-MM-DD)")

    # Optimizamos la consulta
    reservations = db.query(Reservation).filter(
        Reservation.facility == facility,
        func.date(Reservation.start_time) == search_date
    ).all()

    return [{"start": r.start_time.strftime("%H:%M"), "end": r.end_time.strftime("%H:%M")} for r in reservations]


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Verificar que la reserva sea del usuario
    if res.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar esta reserva")

    db.delete(res)
    db.commit()
    return None