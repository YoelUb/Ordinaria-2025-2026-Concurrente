"""Crear tabla usuarios

Revision ID: 6b2c6a281dd3
Revises:
Create Date: 2024-01-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6b2c6a281dd3'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('full_name', sa.String(), nullable=True),
                    sa.Column('email', sa.String(), nullable=False),
                    sa.Column('hashed_password', sa.String(), nullable=False),
                    sa.Column('role', sa.String(), server_default='user', nullable=True),
                    sa.Column('avatar_url', sa.String(), nullable=True),
                    sa.Column('apartment', sa.String(), nullable=True),
                    sa.Column('phone', sa.String(), nullable=True),
                    sa.Column('address', sa.String(), nullable=True),
                    sa.Column('postal_code', sa.String(), nullable=True),
                    sa.Column('is_active', sa.Boolean(), nullable=True),
                    sa.Column('is_superuser', sa.Boolean(), nullable=True),
                    sa.Column('verification_code', sa.String(), nullable=True),
                    sa.Column('verification_code_expires_at', sa.DateTime(timezone=True), nullable=True),
                    sa.Column('reset_password_code', sa.String(), nullable=True),
                    sa.Column('reset_password_code_expires_at', sa.DateTime(timezone=True), nullable=True),
                    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
                    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_full_name'), 'users', ['full_name'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_full_name'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')