import structlog
from fastapi import FastAPI
from app.core.config import settings
from app.api import health, auth
from app.api import detect, jobs

# Configure structured logging
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/internal")
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth")
app.include_router(detect.router, prefix=f"{settings.API_V1_STR}/detect")
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}/jobs")

from app.core.storage import storage
from app.core.queue import queue_service

@app.on_event("startup")
async def startup_event():
    logger.info("api_gateway_starting", version=settings.VERSION)
    storage.initialize()
    await queue_service.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await queue_service.close()

@app.get("/")
async def root():
    return {"message": f"{settings.PROJECT_NAME} is running."}
