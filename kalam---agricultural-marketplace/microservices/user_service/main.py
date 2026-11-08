"""
Kalam Agricultural Marketplace - User Microservice
Service Name: user_service
Port: 8001
Database: SQLite ('users.db')

Features:
- SQLite connection with automatic table creation using SQLAlchemy ORM.
- Pydantic schemas for User Registration and Login.
- Role-based authorization: 'farmer', 'consumer', 'admin'.
- Secure password hashing using SHA256 + unique salt.
- CORS middleware enabled.
- Structured JSON exception handling.
- Endpoints:
    POST /register
    POST /login
    GET /users/{user_id}
    GET /users (Admin listing)
    GET /health
"""

import hashlib
import os
import secrets
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# -----------------------------------------------------------------------------
# Database Configuration (SQLite)
# -----------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserRole(str, Enum):
    FARMER = "farmer"
    CONSUMER = "consumer"
    ADMIN = "admin"


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    salt = Column(String(32), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.CONSUMER.value)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Automatically create tables if not present
Base.metadata.create_all(bind=engine)


# -----------------------------------------------------------------------------
# Dependency for DB Session
# -----------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Security Helper Functions
# -----------------------------------------------------------------------------
def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    return hashed, salt


def verify_password(plain_password: str, hashed_password: str, salt: str) -> bool:
    expected_hash, _ = hash_password(plain_password, salt)
    return secrets.compare_digest(expected_hash, hashed_password)


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="farmernimal")
    email: EmailStr = Field(..., example="nimal@kalam.lk")
    password: str = Field(..., min_length=6, example="AgriSecure2026!")
    role: UserRole = Field(default=UserRole.FARMER, example=UserRole.FARMER)
    full_name: str = Field(..., min_length=2, max_length=100, example="Nimal Perera")
    phone: Optional[str] = Field(None, example="+94 77 123 4567")
    location: Optional[str] = Field(None, example="Jaffna / Dambulla")


class UserLoginRequest(BaseModel):
    username_or_email: str = Field(..., example="nimal@kalam.lk")
    password: str = Field(..., example="AgriSecure2026!")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: str
    phone: Optional[str]
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    status: str = "success"
    message: str = "Login successful"
    token_type: str = "bearer"
    access_token: str
    user: UserResponse


# -----------------------------------------------------------------------------
# FastAPI Application Initialization
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Kalam User Microservice",
    description="User authentication and profile management for Kalam Agricultural Marketplace",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Exception Handlers
# -----------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "service": "user_service",
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
            "service": "user_service",
            "success": False,
            "error_code": "ERR_INTERNAL_SERVER",
            "detail": str(exc),
        },
    )


# -----------------------------------------------------------------------------
# Seed Default Users on Startup if Database is Empty
# -----------------------------------------------------------------------------
@app.on_event("startup")
def seed_default_users():
    db = SessionLocal()
    try:
        if db.query(UserModel).count() == 0:
            seed_accounts = [
                {
                    "username": "admin",
                    "email": "admin@kalam.lk",
                    "password": "adminpassword123",
                    "role": UserRole.ADMIN.value,
                    "full_name": "Janon Smith (Platform Admin)",
                    "phone": "+94 77 900 1100",
                    "location": "Colombo Headquarters",
                },
                {
                    "username": "farmer_thulasi",
                    "email": "thulasi@kalam.lk",
                    "password": "farmerpassword123",
                    "role": UserRole.FARMER.value,
                    "full_name": "Thulasi's Organic Farm",
                    "phone": "+94 71 450 7821",
                    "location": "Jaffna Northern District",
                },
                {
                    "username": "buyer_dulan",
                    "email": "dulan@kalam.lk",
                    "password": "buyerpassword123",
                    "role": UserRole.CONSUMER.value,
                    "full_name": "Dulan Wijesinghe",
                    "phone": "+94 76 332 9901",
                    "location": "Kandy Central",
                },
            ]
            for acc in seed_accounts:
                hashed, salt = hash_password(acc["password"])
                user = UserModel(
                    username=acc["username"],
                    email=acc["email"],
                    password_hash=hashed,
                    salt=salt,
                    role=acc["role"],
                    full_name=acc["full_name"],
                    phone=acc["phone"],
                    location=acc["location"],
                )
                db.add(user)
            db.commit()
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "service": "user_service",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
    summary="Register a new user (farmer, consumer, or admin)"
)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if username or email is already taken
    existing_user = db.query(UserModel).filter(
        (UserModel.username == payload.username) | (UserModel.email == payload.email)
    ).first()

    if existing_user:
        if existing_user.username == payload.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered. Please choose a different username."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered. Please use another email or log in."
        )

    # Hash password with secure salt
    hashed_pwd, salt = hash_password(payload.password)

    new_user = UserModel(
        username=payload.username.strip(),
        email=payload.email.lower().strip(),
        password_hash=hashed_pwd,
        salt=salt,
        role=payload.role.value,
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        location=payload.location.strip() if payload.location else None,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post(
    "/login",
    response_model=LoginResponse,
    tags=["Authentication"],
    summary="Authenticate user and issue mock JWT access token"
)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    identifier = payload.username_or_email.strip()

    user = db.query(UserModel).filter(
        (UserModel.username == identifier) | (UserModel.email == identifier.lower())
    ).first()

    if not user or not verify_password(payload.password, user.password_hash, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your username/email and password."
        )

    # Generate a lightweight session token for microservice communication
    mock_jwt = f"kalam_token_{user.id}_{user.role}_{secrets.token_urlsafe(24)}"

    return LoginResponse(
        access_token=mock_jwt,
        user=UserResponse.from_orm(user)
    )


@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    tags=["Users"],
    summary="Retrieve user details by ID"
)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found."
        )
    return user


@app.get(
    "/users",
    response_model=List[UserResponse],
    tags=["Users"],
    summary="List all registered marketplace users"
)
def list_users(
    role: Optional[UserRole] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(UserModel)
    if role:
        query = query.filter(UserModel.role == role.value)
    return query.limit(limit).all()


# Run with: uvicorn main:app --host 0.0.0.0 --port 8001 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
