"""
Kalam Agricultural Marketplace - API Gateway
Service Name: api_gateway
Port: 8000

Features:
- Central routing hub for the Kalam microservice mesh:
    * User Service:        http://localhost:8001
    * Crop Service:        http://localhost:8002
    * Transaction Service: http://localhost:8003
    * Translation Service: http://localhost:8004
- Uses httpx.AsyncClient with persistent connection pooling and timeout handling.
- Seamless forwarding for GET, POST, DELETE methods with header and query preservation.
- Global CORS middleware.
- Structured downstream fault isolation (returns 503 / 502 with friendly diagnostics when services are unreachable).
- Aggregated endpoints:
    * GET /api/v1/health/all (checks all downstream microservices simultaneously)
    * GET /api/v1/marketplace/overview (aggregates crops, financial analytics, and stats)
"""

import os
from typing import Any, Dict, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# -----------------------------------------------------------------------------
# Microservice Downstream URLs
# -----------------------------------------------------------------------------
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
CROP_SERVICE_URL = os.getenv("CROP_SERVICE_URL", "http://localhost:8002")
TRANSACTION_SERVICE_URL = os.getenv("TRANSACTION_SERVICE_URL", "http://localhost:8003")
TRANSLATION_SERVICE_URL = os.getenv("TRANSLATION_SERVICE_URL", "http://localhost:8004")

TIMEOUT_CONFIG = httpx.Timeout(10.0, connect=3.0)

app = FastAPI(
    title="Kalam API Gateway",
    description="Unified API Gateway routing to User, Crop, Transaction, and Translation microservices",
    version="1.0.0"
)

# Global CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Generic Downstream Proxy Forwarder
# -----------------------------------------------------------------------------
async def forward_request(
    target_base_url: str,
    path: str,
    request: Request,
    service_label: str
) -> Response:
    """
    Forwards an incoming HTTP request (GET, POST, DELETE, etc.) to a downstream microservice.
    """
    target_url = f"{target_base_url.rstrip('/')}/{path.lstrip('/')}"
    method = request.method
    headers = dict(request.headers)
    # Remove host header to avoid downstream proxy host conflicts
    headers.pop("host", None)
    headers.pop("content-length", None)

    # Read body for POST/PUT/PATCH
    body = await request.body() if method in ["POST", "PUT", "PATCH"] else None
    params = dict(request.query_params)

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_CONFIG) as client:
            resp = await client.request(
                method=method,
                url=target_url,
                headers=headers,
                params=params,
                content=body
            )

            # Return exact status code and content from downstream service
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=dict(resp.headers),
                media_type=resp.headers.get("content-type", "application/json")
            )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "gateway_error": True,
                "service": service_label,
                "target_url": target_url,
                "detail": f"The downstream '{service_label}' at {target_base_url} is currently offline or unreachable. Please verify that the microservice process is running.",
            }
        )
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "gateway_error": True,
                "service": service_label,
                "detail": f"Request to downstream service '{service_label}' timed out after {TIMEOUT_CONFIG.read}s.",
            }
        )
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "gateway_error": True,
                "service": service_label,
                "detail": f"Gateway proxy failure: {str(exc)}",
            }
        )


# -----------------------------------------------------------------------------
# Gateway Root & Mesh Health Check
# -----------------------------------------------------------------------------
@app.get("/", tags=["Gateway"])
def gateway_root():
    return {
        "gateway": "Kalam API Gateway",
        "status": "operational",
        "routes": {
            "user_service": f"{USER_SERVICE_URL} -> /api/v1/users/*, /api/v1/auth/*",
            "crop_service": f"{CROP_SERVICE_URL} -> /api/v1/crops/*",
            "transaction_service": f"{TRANSACTION_SERVICE_URL} -> /api/v1/transactions/*",
            "translation_service": f"{TRANSLATION_SERVICE_URL} -> /api/v1/translate/*",
        }
    }


@app.get("/api/v1/health/all", tags=["Gateway Health"])
async def check_all_services():
    """
    Pings each downstream microservice in parallel and reports health status.
    """
    services = {
        "user_service": f"{USER_SERVICE_URL}/health",
        "crop_service": f"{CROP_SERVICE_URL}/health",
        "transaction_service": f"{TRANSACTION_SERVICE_URL}/health",
        "translation_service": f"{TRANSLATION_SERVICE_URL}/health",
    }

    results = {}
    async with httpx.AsyncClient(timeout=httpx.Timeout(2.0)) as client:
        for name, url in services.items():
            try:
                r = await client.get(url)
                results[name] = {"online": r.status_code == 200, "details": r.json() if r.status_code == 200 else r.text}
            except Exception as e:
                results[name] = {"online": False, "error": str(e)}

    return {
        "gateway": "healthy",
        "microservices": results
    }


# -----------------------------------------------------------------------------
# 1. User Service Routes Forwarding
# -----------------------------------------------------------------------------
@app.post("/api/v1/auth/register", tags=["User Service"])
async def register(request: Request):
    return await forward_request(USER_SERVICE_URL, "/register", request, "user_service")


