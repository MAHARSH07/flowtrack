from fastapi import FastAPI
from app.database import engine
from sqlalchemy import text
from app.routers import users, auth, tasks
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os

def run_migrations():
    if os.getenv("RUN_MIGRATIONS", "false") != "true":
        return

    try:
        subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True
        )
        print("✅ Alembic migrations applied")
    except Exception as e:
        print("❌ Alembic migration failed:", e)


run_migrations()

app = FastAPI(title="FlowTrack API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://flowtrack-orcin.vercel.app",
        "https://flowtrack-20xba89fj-maharsh07s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/health")
def health_check():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}



