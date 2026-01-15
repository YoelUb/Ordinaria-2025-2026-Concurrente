from sqlalchemy import Column, Integer, String, Float
from src.db.base import Base

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    capacity = Column(Integer, nullable=False, default=1)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    description = Column(String, nullable=True)