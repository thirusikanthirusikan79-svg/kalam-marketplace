"""
Kalam Agricultural Marketplace - Translation Microservice
Service Name: translation_service
Port: 8004

Features:
- Multi-language translation between English ('en'), Tamil ('ta'), and Sinhala ('si').
- Structured agricultural dictionary for farm produce, market terminology, and UI labels.
- Dual-mode translation engine:
    1. Exact phrase / sentence dictionary matching.
    2. Sub-token & phrase-level replacement engine for composite agricultural phrases.
    3. Graceful fallback for non-dictionary entities with language tag annotations.
- Endpoint:
    POST /translate accepting { "text": "...", "target_language": "ta", "source_language": "en" }
    POST /translate/batch for translating multiple UI strings at once.
    GET /dictionary for inspecting term mappings.
- Full CORS middleware, Pydantic validation, structured exceptions.
"""

from enum import Enum
import re
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


class SupportedLanguage(str, Enum):
    EN = "en"
    TA = "ta"
    SI = "si"


# -----------------------------------------------------------------------------
# Structured Trilingual Agricultural & Marketplace Dictionary
# -----------------------------------------------------------------------------
AGRICULTURAL_DICTIONARY: Dict[str, Dict[str, str]] = {
    # Marketplace Branding & UI Headers
    "kalam": {"en": "Kalam", "ta": "களம்", "si": "කලම්"},
    "direct from farm": {"en": "Direct from Farm", "ta": "பண்ணையிலிருந்து நேரடியாக", "si": "ගොවිපලෙන් සෘජුවම"},
    "farmer - dashboard!": {"en": "Farmer - Dashboard!", "ta": "விவசாயி - கட்டுப்பாட்டு அறை!", "si": "ගොවි - පාලක පුවරුව!"},
    "a direct marketplace connecting and buyers.": {
        "en": "A direct marketplace connecting farmers and buyers.",
        "ta": "விவசாயிகளையும் நுகர்வோரையும் நேரடியாக இணைக்கும் சந்தை.",
        "si": "ගොවීන් සහ ගැනුම්කරුවන් සෘජුවම සම්බන්ධ කරන වෙළඳපොළ."
    },
    "marketplace analytics": {"en": "Marketplace Analytics", "ta": "சந்தை பகுப்பாய்வு", "si": "වෙළඳපොළ විශ්ලේෂණ"},
    "moderation guidelines": {"en": "Moderation Guidelines", "ta": "வழிகாட்டல்", "si": "මග පෙන්වීම"},
    "translate to sinhala": {"en": "Translate to Sinhala", "ta": "சிங்களத்திற்கு மொழிபெயர்", "si": "සිංහලට පරිවර්තනය කරන්න"},
    "translate to tamil": {"en": "Translate to Tamil", "ta": "தமிழுக்கு மொழிபெயர்", "si": "දෙමළට පරිවර්තනය කරන්න"},

    # Categories
    "crop categories": {"en": "Crop Categories", "ta": "பயிர் வகைகள்", "si": "බෝග වර්ග"},
    "vegetables": {"en": "Vegetables", "ta": "காய்கறிகள்", "si": "එළවළු"},
    "fruits": {"en": "Fruits", "ta": "பழங்கள்", "si": "පලතුරු"},
    "grains": {"en": "Grains", "ta": "தானியங்கள்", "si": "ධාන්‍ය"},
    "spices": {"en": "Spices", "ta": "மசாலா பொருட்கள்", "si": "කුළුබඩු"},

    # Crop Names
    "potatoes": {"en": "Potatoes", "ta": "உருளைக்கிழங்கு", "si": "අල"},
    "carrots": {"en": "Carrots", "ta": "கேரட்", "si": "කැරට්"},
    "bulk grains": {"en": "Bulk Grains", "ta": "மொத்த தானியங்கள்", "si": "තොග ධාන්‍ය"},
    "red chillies": {"en": "Red Chillies", "ta": "சிவப்பு மிளகாய்", "si": "රතු මිරිස්"},
    "papayas": {"en": "Papayas", "ta": "பப்பாளி", "si": "පැපොල්"},
    "yellow bananas": {"en": "Yellow Bananas", "ta": "வாழைப்பழம்", "si": "කෙසෙල්"},
    "onions": {"en": "Onions", "ta": "வெங்காயம்", "si": "ලූනු"},
    "tomatoes": {"en": "Tomatoes", "ta": "தக்காளி", "si": "තක්කාලි"},

    # Financial & Marketplace Actions
    "earnings": {"en": "Earnings", "ta": "வருவாய்", "si": "ආදායම"},
    "orders": {"en": "Orders", "ta": "ஆர்டர்கள்", "si": "ඇණවුම්"},
    "my crops": {"en": "My Crops", "ta": "எனது பயிர்கள்", "si": "මගේ බෝග"},
    "add crop": {"en": "Add Crop", "ta": "பயிர் சேர்க்க", "si": "බෝගයක් එක් කරන්න"},
    "add listing": {"en": "Add Listing", "ta": "விளம்பரம் சேர்க்க", "si": "ලැයිස්තුගත කිරීමක් එක් කරන්න"},
    "details": {"en": "Details", "ta": "விவரம்", "si": "විස්තර"},
    "buy": {"en": "Buy", "ta": "வாங்கு", "si": "මිලදී ගන්න"},
    "buy now": {"en": "Buy Now", "ta": "இப்போதே வாங்குங்கள்", "si": "දැන්ම මිලදී ගන්න"},
    "farmer login": {"en": "Farmer Login", "ta": "விவசாயி உள்நுழைவு", "si": "ගොවි පිවිසුම"},
    "buyer login": {"en": "Buyer Login", "ta": "நுகர்வோர் உள்நுழைவு", "si": "ගැනුම්කරු පිවිසුම"},
    "admin login": {"en": "Admin Login", "ta": "நிர்வாகி உள்நுழைவு", "si": "පරිපාලක පිවිසුම"},
    "available crops": {"en": "Available Crops", "ta": "கிடைக்கும் பயிர்கள்", "si": "ලබා ගත හැකි බෝග"},
    "platform commission fees collected": {
        "en": "Platform Commission Fees Collected",
        "ta": "சேகரிக்கப்பட்ட தள தரகு கட்டணம்",
        "si": "එකතු කරන ලද වේදිකා කොමිස් ගාස්තු"
    },
    "user registration trends": {
        "en": "User Registration Trends",
        "ta": "பயனர் பதிவு போக்குகள்",
        "si": "පරිශීලක ලියාපදිංචි ප්‍රවණතා"
    },
    "total transactions": {
        "en": "Total Transactions",
        "ta": "மொத்த பரிவர்த்தனைகள்",
        "si": "මුළු ගනුදෙනු"
    },
    "quantity": {"en": "Quantity", "ta": "அளவு", "si": "ප්‍රමාණය"},
    "price": {"en": "Price", "ta": "விலை", "si": "මිල"},
    "producer": {"en": "Producer", "ta": "உற்பத்தியாளர்", "si": "නිෂ්පාදකයා"},
    "rating": {"en": "Rating", "ta": "மதிப்பீடு", "si": "ශ්‍රේණිගත කිරීම"},
    "location": {"en": "Location", "ta": "இடம்", "si": "ස්ථානය"},
    "settings": {"en": "Settings", "ta": "அமைப்புகள்", "si": "සැකසුම්"},
    "home": {"en": "Home", "ta": "முகப்பு", "si": "මුල් පිටුව"},
}


