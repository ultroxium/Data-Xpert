"""create feedback table

Revision ID: fb138226608d
Revises: 1de95ddc580d
Create Date: 2025-01-26 12:36:25.014289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'fb138226608d'
down_revision: Union[str, None] = '1de95ddc580d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('feedback',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('message', sa.String(), nullable=False),
    sa.Column('date', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('feedback')