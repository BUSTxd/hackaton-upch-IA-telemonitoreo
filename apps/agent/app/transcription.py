
from functools import lru_cache

from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_whisper_model():
    return WhisperModel(
        "base",
        device="cpu",
        compute_type="int8"
    )


def transcribe_audio(audio_path: str) -> dict:
    model = get_whisper_model()

    segments, info = model.transcribe(
        audio_path,
        language="es",
        beam_size=5,
        vad_filter=True
    )

    transcription = " ".join(
        segment.text.strip()
        for segment in segments
    )

    return {
        "language": info.language,
        "language_probability": info.language_probability,
        "transcription": transcription
    }
