from fastapi import FastAPI
from routers import workspace
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers.courses import router as courses_router
from routers.routine import router as routine_router

settings = get_settings()

app = FastAPI(
    title="System Development Project API",
    version="0.1.0",
    description="Backend API for routine parsing, course extraction, and course workspace generation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Backend is running successfully.",
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "API is healthy.",
        "debug": settings.debug,
    }


app.include_router(routine_router)
app.include_router(courses_router)
app.include_router(workspace.router)