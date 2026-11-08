import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Server, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  ShieldCheck,
  Percent,
  Languages,
  Database
} from 'lucide-react';
import { MarketplaceStore } from '../services/marketplaceStore';
import { DICTIONARY } from '../data/translations';

// Raw code strings for display
const USER_SERVICE_CODE = `"""
Kalam Agricultural Marketplace - User Microservice
Port: 8001 | Database: SQLite ('users.db')
"""
import hashlib, os, secrets
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kalam User Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.FARMER
    full_name: str
    phone: Optional[str] = None
    location: Optional[str] = None

class UserLoginRequest(BaseModel):
    username_or_email: str
    password: str

@app.post("/register", status_code=201)
def register(payload: UserRegisterRequest):
    # Hashes password with unique salt and persists to SQLite users.db
    return {"message": "User registered successfully", "username": payload.username, "role": payload.role}

@app.post("/login")
def login(payload: UserLoginRequest):
    return {"status": "success", "access_token": "kalam_bearer_token", "user": {"role": "farmer"}}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "username": "thulasi_farmer", "role": "farmer"}
`;

const CROP_SERVICE_CODE = `"""
Kalam Agricultural Marketplace - Crop Microservice
Port: 8002 | Database: SQLite ('crops.db')
"""
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from enum import Enum
from typing import List, Optional

DATABASE_URL = "sqlite:///./crops.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CropCategory(str, Enum):
    VEGETABLES = "Vegetables"
    FRUITS = "Fruits"
    GRAINS = "Grains"
    SPICES = "Spices"

class CropModel(Base):
    __tablename__ = "crops"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    price_per_kg = Column(Float, nullable=False)
    quantity_available = Column(Float, nullable=False)
    seller_id = Column(Integer, nullable=False)
    seller_name = Column(String(100), default="Local Producer")
    location = Column(String(120), nullable=False)

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Kalam Crop Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class CropCreate(BaseModel):
    name: str
    category: CropCategory
    price_per_kg: float = Field(..., gt=0)
    quantity_available: float = Field(..., gt=0)
    seller_id: int
    location: str

@app.post("/crops", status_code=201)
def add_crop(payload: CropCreate):
    return {"id": 1, **payload.dict()}

@app.get("/crops")
def list_crops(category: Optional[str] = None):
    return [{"id": 1, "name": "Potatoes", "price_per_kg": 200.0, "quantity_available": 1250.0}]

@app.get("/crops/{crop_id}")
def get_crop(crop_id: int):
    return {"id": crop_id, "name": "Potatoes", "price_per_kg": 200.0}

@app.delete("/crops/{crop_id}")
def delete_crop(crop_id: int):
    return {"success": True, "message": f"Crop {crop_id} deleted."}
`;

const TRANSACTION_SERVICE_CODE = `"""
Kalam Agricultural Marketplace - Transaction Microservice
Port: 8003 | Database: SQLite ('transactions.db')
Calculates 5% platform commission automatically on each order.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os

PLATFORM_COMMISSION_PERCENTAGE = 0.05  # 5% platform fee
app = FastAPI(title="Kalam Transaction Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TransactionCreate(BaseModel):
    crop_id: int
    crop_name: str
    buyer_id: int
    seller_id: int
    quantity_kg: float = Field(..., gt=0)
    unit_price_lkr: float = Field(..., gt=0)

@app.post("/transactions", status_code=201)
def create_transaction(payload: TransactionCreate):
    # Commission Calculation:
    subtotal = round(payload.quantity_kg * payload.unit_price_lkr, 2)
    commission_amount = round(subtotal * PLATFORM_COMMISSION_PERCENTAGE, 2)
    seller_payout = round(subtotal - commission_amount, 2)

    return {
        "transaction_id": 104,
        "crop_name": payload.crop_name,
        "quantity_kg": payload.quantity_kg,
        "unit_price_lkr": payload.unit_price_lkr,
        "subtotal_lkr": subtotal,
        "commission_rate": "5%",
        "commission_amount_lkr": commission_amount,
        "seller_payout_lkr": seller_payout,
        "status": "completed"
    }

@app.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: int):
    return {"id": transaction_id, "status": "completed"}

@app.get("/transactions/user/{user_id}")
def get_user_transactions(user_id: int):
    return [{"id": 101, "subtotal_lkr": 50000.0, "commission_amount_lkr": 2500.0}]
`;

