from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import cookbooks, recipes, ingredients, ocr
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cookbook Index API",
    description="API for managing cookbook recipes and ingredients",
    version="1.0.0"
)

# Configure CORS - use environment variable or default to localhost for dev
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://cookbook-app-inky.vercel.app/"  # Add your Vercel URL
    ],
    # ...
)