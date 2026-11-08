
import sqlite3
import json
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "records.db"


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS family_records (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                data TEXT NOT NULL
            )
        """)


def save_record(record):
    record_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO family_records (id, created_at, data)
            VALUES (?, ?, ?)
            """,
            (
                record_id,
                created_at,
                record.model_dump_json()
            )
        )

    return {
        "id": record_id,
        "created_at": created_at,
        "data": json.loads(record.model_dump_json())
    }


def get_record(record_id):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT id, created_at, data FROM family_records WHERE id = ?",
            (record_id,)
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "data": json.loads(row["data"])
    }
def list_records():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, created_at, data
            FROM family_records
            ORDER BY created_at DESC
            """
        ).fetchall()

    return [
        {
            "id": row["id"],
            "created_at": row["created_at"],
            "data": json.loads(row["data"])
        }
        for row in rows
    ]


def update_record(record_id, record):
    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id, created_at FROM family_records WHERE id = ?",
            (record_id,)
        ).fetchone()

        if existing is None:
            return None

        connection.execute(
            "UPDATE family_records SET data = ? WHERE id = ?",
            (record.model_dump_json(), record_id)
        )

    return {
        "id": record_id,
        "created_at": existing["created_at"],
        "data": json.loads(record.model_dump_json())
    }
