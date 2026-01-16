from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservationBase(BaseModel):
    facility: str     
    start_time: datetime
    end_time: datetime

class ReservationCreate(ReservationBase):
    pass

class ReservationResponse(ReservationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True