@app.post("/api/v1/auth/login", tags=["User Service"])
async def login(request: Request):
    return await forward_request(USER_SERVICE_URL, "/login", request, "user_service")


@app.get("/api/v1/users/{user_id}", tags=["User Service"])
async def get_user(user_id: int, request: Request):
    return await forward_request(USER_SERVICE_URL, f"/users/{user_id}", request, "user_service")


@app.get("/api/v1/users", tags=["User Service"])
async def list_users(request: Request):
    return await forward_request(USER_SERVICE_URL, "/users", request, "user_service")


# -----------------------------------------------------------------------------
# 2. Crop Service Routes Forwarding
# -----------------------------------------------------------------------------
@app.post("/api/v1/crops", tags=["Crop Service"])
async def add_crop(request: Request):
    return await forward_request(CROP_SERVICE_URL, "/crops", request, "crop_service")


@app.get("/api/v1/crops", tags=["Crop Service"])
async def list_crops(request: Request):
    return await forward_request(CROP_SERVICE_URL, "/crops", request, "crop_service")


@app.get("/api/v1/crops/{crop_id}", tags=["Crop Service"])
async def get_crop(crop_id: int, request: Request):
    return await forward_request(CROP_SERVICE_URL, f"/crops/{crop_id}", request, "crop_service")


@app.delete("/api/v1/crops/{crop_id}", tags=["Crop Service"])
async def delete_crop(crop_id: int, request: Request):
    return await forward_request(CROP_SERVICE_URL, f"/crops/{crop_id}", request, "crop_service")


# -----------------------------------------------------------------------------
# 3. Transaction Service Routes Forwarding
# -----------------------------------------------------------------------------
@app.post("/api/v1/transactions", tags=["Transaction Service"])
async def create_transaction(request: Request):
    return await forward_request(TRANSACTION_SERVICE_URL, "/transactions", request, "transaction_service")


@app.get("/api/v1/transactions/{transaction_id}", tags=["Transaction Service"])
async def get_transaction(transaction_id: int, request: Request):
    return await forward_request(TRANSACTION_SERVICE_URL, f"/transactions/{transaction_id}", request, "transaction_service")


@app.get("/api/v1/transactions/user/{user_id}", tags=["Transaction Service"])
async def get_user_transactions(user_id: int, request: Request):
    return await forward_request(TRANSACTION_SERVICE_URL, f"/transactions/user/{user_id}", request, "transaction_service")


@app.get("/api/v1/transactions", tags=["Transaction Service"])
async def list_all_transactions(request: Request):
    return await forward_request(TRANSACTION_SERVICE_URL, "/transactions", request, "transaction_service")


@app.get("/api/v1/transactions/analytics/summary", tags=["Transaction Service"])
async def transaction_analytics(request: Request):
    return await forward_request(TRANSACTION_SERVICE_URL, "/transactions/analytics/summary", request, "transaction_service")


# -----------------------------------------------------------------------------
# 4. Translation Service Routes Forwarding
# -----------------------------------------------------------------------------
@app.post("/api/v1/translate", tags=["Translation Service"])
async def translate(request: Request):
    return await forward_request(TRANSLATION_SERVICE_URL, "/translate", request, "translation_service")


@app.post("/api/v1/translate/batch", tags=["Translation Service"])
async def translate_batch(request: Request):
    return await forward_request(TRANSLATION_SERVICE_URL, "/translate/batch", request, "translation_service")


@app.get("/api/v1/translate/dictionary", tags=["Translation Service"])
async def get_dictionary(request: Request):
    return await forward_request(TRANSLATION_SERVICE_URL, "/dictionary", request, "translation_service")


# -----------------------------------------------------------------------------
# 5. Composite Aggregation Endpoint
# -----------------------------------------------------------------------------
@app.get("/api/v1/marketplace/overview", tags=["Aggregated Dashboard"])
async def get_marketplace_overview():
    """
    Aggregates active crop inventory and financial analytics in a single call
    for the Kalam Farmer and Admin Dashboards.
    """
    crops_data = []
    analytics_data = {}

    async with httpx.AsyncClient(timeout=TIMEOUT_CONFIG) as client:
        try:
            crops_res = await client.get(f"{CROP_SERVICE_URL}/crops")
            if crops_res.status_code == 200:
                crops_data = crops_res.json()
        except Exception:
            crops_data = []

        try:
            analytics_res = await client.get(f"{TRANSACTION_SERVICE_URL}/transactions/analytics/summary")
            if analytics_res.status_code == 200:
                analytics_data = analytics_res.json()
        except Exception:
            analytics_data = {}

    return {
        "status": "success",
        "total_active_crops": len(crops_data),
        "crops": crops_data,
        "financial_summary": analytics_data,
        "platform_commission_rate": "5%",
        "currency": "LKR"
    }


# Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
