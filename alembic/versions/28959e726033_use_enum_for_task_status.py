"""use enum for task status

Revision ID: 28959e726033
Revises: f6d6be287ae8
Create Date: 2025-12-29 23:53:58.754853

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28959e726033'
down_revision: Union[str, Sequence[str], None] = 'f6d6be287ae8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Create enum type
    task_status_enum = sa.Enum(
        'TODO',
        'IN_PROGRESS',
        'DONE',
        name='task_status_enum'
    )
    task_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Explicitly cast existing values
    op.execute(
        "ALTER TABLE tasks "
        "ALTER COLUMN status "
        "TYPE task_status_enum "
        "USING status::task_status_enum"
    )




def downgrade():
    op.execute(
        "ALTER TABLE tasks "
        "ALTER COLUMN status "
        "TYPE VARCHAR "
        "USING status::text"
    )

    sa.Enum(
        'TODO',
        'IN_PROGRESS',
        'DONE',
        name='task_status_enum'
    ).drop(op.get_bind(), checkfirst=True)


