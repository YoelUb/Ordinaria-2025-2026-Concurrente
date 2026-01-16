from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db.base import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Detalles de la reserva
    facility = Column(String, index=True, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)

    # Campo nuevo para guardar el precio pagado
    price = Column(Float, nullable=False, default=0.0)

    status = Column(String, default="confirmed")  # Opcional, útil para el dashboard

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relación con Usuario
    user = relationship("User", back_populates="reservations")