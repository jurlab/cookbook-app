from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Recipe, Ingredient, Cookbook
from app.schemas import (
    Recipe as RecipeSchema,
    RecipeWithCookbook,
    RecipeCreate,
    RecipeUpdate,
    SearchQuery
)
from app.services.ingredient_service import IngredientService
import io
import csv

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.get("/")
def get_recipes(
    cookbook_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Get recipes with pagination
    Returns paginated list of recipes with total count
    """
    # Build base query with eager loading
    query = db.query(Recipe).options(joinedload(Recipe.cookbook))
    
    if cookbook_id:
        query = query.filter(Recipe.cookbook_id == cookbook_id)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    recipes = query.offset(offset).limit(limit).all()
    
    # Convert to response format using Pydantic v2 API
    result = []
    for recipe in recipes:
        recipe_dict = RecipeSchema.model_validate(recipe).model_dump()
        result.append({
            **recipe_dict,
            "cookbook_title": recipe.cookbook.title,
            "cookbook_author": recipe.cookbook.author
        })
    
    return {
        "items": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit  # Ceiling division
    }

@router.get("/{recipe_id}", response_model=RecipeWithCookbook)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get a specific recipe"""
    recipe = db.query(Recipe).options(joinedload(Recipe.cookbook)).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    recipe_dict = RecipeSchema.model_validate(recipe).model_dump()
    return {
        **recipe_dict,
        "cookbook_title": recipe.cookbook.title,
        "cookbook_author": recipe.cookbook.author
    }

@router.post("/", response_model=RecipeSchema)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    """Create a new recipe"""
    # Verify cookbook exists
    cookbook = db.query(Cookbook).filter(Cookbook.id == recipe.cookbook_id).first()
    if not cookbook:
        raise HTTPException(status_code=404, detail="Cookbook not found")
    
    # Create recipe
    db_recipe = Recipe(
        name=recipe.name,
        page_number=recipe.page_number,
        cookbook_id=recipe.cookbook_id
    )
    
    # Add or get ingredients
    for ingredient_name in recipe.ingredient_names:
        normalized_name = IngredientService.normalize_ingredient_name(ingredient_name)
        
        # Check if ingredient exists
        ingredient = db.query(Ingredient).filter(
            Ingredient.name == ingredient_name
        ).first()
        
        if not ingredient:
            ingredient = Ingredient(
                name=ingredient_name,
                normalized_name=normalized_name
            )
            db.add(ingredient)
        
        db_recipe.ingredients.append(ingredient)
    
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe

@router.patch("/{recipe_id}", response_model=RecipeSchema)
def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    db: Session = Depends(get_db)
):
    """Update a recipe"""
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Update fields
    update_data = recipe_update.dict(exclude_unset=True, exclude={'ingredient_names'})
    for field, value in update_data.items():
        setattr(db_recipe, field, value)
    
    # Update ingredients if provided
    if recipe_update.ingredient_names is not None:
        db_recipe.ingredients.clear()
        
        for ingredient_name in recipe_update.ingredient_names:
            normalized_name = IngredientService.normalize_ingredient_name(ingredient_name)
            
            ingredient = db.query(Ingredient).filter(
                Ingredient.name == ingredient_name
            ).first()
            
            if not ingredient:
                ingredient = Ingredient(
                    name=ingredient_name,
                    normalized_name=normalized_name
                )
                db.add(ingredient)
            
            db_recipe.ingredients.append(ingredient)
    
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe

@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Delete a recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(recipe)
    db.commit()
    
    return {"message": "Recipe deleted successfully"}

@router.post("/search", response_model=List[RecipeWithCookbook])
def search_recipes(search: SearchQuery, db: Session = Depends(get_db)):
    """
    Search recipes by ingredients
    - AND operator: recipe must contain ALL specified ingredients
    - OR operator: recipe must contain AT LEAST ONE of the specified ingredients
    """
    # Normalize ingredient names for search
    normalized_ingredients = [
        IngredientService.normalize_ingredient_name(ing)
        for ing in search.ingredients
    ]
    
    # Find matching ingredients in database (search both name and normalized_name)
    ingredient_objects = db.query(Ingredient).filter(
        (Ingredient.name.in_(search.ingredients)) |
        (Ingredient.normalized_name.in_(normalized_ingredients))
    ).all()
    
    if not ingredient_objects:
        return []
    
    ingredient_ids = [ing.id for ing in ingredient_objects]
    
    # Build query based on operator
    if search.operator == "AND":
        # Recipe must have ALL ingredients
        query = db.query(Recipe).join(Recipe.ingredients)
        for ing_id in ingredient_ids:
            query = query.filter(Recipe.ingredients.any(Ingredient.id == ing_id))
    else:  # OR
        # Recipe must have AT LEAST ONE ingredient
        query = db.query(Recipe).join(Recipe.ingredients).filter(
            Ingredient.id.in_(ingredient_ids)
        ).distinct()
    
    # Apply additional filters
    if search.cookbook_ids:
        query = query.filter(Recipe.cookbook_id.in_(search.cookbook_ids))
    
    if search.min_rating is not None:
        query = query.filter(Recipe.rating >= search.min_rating)
    
    # Add eager loading for cookbook relationship
    query = query.options(joinedload(Recipe.cookbook))
    recipes = query.all()
    
    result = []
    for recipe in recipes:
        recipe_dict = RecipeSchema.model_validate(recipe).model_dump()
        result.append({
            **recipe_dict,
            "cookbook_title": recipe.cookbook.title,
            "cookbook_author": recipe.cookbook.author
        })
    
    return result

@router.post("/{recipe_id}/increment-cooked", response_model=RecipeSchema)
def increment_times_cooked(recipe_id: int, db: Session = Depends(get_db)):
    """Increment the times_cooked counter for a recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    recipe.times_cooked += 1
    db.commit()
    db.refresh(recipe)
    
    return recipe

@router.get("/export/csv")
def export_recipes_csv(db: Session = Depends(get_db)):
    """Export all recipes to CSV file"""
    recipes = db.query(Recipe).join(Cookbook).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Recipe Name',
        'Cookbook',
        'Author',
        'Page Number',
        'Rating',
        'Times Cooked',
        'Ingredients',
        'Notes',
        'Date Added'
    ])
    
    # Write data
    for recipe in recipes:
        ingredients_str = ', '.join([ing.name for ing in recipe.ingredients])
        writer.writerow([
            recipe.name,
            recipe.cookbook.title,
            recipe.cookbook.author or '',
            recipe.page_number,
            recipe.rating,
            recipe.times_cooked,
            ingredients_str,
            recipe.notes or '',
            recipe.date_added.strftime('%Y-%m-%d') if recipe.date_added else ''
        ])
    
    # Prepare response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cookbook_recipes.csv"}
    )
