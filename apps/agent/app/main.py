from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from app.audio_storage import save_audio_file
from contextlib import asynccontextmanager
from app.transcription import transcribe_audio
from app.audio_storage import AUDIO_DIR
from app.extraction import extract_family_record
from app.schemas import FamilyRecord
from app.database import (
    initialize_database,
    save_record,
    get_record,
    list_records,
    update_record
)
@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Field Data Collection API",
    description="API para recopilar y estructurar información de entrevistas de campo.",
    version="0.2.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://bustxd.github.io",
    ],


@app.get("/")
def root():
    return {"message": "Field Data Collection API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/records", status_code=201)
def create_record(record: FamilyRecord):
    return save_record(record)

@app.get("/records")
def read_records():
    return list_records()

@app.get("/records/{record_id}")
def read_record(record_id: str):
    record = get_record(record_id)

    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")

    return record

@app.put("/records/{record_id}")
def edit_record(record_id: str, record: FamilyRecord):
    updated_record = update_record(record_id, record)

    if updated_record is None:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )

    return updated_record
@app.post("/audio/upload", status_code=201)
async def upload_audio(file: UploadFile = File(...)):
    return await save_audio_file(file)
@app.post("/audio/transcribe")
def transcribe_uploaded_audio(filename: str):
    audio_path = (
        Path(__file__).resolve().parent.parent
        / "data"
        / "audio"
        / filename
    )

    if not audio_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Audio file not found"
        )

    try:
        return transcribe_audio(str(audio_path))
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

@app.post("/audio/process")
def process_uploaded_audio(filename: str):
    # Evitar nombres de archivo con rutas externas
    if Path(filename).name != filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename"
        )

    audio_path = (AUDIO_DIR / filename).resolve()

    if audio_path.parent != AUDIO_DIR.resolve():
        raise HTTPException(
            status_code=400,
            detail="Invalid audio path"
        )

    if not audio_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Audio file not found"
        )

    try:
        # 1. Transcribir audio
        transcription_result = transcribe_audio(str(audio_path))

        transcription = transcription_result["transcription"]

        if not transcription.strip():
            raise HTTPException(
                status_code=422,
                detail="No speech detected in audio"
            )

        # 2. Extraer información estructurada
        family_record = extract_family_record(transcription)

        # 3. Devolver resultado para revisión humana
        return {
            "status": "pending_review",
            "transcription": transcription,
            "record": family_record.model_dump(mode="json")
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Audio processing failed"
        )
