
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile


AUDIO_DIR = Path(__file__).resolve().parent.parent / "data" / "audio"

ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".m4a",
    ".webm",
    ".ogg",
}

MAX_AUDIO_SIZE = 20 * 1024 * 1024  # 20 MB


async def save_audio_file(file: UploadFile):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format"
        )

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4()}{extension}"
    destination = AUDIO_DIR / filename

    total_size = 0

    try:
        with destination.open("wb") as audio_file:
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)

                if total_size > MAX_AUDIO_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Audio file exceeds 20 MB"
                    )

                audio_file.write(chunk)

    except Exception:
        destination.unlink(missing_ok=True)
        raise

    finally:
        await file.close()

    return {
        "filename": filename,
        "size_bytes": total_size,
        "path": str(destination)
    }
