from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Translation Service", version="1.0")

class TranslateRequest(BaseModel):
    text: str
    target_language: str  # 'ta' for Tamil, 'si' for Sinhala, 'en' for English

@app.post("/translate")
def translate_text(req: TranslateRequest):
    # Basic simulation of translation layer for Kalam marketplace
    # In production, this can be integrated with Google Translate or a local AI model.
    translated_mock_text = f"[{req.target_language.upper()} Translation]: {req.text}"
    
    return {
        "original_text": req.text,
        "target_language": req.target_language,
        "translated_text": translated_mock_text
    }
