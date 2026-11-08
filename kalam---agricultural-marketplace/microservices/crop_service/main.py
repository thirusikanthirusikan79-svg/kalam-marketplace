"""
Kalam Agricultural Marketplace - Crop Microservice
Service Name: crop_service
Port: 8002
Database: SQLite ('crops.db')

Features:
- SQLite connection ('crops.db') with automatic table creation via SQLAlchemy ORM.
- Pydantic schemas for Crop listing (name, category, price_per_kg, quantity_available, seller_id, location).
- Endpoints:
    POST /crops (Add new crop listing)
    GET /crops (List all crops with optional filtering)
    GET /crops/{crop_id} (Retrieve specific crop details)
    DELETE /crops/{crop_id} (Remove listing)
- Full CORS middleware & structured exception handling.
- Seed data included based on the Kalam marketplace wireframe.
"""

import os
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# -----------------------------------------------------------------------------
# Database Setup
# -----------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crops.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CropCategory(str, Enum):
    VEGETABLES = "Vegetables"
    FRUITS = "Fruits"
    GRAINS = "Grains"
    SPICES = "Spices"
    OTHER = "Other"


class CropModel(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    price_per_kg = Column(Float, nullable=False)
    quantity_available = Column(Float, nullable=False)
    seller_id = Column(Integer, nullable=False, index=True)
    seller_name = Column(String(100), nullable=False, default="Local Producer")
    location = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Automatic schema generation
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class CropCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="Potatoes")
    category: CropCategory = Field(default=CropCategory.VEGETABLES, example=CropCategory.VEGETABLES)
    price_per_kg: float = Field(..., gt=0, example=200.0, description="Price per Kilogram in LKR")
    quantity_available: float = Field(..., gt=0, example=500.0, description="Available stock in Kg")
    seller_id: int = Field(..., gt=0, example=2, description="User ID of the farmer")
    seller_name: Optional[str] = Field("Thulasi's Farm", example="Thulasi's Farm")
    location: str = Field(..., min_length=2, max_length=120, example="Jaffna / Dambulla")
    description: Optional[str] = Field(None, example="Freshly harvested farm-grade potatoes without pesticides.")
    image_url: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500")


class CropUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[CropCategory] = None
    price_per_kg: Optional[float] = Field(None, gt=0)
    quantity_available: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class CropResponse(BaseModel):
    id: int
    name: str
    category: str
    price_per_kg: float
    quantity_available: float
    seller_id: int
    seller_name: str
    location: str
    description: Optional[str]
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Kalam Crop Microservice",
    description="Crop listing and inventory management for Kalam Agricultural Marketplace",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "service": "crop_service",
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
            "service": "crop_service",
            "success": False,
            "error_code": "ERR_INTERNAL_SERVER",
            "detail": str(exc),
        },
    )


