from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="Transaction Service", version="1.0")

def init_db():
    conn = sqlite3.connect("transactions.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_id INTEGER NOT NULL,
            buyer_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            commission REAL NOT NULL, -- 2% platform commission
            farmer_payout REAL NOT NULL,
            status TEXT DEFAULT 'completed'
        )
    """)
    conn.commit()
    conn.close()

init_db()

class TransactionCreate(BaseModel):
    crop_id: int
    buyer_id: int
    farmer_id: int
    total_amount: float

@app.post("/transactions")
def create_transaction(tx: TransactionCreate):
    # Calculate 2% commission
    commission = tx.total_amount * 0.02
    farmer_payout = tx.total_amount - commission

    conn = sqlite3.connect("transactions.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO transactions (crop_id, buyer_id, farmer_id, total_amount, commission, farmer_payout, status) VALUES (?, ?, ?, ?, ?, ?, 'completed')",
        (tx.crop_id, tx.buyer_id, tx.farmer_id, tx.total_amount, commission, farmer_payout)
    )
    conn.commit()
    conn.close()
    
    return {
        "message": "Transaction successful",
        "total_amount": tx.total_amount,
        "platform_commission_2_percent": commission,
        "farmer_payout": farmer_payout
    }

@app.get("/transactions")
def get_transactions():
    conn = sqlite3.connect("transactions.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, crop_id, buyer_id, farmer_id, total_amount, commission, farmer_payout, status FROM transactions")
    rows = cursor.fetchall()
    conn.close()
    
    txs = []
    for row in rows:
        txs.append({
            "id": row[0],
            "crop_id": row[1],
            "buyer_id": row[2],
            "farmer_id": row[3],
            "total_amount": row[4],
            "commission": row[5],
            "farmer_payout": row[6],
            "status": row[7]
        })
    return {"transactions": txs}
