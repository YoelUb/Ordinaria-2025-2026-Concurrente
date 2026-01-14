from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ExcludeConstraint
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

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relación
    user = relationship("User", back_populates="reservations")

    # --- BLINDAJE ANTI-DUPLICADOS ---
    __table_args__ = (
        ExcludeConstraint(
            ("facility", "="),
            (func.tstzrange(start_time, end_time, '[]'), '&&'),
            using="gist",
            name="exclude_reservation_overlap",
        ),
    )