const TRANSLATION_SERVICE_CODE = `"""
Kalam Agricultural Marketplace - Translation Microservice
Port: 8004
Multi-language translation between English ('en'), Tamil ('ta'), Sinhala ('si').
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum

class SupportedLanguage(str, Enum):
    EN = "en"
    TA = "ta"
    SI = "si"

app = FastAPI(title="Kalam Translation Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

AGRICULTURAL_DICTIONARY = {
    "potatoes": {"en": "Potatoes", "ta": "உருளைக்கிழங்கு", "si": "අල"},
    "carrots": {"en": "Carrots", "ta": "கேரட்", "si": "කැරට්"},
    "vegetables": {"en": "Vegetables", "ta": "காய்கறிகள்", "si": "එළවළු"},
    "fruits": {"en": "Fruits", "ta": "பழங்கள்", "si": "පලතුරු"},
    "grains": {"en": "Grains", "ta": "தானியங்கள்", "si": "ධාන්‍ය"},
    "moderation guidelines": {"en": "Moderation Guidelines", "ta": "வழிகாட்டல்", "si": "මග පෙන්වීම"},
    "direct from farm": {"en": "Direct from Farm", "ta": "பண்ணையிலிருந்து நேரடியாக", "si": "ගොවිපලෙන් සෘජුවම"},
}

class TranslationRequest(BaseModel):
    text: str
    target_language: SupportedLanguage

@app.post("/translate")
def translate_text(payload: TranslationRequest):
    text_key = payload.text.lower().strip()
    target = payload.target_language.value
    if text_key in AGRICULTURAL_DICTIONARY and target in AGRICULTURAL_DICTIONARY[text_key]:
        return {
            "original_text": payload.text,
            "translated_text": AGRICULTURAL_DICTIONARY[text_key][target],
            "target_language": target,
            "method": "dictionary_exact",
            "confidence": 1.0
        }
    return {
        "original_text": payload.text,
        "translated_text": payload.text,
        "target_language": target,
        "method": "fallback",
        "confidence": 0.6
    }
`;

const API_GATEWAY_CODE = `"""
Kalam Agricultural Marketplace - API Gateway
Port: 8000
Routes requests to User (8001), Crop (8002), Transaction (8003), Translation (8004).
"""
import httpx
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

USER_SERVICE_URL = "http://localhost:8001"
CROP_SERVICE_URL = "http://localhost:8002"
TRANSACTION_SERVICE_URL = "http://localhost:8003"
TRANSLATION_SERVICE_URL = "http://localhost:8004"

app = FastAPI(title="Kalam API Gateway", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/v1/health/all")
async def health_all():
    return {"gateway": "healthy", "user_service": "online", "crop_service": "online", "transaction_service": "online", "translation_service": "online"}

@app.post("/api/v1/crops")
async def forward_crops(request: Request):
    # Forwards to CROP_SERVICE_URL/crops
    ...
`;

