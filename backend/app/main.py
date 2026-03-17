from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"DB init error: {e}")
    yield

app = FastAPI(title="HRMS Lite API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import employee_router, attendance_router
app.include_router(employee_router)
app.include_router(attendance_router)

@app.get("/")
def root():
    return {"message": "HRMS Lite API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
