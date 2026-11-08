# Kalam - Agricultural Marketplace Microservice Architecture

A high-performance, asynchronous Python FastAPI microservices mesh designed for agricultural trading connecting farmers and consumers with automated 5% commission accounting and English / Tamil / Sinhala trilingual translation.

## 🏛️ Microservice Inventory & Port Allocation

| Service | Port | Database | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8000` | N/A | Central routing, load balancing, health monitoring, error isolation |
| **User Service** | `8001` | SQLite (`users.db`) | Registration, login, role authorization (`farmer`, `consumer`, `admin`) |
| **Crop Service** | `8002` | SQLite (`crops.db`) | Crop listings, stock tracking, categories, regional filtering |
| **Transaction Service** | `8003` | SQLite (`transactions.db`) | Order execution, automated 5% sales commission calculation |
| **Translation Service** | `8004` | Dictionary In-Memory | Agricultural dictionary translation between English (`en`), Tamil (`ta`), Sinhala (`si`) |

---

## ⚡ Quick Start

### Option 1: Run with Docker Compose (All Services)
```bash
cd microservices
docker-compose up --build
```
API Gateway will be available at `http://localhost:8000/docs`.

### Option 2: Run Microservices Individually with Uvicorn
```bash
pip install -r requirements.txt

# Terminal 1: User Service
uvicorn user_service.main:app --port 8001 --reload

# Terminal 2: Crop Service
uvicorn crop_service.main:app --port 8002 --reload

# Terminal 3: Transaction Service
uvicorn transaction_service.main:app --port 8003 --reload

# Terminal 4: Translation Service
uvicorn translation_service.main:app --port 8004 --reload

# Terminal 5: API Gateway
uvicorn api_gateway.main:app --port 8000 --reload
```

---

## 🌾 Commission Calculation Logic (Transaction Service)

Each purchase triggers automated platform commission deduction:
```python
subtotal_lkr = unit_price_lkr * quantity_kg
commission_rate = 0.05  # 5% platform fee
commission_amount_lkr = round(subtotal_lkr * commission_rate, 2)
seller_payout_lkr = round(subtotal_lkr - commission_amount_lkr, 2)
```
For example, selling 50 Kg of Potatoes @ LKR 200/Kg:
- **Subtotal**: LKR 10,000.00
- **Platform 5% Commission**: LKR 500.00
- **Farmer Payout**: LKR 9,500.00