# -----------------------------------------------------------------------------
# Seed Default Crops from Wireframe Layout
# -----------------------------------------------------------------------------
@app.on_event("startup")
def seed_default_crops():
    db = SessionLocal()
    try:
        if db.query(CropModel).count() == 0:
            sample_crops = [
                {
                    "name": "Potatoes",
                    "category": CropCategory.VEGETABLES.value,
                    "price_per_kg": 200.0,
                    "quantity_available": 1250.0,
                    "seller_id": 2,
                    "seller_name": "Thulasi's Farm",
                    "location": "Jaffna Northern District",
                    "description": "Graded table potatoes directly from red soil fields.",
                    "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop",
                },
                {
                    "name": "Carrots",
                    "category": CropCategory.VEGETABLES.value,
                    "price_per_kg": 260.0,
                    "quantity_available": 850.0,
                    "seller_id": 2,
                    "seller_name": "Thulasi's Farm",
                    "location": "Nuwara Eliya High Plains",
                    "description": "Crunchy mountain carrots rich in beta carotene.",
                    "image_url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop",
                },
                {
                    "name": "Bulk Grains (Paddy)",
                    "category": CropCategory.GRAINS.value,
                    "price_per_kg": 150.0,
                    "quantity_available": 5000.0,
                    "seller_id": 2,
                    "seller_name": "Polonnaruwa Harvest Guild",
                    "location": "Polonnaruwa",
                    "description": "High yield Samba paddy harvested this week.",
                    "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop",
                },
                {
                    "name": "Red Chillies",
                    "category": CropCategory.SPICES.value,
                    "price_per_kg": 250.0,
                    "quantity_available": 420.0,
                    "seller_id": 2,
                    "seller_name": "Dry Zone Agri Cooperative",
                    "location": "Anuradhapura",
                    "description": "Spicy, sun-dried dry zone red chillies.",
                    "image_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop",
                },
                {
                    "name": "Papayas",
                    "category": CropCategory.FRUITS.value,
                    "price_per_kg": 120.0,
                    "quantity_available": 600.0,
                    "seller_id": 2,
                    "seller_name": "Rajarata Fruits Group",
                    "location": "Dambulla Economic Center",
                    "description": "Sweet red lady papayas ready for retail and wholesale.",
                    "image_url": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&auto=format&fit=crop",
                },
                {
                    "name": "Yellow Bananas (Ambul)",
                    "category": CropCategory.FRUITS.value,
                    "price_per_kg": 180.0,
                    "quantity_available": 900.0,
                    "seller_id": 2,
                    "seller_name": "Embilipitiya Orchards",
                    "location": "Ratnapura",
                    "description": "Premium sweet ambul bananas harvested at optimal maturity.",
                    "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop",
                },
            ]
            for c in sample_crops:
                crop = CropModel(**c)
                db.add(crop)
            db.commit()
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "service": "crop_service",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post(
    "/crops",
    response_model=CropResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Crops"],
    summary="Add a new crop listing"
)
def create_crop(payload: CropCreate, db: Session = Depends(get_db)):
    crop = CropModel(
        name=payload.name.strip(),
        category=payload.category.value if isinstance(payload.category, CropCategory) else str(payload.category),
        price_per_kg=payload.price_per_kg,
        quantity_available=payload.quantity_available,
        seller_id=payload.seller_id,
        seller_name=payload.seller_name or "Local Producer",
        location=payload.location.strip(),
        description=payload.description.strip() if payload.description else None,
        image_url=payload.image_url,
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@app.get(
    "/crops",
    response_model=List[CropResponse],
    tags=["Crops"],
    summary="List all available crops with optional category or seller filtering"
)
def list_crops(
    category: Optional[str] = Query(None, description="Filter by crop category (Vegetables, Fruits, Grains, Spices)"),
    seller_id: Optional[int] = Query(None, description="Filter crops by seller ID"),
    search: Optional[str] = Query(None, description="Search crop by name"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(CropModel)

    if category and category.lower() != "all":
        query = query.filter(CropModel.category.ilike(category))

    if seller_id is not None:
        query = query.filter(CropModel.seller_id == seller_id)

    if search:
        query = query.filter(CropModel.name.ilike(f"%{search}%"))

    return query.order_by(CropModel.id.desc()).limit(limit).all()


@app.get(
    "/crops/{crop_id}",
    response_model=CropResponse,
    tags=["Crops"],
    summary="Get details of a specific crop"
)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(CropModel).filter(CropModel.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} not found."
        )
    return crop


@app.delete(
    "/crops/{crop_id}",
    tags=["Crops"],
    summary="Delete a crop listing by ID"
)
def delete_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(CropModel).filter(CropModel.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} does not exist or has already been removed."
        )

    db.delete(crop)
    db.commit()
    return {
        "service": "crop_service",
        "success": True,
        "message": f"Crop listing {crop_id} successfully deleted."
    }


# Run with: uvicorn main:app --host 0.0.0.0 --port 8002 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
