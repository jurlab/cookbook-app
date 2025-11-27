from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Cookbook, Recipe
from app.schemas import Cookbook as CookbookSchema, CookbookCreate

router = APIRouter(prefix="/cookbooks", tags=["cookbooks"])

@router.get("/", response_model=List[CookbookSchema])
def get_cookbooks(db: Session = Depends(get_db)):
    """Get all cookbooks with recipe counts"""
    # Use subquery to count recipes efficiently (avoids N+1 query)
    recipe_counts = db.query(
        Recipe.cookbook_id,
        func.count(Recipe.id).label('recipe_count')
    ).group_by(Recipe.cookbook_id).subquery()
    
    cookbooks = db.query(
        Cookbook,
        func.coalesce(recipe_counts.c.recipe_count, 0).label('recipe_count')
    ).outerjoin(recipe_counts, Cookbook.id == recipe_counts.c.cookbook_id).all()
    
    result = []
    for cookbook, recipe_count in cookbooks:
        cookbook_dict = {
            "id": cookbook.id,
            "title": cookbook.title,
            "author": cookbook.author,
            "cover_image_url": cookbook.cover_image_url,
            "date_added": cookbook.date_added,
            "recipe_count": int(recipe_count)
        }
        result.append(cookbook_dict)
    
    return result

@router.get("/{cookbook_id}", response_model=CookbookSchema)
def get_cookbook(cookbook_id: int, db: Session = Depends(get_db)):
    """Get a specific cookbook"""
    # Use func.count to avoid loading all recipes
    recipe_count = db.query(func.count(Recipe.id)).filter(
        Recipe.cookbook_id == cookbook_id
    ).scalar() or 0
    
    cookbook = db.query(Cookbook).filter(Cookbook.id == cookbook_id).first()
    if not cookbook:
        raise HTTPException(status_code=404, detail="Cookbook not found")
    
    return {
        "id": cookbook.id,
        "title": cookbook.title,
        "author": cookbook.author,
        "cover_image_url": cookbook.cover_image_url,
        "date_added": cookbook.date_added,
        "recipe_count": int(recipe_count)
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
