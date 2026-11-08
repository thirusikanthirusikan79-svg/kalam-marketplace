"""
Kalam Agricultural Marketplace - Transaction Microservice
Service Name: transaction_service
Port: 8003
Database: SQLite ('transactions.db')

Features:
- SQLite connection ('transactions.db') with automatic table creation via SQLAlchemy ORM.
- Automatically calculates a 5% percentage-based sales commission on each crop sale:
    subtotal = unit_price_lkr * quantity_kg
    commission_rate = 0.05 (5%)
    commission_amount_lkr = round(subtotal * commission_rate, 2)
    seller_payout_lkr = round(subtotal - commission_amount_lkr, 2)
- Endpoints:
    POST /transactions (Create order/sale with calculated commission)
    GET /transactions/{transaction_id} (Retrieve transaction by ID)
    GET /transactions/user/{user_id} (Retrieve transactions for a specific user)
    GET /transactions (List all transactions for admin auditing)
    GET /transactions/analytics/summary (Financial metrics, commission collected)
- Pydantic models for request validation.
- Full CORS middleware & structured exception handling.
"""

import os
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# -----------------------------------------------------------------------------
# Database Setup
# -----------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./transactions.db")
PLATFORM_COMMISSION_PERCENTAGE = float(os.getenv("PLATFORM_COMMISSION_PERCENTAGE", "0.05"))  # 5%

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TransactionStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    PROCESSING = "processing"
    CANCELLED = "cancelled"


class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    buyer_id = Column(Integer, nullable=False, index=True)
    buyer_name = Column(String(100), nullable=False, default="Consumer Buyer")
    seller_id = Column(Integer, nullable=False, index=True)
    seller_name = Column(String(100), nullable=False, default="Farmer Producer")
    quantity_kg = Column(Float, nullable=False)
    unit_price_lkr = Column(Float, nullable=False)
    subtotal_lkr = Column(Float, nullable=False)
    commission_rate = Column(Float, nullable=False, default=0.05)
    commission_amount_lkr = Column(Float, nullable=False)
    seller_payout_lkr = Column(Float, nullable=False)
    total_amount_lkr = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False, default="Direct Bank Transfer")
    status = Column(String(30), nullable=False, default=TransactionStatus.COMPLETED.value)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


# Create tables automatically
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
class TransactionCreate(BaseModel):
    crop_id: int = Field(..., gt=0, example=1)
    crop_name: str = Field(..., example="Potatoes")
    buyer_id: int = Field(..., gt=0, example=3)
    buyer_name: Optional[str] = Field("Dulan Wijesinghe", example="Dulan Wijesinghe")
    seller_id: int = Field(..., gt=0, example=2)
    seller_name: Optional[str] = Field("Thulasi's Farm", example="Thulasi's Farm")
    quantity_kg: float = Field(..., gt=0, example=25.0, description="Quantity in Kilograms purchased")
    unit_price_lkr: float = Field(..., gt=0, example=200.0, description="Agreed unit price per Kg in LKR")
    payment_method: Optional[str] = Field("Direct AgriPay / Card", example="Direct AgriPay / Card")


class TransactionResponse(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    buyer_id: int
    buyer_name: str
    seller_id: int
    seller_name: str
    quantity_kg: float
    unit_price_lkr: float
    subtotal_lkr: float
    commission_rate: float
    commission_amount_lkr: float
    seller_payout_lkr: float
    total_amount_lkr: float
    payment_method: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_transactions_count: int
    total_volume_lkr: float
    total_commission_collected_lkr: float
    total_seller_payout_lkr: float
    commission_percentage: float
    currency: str = "LKR"


# -----------------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Kalam Transaction Microservice",
    description="Order processing and automated 5% commission calculation for Kalam Agricultural Marketplace",
    version="1.0.0"
)

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
            "service": "transaction_service",
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
            "service": "transaction_service",
            "success": False,
            "error_code": "ERR_INTERNAL_SERVER",
            "detail": str(exc),
        },
    )


