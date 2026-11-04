from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI(title="Kalam API Gateway", version="1.0")

# Service URLs
USER_SERVICE_URL = "http://localhost:8001"
CROP_SERVICE_URL = "http://localhost:8002"
TRANSACTION_SERVICE_URL = "http://localhost:8003"
TRANSLATION_SERVICE_URL = "http://localhost:8004"

# --- User Routes ---
@app.post("/api/register")
async def gateway_register(payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{USER_SERVICE_URL}/register", json=payload)
        return response.json()

@app.post("/api/login")
async def gateway_login(payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{USER_SERVICE_URL}/login", json=payload)
        return response.json()

# --- Crop Routes ---
@app.post("/api/crops")
async def gateway_add_crop(payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{CROP_SERVICE_URL}/crops", json=payload)
        return response.json()

@app.get("/api/crops")
async def gateway_get_crops():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{CROP_SERVICE_URL}/crops")
        return response.json()

@app.put("/api/crops/{crop_id}/status")
async def gateway_update_crop_status(crop_id: int, payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{CROP_SERVICE_URL}/crops/{crop_id}/status", json=payload)
        return response.json()

# --- Transaction Routes ---
@app.post("/api/transactions")
async def gateway_create_transaction(payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{TRANSACTION_SERVICE_URL}/transactions", json=payload)
        return response.json()

@app.get("/api/transactions")
async def gateway_get_transactions():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{TRANSACTION_SERVICE_URL}/transactions")
        return response.json()

# --- Translation Routes ---
@app.post("/api/translate")
async def gateway_translate(payload: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{TRANSLATION_SERVICE_URL}/translate", json=payload)
        return response.json()
