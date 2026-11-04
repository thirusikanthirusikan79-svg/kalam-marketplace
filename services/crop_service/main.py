from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="Crop Service", version="1.0")

def init_db():
    conn = sqlite3.connect("crops.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            crop_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            price REAL NOT NULL,
            status TEXT DEFAULT 'pending'
        )
    """)
    conn.commit()
    conn.close()

init_db()

class CropCreate(BaseModel):
    farmer_id: int
    crop_name: str
    quantity: float
    unit: str
    price: float

class CropStatusUpdate(BaseModel):
    status: str

@app.post("/crops")
def add_crop(crop: CropCreate):
    conn = sqlite3.connect("crops.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO crops (farmer_id, crop_name, quantity, unit, price, status) VALUES (?, ?, ?, ?, ?, 'pending')",
        (crop.farmer_id, crop.crop_name, crop.quantity, crop.unit, crop.price)
    )
    conn.commit()
    conn.close()
    return {"message": "Crop listed successfully, waiting for admin approval"}

@app.get("/crops")
def get_approved_crops():
    conn = sqlite3.connect("crops.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, farmer_id, crop_name, quantity, unit, price FROM crops WHERE status = 'approved'")
    rows = cursor.fetchall()
    conn.close()
    
    crops = []
    for row in rows:
        crops.append({
            "id": row[0],
            "farmer_id": row[1],
            "crop_name": row[2],
            "quantity": row[3],
            "unit": row[4],
            "price": row[5]
        })
    return {"crops": crops}

@app.put("/crops/{crop_id}/status")
def update_crop_status(crop_id: int, update: CropStatusUpdate):
    conn = sqlite3.connect("crops.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE crops SET status = ? WHERE id = ?", (update.status, crop_id))
    conn.commit()
    conn.close()
    return {"message": f"Crop status updated to {update.status}"}