# -----------------------------------------------------------------------------
# Translation Engine
# -----------------------------------------------------------------------------
def perform_translation(
    text: str,
    target_lang: SupportedLanguage,
    source_lang: Optional[SupportedLanguage] = None
) -> tuple[str, str, float]:
    """
    Translates input text into the target language.
    Returns: (translated_text, method_used, confidence_score)
    """
    cleaned = text.strip()
    norm_key = cleaned.lower()

    target_code = target_lang.value

    # 1. Direct exact dictionary match
    if norm_key in AGRICULTURAL_DICTIONARY:
        mapping = AGRICULTURAL_DICTIONARY[norm_key]
        if target_code in mapping:
            return mapping[target_code], "dictionary_exact", 1.0

    # 2. Check if text is in reverse language (e.g., translating Tamil/Sinhala back to English/Sinhala)
    for key, mapping in AGRICULTURAL_DICTIONARY.items():
        for lang_code, trans_val in mapping.items():
            if trans_val.lower() == norm_key:
                return mapping.get(target_code, mapping.get("en", cleaned)), "dictionary_reverse", 0.95

    # 3. Sub-phrase & Token-level translation for composite phrases
    translated_tokens = cleaned
    matched_any = False

    # Sort dictionary entries by descending length to match longest phrases first
    sorted_phrases = sorted(AGRICULTURAL_DICTIONARY.keys(), key=lambda k: len(k), reverse=True)

    for phrase in sorted_phrases:
        if phrase in translated_tokens.lower():
            target_term = AGRICULTURAL_DICTIONARY[phrase].get(target_code)
            if target_term:
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                translated_tokens = pattern.sub(target_term, translated_tokens)
                matched_any = True

    if matched_any:
        return translated_tokens, "dictionary_tokenized", 0.88

    # 4. Graceful fallback
    return cleaned, "fallback", 0.60


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, example="Potatoes", description="Text to translate")
    target_language: SupportedLanguage = Field(..., example=SupportedLanguage.TA, description="Target language ('en', 'ta', or 'si')")
    source_language: Optional[SupportedLanguage] = Field(None, example=SupportedLanguage.EN)


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    source_language: Optional[str]
    confidence: float
    method: str
    service: str = "translation_service"


