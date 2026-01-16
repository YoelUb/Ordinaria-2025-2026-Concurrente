"""Crear tabla reservas y facilities

Revision ID: 22cb26324bb5
Revises: 6b2c6a281dd3
Create Date: 2026-01-10 17:23:39.941276

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '22cb26324bb5'
down_revision: Union[str, None] = '6b2c6a281dd3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Necesaria para guardar precios, aforo, iconos y colores de forma dinámica
    op.create_table('facilities',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(), nullable=False),
                    sa.Column('price', sa.Float(), server_default='0.0', nullable=False),
                    sa.Column('capacity', sa.Integer(), server_default='1', nullable=False),
                    sa.Column('icon', sa.String(), nullable=True),
                    sa.Column('color', sa.String(), nullable=True),
                    sa.Column('description', sa.String(), nullable=True),
                    sa.PrimaryKeyConstraint('id')
                    )
    # Índices para facilities
    op.create_index(op.f('ix_facilities_id'), 'facilities', ['id'], unique=False)
    op.create_index(op.f('ix_facilities_name'), 'facilities', ['name'], unique=True)

    # --- 2. CREAR TABLA RESERVATIONS ---
    op.create_table('reservations',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('user_id', sa.Integer(), nullable=False),
                    sa.Column('facility', sa.String(), nullable=False),
                    sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
                    sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
                    sa.Column('status', sa.String(), server_default='confirmed', nullable=False),
                    sa.Column('price', sa.Float(), server_default='0.0', nullable=False),
                    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
                    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
                    # Cascade para borrar reservas si se borra el usuario
                    sa.PrimaryKeyConstraint('id')
                    )

    op.create_index(op.f('ix_reservations_facility'), 'reservations', ['facility'], unique=False)
    op.create_index(op.f('ix_reservations_id'), 'reservations', ['id'], unique=False)


def downgrade() -> None:
    # Orden inverso para borrar
    op.drop_index(op.f('ix_reservations_id'), table_name='reservations')
    op.drop_index(op.f('ix_reservations_facility'), table_name='reservations')
    op.drop_table('reservations')

    op.drop_index(op.f('ix_facilities_name'), table_name='facilities')
    op.drop_index(op.f('ix_facilities_id'), table_name='facilities')
    op.drop_table('facilities')