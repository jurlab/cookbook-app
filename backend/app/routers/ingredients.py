from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Ingredient
from app.schemas import Ingredient as IngredientSchema, IngredientMergeSuggestion
from app.services.ingredient_service import IngredientService

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.get("/", response_model=List[IngredientSchema])
def get_ingredients(db: Session = Depends(get_db)):
    """Get all ingredients"""
    ingredients = db.query(Ingredient).order_by(Ingredient.name).all()
    return ingredients

@router.get("/merge-suggestions", response_model=List[IngredientMergeSuggestion])
def get_merge_suggestions(
    threshold: float = 0.75,
    db: Session = Depends(get_db)
):
    """
    Get suggestions for ingredients that might be duplicates
    threshold: similarity score (0-1), default 0.75 means 75% similar
    """
    suggestions = IngredientService.get_merge_suggestions(db, threshold)
    return suggestions

@router.post("/merge", response_model=IngredientSchema)
def merge_ingredients(
    source_id: int,
    target_id: int,
    db: Session = Depends(get_db)
):
    """
    Merge source ingredient into target ingredient
    All recipes using source will be updated to use target
    Source ingredient will be deleted
    """
    try:
        result = IngredientService.merge_ingredients(db, source_id, target_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{ingredient_id}", response_model=IngredientSchema)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Get a specific ingredient"""
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient

@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Delete an ingredient
    Note: This will remove the ingredient from all recipes that use it
    """
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(ingredient)
    db.commit()
    
    return {"message": "Ingredient deleted successfully"}
