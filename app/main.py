from fastapi import FastAPI
from app.database import engine
from sqlalchemy import text
from app.routers import users, auth, tasks

app = FastAPI(title="FlowTrack API")
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/health")
def health_check():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}



