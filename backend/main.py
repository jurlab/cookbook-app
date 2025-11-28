from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import cookbooks, recipes, ingredients, ocr
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {str(e)}", exc_info=True)
    # Don't fail startup, but log the error

app = FastAPI(
    title="Cookbook Index API",
    description="API for managing cookbook recipes and ingredients",
    version="1.0.0"
)

# Configure CORS - use environment variable or default to localhost for dev
# Also include common production URLs
default_origins = "http://localhost:5173,http://localhost:3000,https://cookbook-app-inky.vercel.app"
cors_origins_env = os.getenv("CORS_ORIGINS", default_origins)
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cookbooks.router)
app.include_router(recipes.router)
app.include_router(ingredients.router)
app.include_router(ocr.router)

@app.get("/")
def root():
    return {
        "message": "Cookbook Index API",
        "version": "1.0.0",
        "endpoints": {
            "cookbooks": "/cookbooks",
            "recipes": "/recipes",
            "ingredients": "/ingredients",
            "ocr": "/ocr",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}