class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)
    target_language: SupportedLanguage = Field(..., example=SupportedLanguage.SI)


class BatchTranslationResponse(BaseModel):
    results: List[TranslationResponse]
    target_language: str
    count: int


# -----------------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Kalam Translation Microservice",
    description="Multi-language agricultural translation service supporting English, Tamil, and Sinhala",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "service": "translation_service",
            "success": False,
            "error_code": f"ERR_{exc.status_code}",
            "detail": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "service": "translation_service",
            "success": False,
            "error_code": "ERR_INTERNAL_SERVER",
            "detail": str(exc),
        },
    )


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "service": "translation_service",
        "status": "healthy",
        "supported_languages": ["en", "ta", "si"],
        "dictionary_size": len(AGRICULTURAL_DICTIONARY)
    }


@app.post(
    "/translate",
    response_model=TranslationResponse,
    tags=["Translation"],
    summary="Translate text between English, Tamil, and Sinhala"
)
def translate_text(payload: TranslationRequest):
    translated, method, confidence = perform_translation(
        text=payload.text,
        target_lang=payload.target_language,
        source_lang=payload.source_language
    )

    return TranslationResponse(
        original_text=payload.text,
        translated_text=translated,
        target_language=payload.target_language.value,
        source_language=payload.source_language.value if payload.source_language else None,
        confidence=confidence,
        method=method,
    )


@app.post(
    "/translate/batch",
    response_model=BatchTranslationResponse,
    tags=["Translation"],
    summary="Batch translate multiple agricultural UI labels or crop names"
)
def translate_batch(payload: BatchTranslationRequest):
    results = []
    for item in payload.texts:
        translated, method, confidence = perform_translation(
            text=item,
            target_lang=payload.target_language
        )
        results.append(
            TranslationResponse(
                original_text=item,
                translated_text=translated,
                target_language=payload.target_language.value,
                source_language="auto",
                confidence=confidence,
                method=method,
            )
        )

    return BatchTranslationResponse(
        results=results,
        target_language=payload.target_language.value,
        count=len(results)
    )


@app.get(
    "/dictionary",
    tags=["Dictionary"],
    summary="Retrieve agricultural term dictionary catalog"
)
def get_dictionary():
    return {
        "total_terms": len(AGRICULTURAL_DICTIONARY),
        "supported_languages": ["en", "ta", "si"],
        "terms": AGRICULTURAL_DICTIONARY
    }


# Run with: uvicorn main:app --host 0.0.0.0 --port 8004 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)