# -----------------------------------------------------------------------------
# Seed Default Transactions from Wireframe Layout
# -----------------------------------------------------------------------------
@app.on_event("startup")
def seed_default_transactions():
    db = SessionLocal()
    try:
        if db.query(TransactionModel).count() == 0:
            sample_trades = [
                {
                    "crop_id": 1,
                    "crop_name": "Potatoes",
                    "buyer_id": 3,
                    "buyer_name": "Dulan Wijesinghe",
                    "seller_id": 2,
                    "seller_name": "Thulasi's Farm",
                    "quantity_kg": 150.0,
                    "unit_price_lkr": 200.0,
                    "payment_method": "Card / Online",
                },
                {
                    "crop_id": 2,
                    "crop_name": "Carrots",
                    "buyer_id": 3,
                    "buyer_name": "Colombo Super Grocers",
                    "seller_id": 2,
                    "seller_name": "Thulasi's Farm",
                    "quantity_kg": 100.0,
                    "unit_price_lkr": 260.0,
                    "payment_method": "AgriPay Direct",
                },
                {
                    "crop_id": 3,
                    "crop_name": "Bulk Grains (Paddy)",
                    "buyer_id": 3,
                    "buyer_name": "Rajarata Millers",
                    "seller_id": 2,
                    "seller_name": "Polonnaruwa Harvest Guild",
                    "quantity_kg": 250.0,
                    "unit_price_lkr": 150.0,
                    "payment_method": "Bank Wire Transfer",
                },
            ]
            for trade in sample_trades:
                subtotal = round(trade["quantity_kg"] * trade["unit_price_lkr"], 2)
                comm_rate = PLATFORM_COMMISSION_PERCENTAGE
                comm_amount = round(subtotal * comm_rate, 2)
                payout = round(subtotal - comm_amount, 2)

                txn = TransactionModel(
                    crop_id=trade["crop_id"],
                    crop_name=trade["crop_name"],
                    buyer_id=trade["buyer_id"],
                    buyer_name=trade["buyer_name"],
                    seller_id=trade["seller_id"],
                    seller_name=trade["seller_name"],
                    quantity_kg=trade["quantity_kg"],
                    unit_price_lkr=trade["unit_price_lkr"],
                    subtotal_lkr=subtotal,
                    commission_rate=comm_rate,
                    commission_amount_lkr=comm_amount,
                    seller_payout_lkr=payout,
                    total_amount_lkr=subtotal,
                    payment_method=trade["payment_method"],
                    status=TransactionStatus.COMPLETED.value,
                )
                db.add(txn)
            db.commit()
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "service": "transaction_service",
        "status": "healthy",
        "commission_rate": PLATFORM_COMMISSION_PERCENTAGE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Transactions"],
    summary="Create a new sale/order with automated 5% commission calculation"
)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    if payload.quantity_kg <= 0 or payload.unit_price_lkr <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity and unit price must be positive numbers."
        )

    # Commission Calculation Formula
    subtotal = round(payload.quantity_kg * payload.unit_price_lkr, 2)
    commission_rate = PLATFORM_COMMISSION_PERCENTAGE
    commission_amount = round(subtotal * commission_rate, 2)
    seller_payout = round(subtotal - commission_amount, 2)

    txn = TransactionModel(
        crop_id=payload.crop_id,
        crop_name=payload.crop_name.strip(),
        buyer_id=payload.buyer_id,
        buyer_name=payload.buyer_name.strip() if payload.buyer_name else "Consumer Buyer",
        seller_id=payload.seller_id,
        seller_name=payload.seller_name.strip() if payload.seller_name else "Farmer Producer",
        quantity_kg=payload.quantity_kg,
        unit_price_lkr=payload.unit_price_lkr,
        subtotal_lkr=subtotal,
        commission_rate=commission_rate,
        commission_amount_lkr=commission_amount,
        seller_payout_lkr=seller_payout,
        total_amount_lkr=subtotal,
        payment_method=payload.payment_method or "AgriPay Direct",
        status=TransactionStatus.COMPLETED.value,
    )

    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@app.get(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    tags=["Transactions"],
    summary="Retrieve transaction details by ID"
)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    txn = db.query(TransactionModel).filter(TransactionModel.id == transaction_id).first()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {transaction_id} not found."
        )
    return txn


@app.get(
    "/transactions/user/{user_id}",
    response_model=List[TransactionResponse],
    tags=["Transactions"],
    summary="Retrieve all orders/sales where user is either buyer or seller"
)
def get_transactions_by_user(
    user_id: int,
    as_role: Optional[str] = Query(None, description="'buyer', 'seller', or None for both"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(TransactionModel)
    if as_role == "buyer":
        query = query.filter(TransactionModel.buyer_id == user_id)
    elif as_role == "seller":
        query = query.filter(TransactionModel.seller_id == user_id)
    else:
        query = query.filter(
            (TransactionModel.buyer_id == user_id) | (TransactionModel.seller_id == user_id)
        )

    return query.order_by(desc(TransactionModel.timestamp)).limit(limit).all()


@app.get(
    "/transactions",
    response_model=List[TransactionResponse],
    tags=["Transactions"],
    summary="List all transactions (Admin audit view)"
)
def list_all_transactions(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return db.query(TransactionModel).order_by(desc(TransactionModel.timestamp)).limit(limit).all()


@app.get(
    "/transactions/analytics/summary",
    response_model=AnalyticsSummary,
    tags=["Analytics"],
    summary="Platform financial totals and commission fees collected"
)
def get_analytics_summary(db: Session = Depends(get_db)):
    txs = db.query(TransactionModel).all()
    total_count = len(txs)
    total_volume = sum(t.subtotal_lkr for t in txs)
    total_commission = sum(t.commission_amount_lkr for t in txs)
    total_payout = sum(t.seller_payout_lkr for t in txs)

    return AnalyticsSummary(
        total_transactions_count=total_count,
        total_volume_lkr=round(total_volume, 2),
        total_commission_collected_lkr=round(total_commission, 2),
        total_seller_payout_lkr=round(total_payout, 2),
        commission_percentage=PLATFORM_COMMISSION_PERCENTAGE * 100,
        currency="LKR"
    )


# Run with: uvicorn main:app --host 0.0.0.0 --port 8003 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