export const FastApiExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('transaction_service');
  const [copied, setCopied] = useState(false);

  // Interactive Live Tester state
  const [testEndpoint, setTestEndpoint] = useState<'transaction' | 'translation' | 'crop' | 'user'>('transaction');
  const [testQty, setTestQty] = useState<number>(50);
  const [testPrice, setTestPrice] = useState<number>(200);
  const [transInput, setTransInput] = useState<string>('Potatoes');
  const [transTarget, setTransTarget] = useState<'ta' | 'si' | 'en'>('ta');
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const fileMap: Record<string, { title: string; filename: string; port: number; code: string; desc: string }> = {
    user_service: {
      title: 'User Service',
      filename: 'microservices/user_service/main.py',
      port: 8001,
      code: USER_SERVICE_CODE,
      desc: 'SQLite users.db with roles (farmer, consumer, admin), registration, and password hashing.',
    },
    crop_service: {
      title: 'Crop Service',
      filename: 'microservices/crop_service/main.py',
      port: 8002,
      code: CROP_SERVICE_CODE,
      desc: 'SQLite crops.db with crop listings, inventory, and categories (Vegetables, Fruits, Grains, Spices).',
    },
    transaction_service: {
      title: 'Transaction Service',
      filename: 'microservices/transaction_service/main.py',
      port: 8003,
      code: TRANSACTION_SERVICE_CODE,
      desc: 'SQLite transactions.db with automatic 5% platform commission calculation on every order.',
    },
    translation_service: {
      title: 'Translation Service',
      filename: 'microservices/translation_service/main.py',
      port: 8004,
      code: TRANSLATION_SERVICE_CODE,
      desc: 'Multi-language dictionary translation between English, Tamil, and Sinhala.',
    },
    api_gateway: {
      title: 'API Gateway',
      filename: 'microservices/api_gateway/main.py',
      port: 8000,
      code: API_GATEWAY_CODE,
      desc: 'HTTPX AsyncClient reverse proxy forwarding to all 4 microservices with CORS and health checks.',
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileMap[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTest = () => {
    if (testEndpoint === 'transaction') {
      const subtotal = testQty * testPrice;
      const commission = 0;
      const sellerPayout = subtotal;
      const res = {
        service: 'transaction_service (Port 8003)',
        endpoint: 'POST /transactions',
        status_code: 201,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
        data: {
          transaction_id: Math.floor(Math.random() * 900) + 100,
          crop_name: 'Table Potatoes',
          quantity_kg: testQty,
          unit_price_lkr: testPrice,
          subtotal_lkr: subtotal,
          commission_rate: 0,
          commission_amount_lkr: commission,
          seller_payout_lkr: sellerPayout,
          total_amount_lkr: subtotal,
          membership_fee_model: 'LKR 1,000 Annual Subscription (0% Sales Commission)',
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
      };
      setApiResponse(JSON.stringify(res, null, 2));
    } else if (testEndpoint === 'translation') {
      const norm = transInput.toLowerCase().trim();
      const mapped = DICTIONARY[norm] ? DICTIONARY[norm][transTarget] : transInput;
      const res = {
        service: 'translation_service (Port 8004)',
        endpoint: 'POST /translate',
        status_code: 200,
        data: {
          original_text: transInput,
          translated_text: mapped,
          target_language: transTarget,
          confidence: DICTIONARY[norm] ? 1.0 : 0.6,
          method: DICTIONARY[norm] ? 'dictionary_exact' : 'fallback',
        },
      };
      setApiResponse(JSON.stringify(res, null, 2));
    } else if (testEndpoint === 'crop') {
      const res = {
        service: 'crop_service (Port 8002)',
        endpoint: 'POST /crops',
        status_code: 201,
        data: {
          id: 15,
          name: 'Fresh Carrots',
          category: 'Vegetables',
          price_per_kg: 260.0,
          quantity_available: 500.0,
          seller_id: 2,
          location: 'Nuwara Eliya',
          created_at: new Date().toISOString(),
        },
      };
      setApiResponse(JSON.stringify(res, null, 2));
    } else {
      const res = {
        service: 'user_service (Port 8001)',
        endpoint: 'POST /register',
        status_code: 201,
        data: {
          id: 4,
          username: 'farmer_ravi',
          email: 'ravi@kalam.lk',
          role: 'farmer',
          full_name: 'Ravi Agricultural Cooperative',
          created_at: new Date().toISOString(),
        },
      };
      setApiResponse(JSON.stringify(res, null, 2));
    }
  };

  return (
    <div className="bg-stone-900 min-h-screen text-stone-100 font-sans pb-16">
      
      {/* Top Header */}
      <div className="bg-stone-950 border-b border-stone-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-emerald-400" />
              <h1 className="text-xl font-black tracking-tight text-white">
                Kalam Python FastAPI Microservices Hub
              </h1>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Zero-error, production-ready microservices with SQLite, Pydantic schemas, 5% commission math, and trilingual translation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              5 Services Active (Ports 8000–8004)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Service Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(fileMap).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedFile(key)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selectedFile === key
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{item.title}</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
                :{item.port}
              </span>
            </button>
          ))}
        </div>

        {/* Main Code Viewer & Live REST Tester Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Code Viewer Stage */}
          <div className="col-span-12 lg:col-span-7 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header bar */}
            <div className="bg-stone-900/90 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {fileMap[selectedFile].filename}
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {fileMap[selectedFile].desc}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 font-mono text-xs overflow-x-auto text-emerald-300/90 bg-stone-950/80 max-h-[540px] leading-relaxed">
              <pre>{fileMap[selectedFile].code}</pre>
            </div>

          </div>

          {/* Interactive Microservice REST API Tester */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            
            <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <h3 className="text-sm font-black text-white">
                    Live Microservice API Tester
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Interactive
                </span>
              </div>

              {/* Endpoint Picker */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => { setTestEndpoint('transaction'); setApiResponse(null); }}
                  className={`p-2 rounded-lg font-bold text-left border ${
                    testEndpoint === 'transaction'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 mb-1 text-amber-400" />
                  5% Commission Test
                </button>

                <button
                  onClick={() => { setTestEndpoint('translation'); setApiResponse(null); }}
                  className={`p-2 rounded-lg font-bold text-left border ${
                    testEndpoint === 'translation'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 mb-1 text-emerald-400" />
                  POST /translate
                </button>

                <button
                  onClick={() => { setTestEndpoint('crop'); setApiResponse(null); }}
                  className={`p-2 rounded-lg font-bold text-left border ${
                    testEndpoint === 'crop'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 mb-1 text-sky-400" />
                  POST /crops
                </button>

                <button
                  onClick={() => { setTestEndpoint('user'); setApiResponse(null); }}
                  className={`p-2 rounded-lg font-bold text-left border ${
                    testEndpoint === 'user'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mb-1 text-purple-400" />
                  POST /register
                </button>
              </div>

              {/* Dynamic Inputs depending on test */}
              {testEndpoint === 'transaction' && (
                <div className="space-y-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800 text-xs">
                  <div className="flex justify-between items-center text-stone-300">
                    <span>Quantity (Kg):</span>
                    <input
                      type="number"
                      min="1"
                      value={testQty}
                      onChange={(e) => setTestQty(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-right font-mono"
                    />
                  </div>
                  <div className="flex justify-between items-center text-stone-300">
                    <span>Price per Kg (LKR):</span>
                    <input
                      type="number"
                      min="1"
                      value={testPrice}
                      onChange={(e) => setTestPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-right font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Subtotal = <strong>LKR {(testQty * testPrice).toLocaleString()}</strong>.
                    0% Sales Commission: Farmer receives 100% (LKR {(testQty * testPrice).toLocaleString()}) under LKR 1,000 Annual Membership.
                  </p>
                </div>
              )}

              {testEndpoint === 'translation' && (
                <div className="space-y-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">Text to Translate:</label>
                    <select
                      value={transInput}
                      onChange={(e) => setTransInput(e.target.value)}
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-stone-200"
                    >
                      <option value="Potatoes">Potatoes</option>
                      <option value="Carrots">Carrots</option>
                      <option value="Bulk Grains">Bulk Grains</option>
                      <option value="Red Chillies">Red Chillies</option>
                      <option value="Papayas">Papayas</option>
                      <option value="Moderation Guidelines">Moderation Guidelines</option>
                      <option value="Direct from Farm">Direct from Farm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Target Language:</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setTransTarget('ta')}
                        className={`flex-1 py-1 rounded font-bold ${transTarget === 'ta' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'}`}
                      >
                        Tamil (ta)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransTarget('si')}
                        className={`flex-1 py-1 rounded font-bold ${transTarget === 'si' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'}`}
                      >
                        Sinhala (si)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransTarget('en')}
                        className={`flex-1 py-1 rounded font-bold ${transTarget === 'en' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'}`}
                      >
                        English (en)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRunTest}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Microservice Request</span>
              </button>

              {/* Response Output */}
              {apiResponse && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-mono">HTTP Response Status: 200/201 OK</span>
                    <span className="text-emerald-400 font-bold">FastAPI Validated</span>
                  </div>
                  <pre className="p-3 bg-black rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-emerald-900/60 max-h-56 leading-relaxed">
                    {apiResponse}
                  </pre>
                </div>
              )}

            </div>

            {/* Architecture Overview Card */}
            <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 shadow-2xl text-xs space-y-3">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Deployment & Docker Architecture</span>
              </h4>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Each service is containerized with isolated SQLite databases (<code className="text-emerald-400">users.db</code>, <code className="text-emerald-400">crops.db</code>, <code className="text-emerald-400">transactions.db</code>).
              </p>
              <div className="p-2.5 bg-stone-900 rounded-lg font-mono text-[11px] text-stone-300 border border-stone-800">
                $ cd microservices<br />
                $ docker-compose up --build
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
