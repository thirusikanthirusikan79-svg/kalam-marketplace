from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="User Service", version="1.0")

def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/register")
def register_user(user: UserRegister):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (user.name, user.email, user.password, user.role)
        )
        conn.commit()
        conn.close()
        return {"message": "User registered successfully", "email": user.email, "role": user.role}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

@app.post("/login")
def login_user(user: UserLogin):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, role FROM users WHERE email = ? AND password = ?", (user.email, user.password))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {"id": row[0], "name": row[1], "role": row[2], "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid email or password")

