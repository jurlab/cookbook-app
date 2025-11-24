from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Cookbook, Recipe
from app.schemas import Cookbook as CookbookSchema, CookbookCreate

router = APIRouter(prefix="/cookbooks", tags=["cookbooks"])

@router.get("/", response_model=List[CookbookSchema])
def get_cookbooks(db: Session = Depends(get_db)):
    """Get all cookbooks with recipe counts"""
    cookbooks = db.query(Cookbook).all()
    result = []
    
    for cookbook in cookbooks:
        cookbook_dict = {
            "id": cookbook.id,
            "title": cookbook.title,
            "author": cookbook.author,
            "cover_image_url": cookbook.cover_image_url,
            "date_added": cookbook.date_added,
            "recipe_count": len(cookbook.recipes)
        }
        result.append(cookbook_dict)
    
    return result

@router.get("/{cookbook_id}", response_model=CookbookSchema)
def get_cookbook(cookbook_id: int, db: Session = Depends(get_db)):
    """Get a specific cookbook"""
    cookbook = db.query(Cookbook).filter(Cookbook.id == cookbook_id).first()
    if not cookbook:
        raise HTTPException(status_code=404, detail="Cookbook not found")
    
    return {
        "id": cookbook.id,
        "title": cookbook.title,
        "author": cookbook.author,
        "cover_image_url": cookbook.cover_image_url,
        "date_added": cookbook.date_added,
        "recipe_count": len(cookbook.recipes)
    }

@router.post("/", response_model=CookbookSchema)
def create_cookbook(cookbook: CookbookCreate, db: Session = Depends(get_db)):
    """Create a new cookbook"""
    db_cookbook = Cookbook(
        title=cookbook.title,
        author=cookbook.author
    )
    db.add(db_cookbook)
    db.commit()
    db.refresh(db_cookbook)
    
    return {
        "id": db_cookbook.id,
        "title": db_cookbook.title,
        "author": db_cookbook.author,
        "cover_image_url": db_cookbook.cover_image_url,
        "date_added": db_cookbook.date_added,
        "recipe_count": 0
    }

@router.delete("/{cookbook_id}")
def delete_cookbook(cookbook_id: int, db: Session = Depends(get_db)):
    """Delete a cookbook and all its recipes"""
    cookbook = db.query(Cookbook).filter(Cookbook.id == cookbook_id).first()
    if not cookbook:
        raise HTTPException(status_code=404, detail="Cookbook not found")
    
    db.delete(cookbook)
    db.commit()
    
    return {"message": "Cookbook deleted successfully"}
