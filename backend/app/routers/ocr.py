from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas import OCRRequest, OCRResponse
from app.services.ocr_service import OCRService
from app.services.ingredient_service import IngredientService
from app.models import Cookbook, Recipe, Ingredient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["ocr"])

@router.post("/extract", response_model=OCRResponse)
async def extract_recipes_from_image(
    request: OCRRequest,
    db: Session = Depends(get_db)
):
    if request.cookbook_id:
        cookbook = db.query(Cookbook).filter(Cookbook.id == request.cookbook_id).first()
        if not cookbook:
            raise HTTPException(status_code=404, detail="Cookbook not found")
    
    ocr_service = OCRService()
    
    try:
        result = await ocr_service.extract_recipes_from_image(
            request.image_base64,
            request.cookbook_id
        )
        
        result.recipes = ocr_service.deduplicate_recipes(result.recipes)
        
        if result.confidence == "error":
            raise HTTPException(status_code=500, detail="OCR API call failed")
            
        return result
    except Exception as e:
        logger.error(f"OCR Extraction Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@router.post("/extract-and-save")
async def extract_and_save_recipes(
    request: OCRRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Starting extract-and-save for cookbook_id: {request.cookbook_id}")
    
    if not request.cookbook_id:
        raise HTTPException(status_code=400, detail="cookbook_id is required for saving")
    
    cookbook = db.query(Cookbook).filter(Cookbook.id == request.cookbook_id).first()
    if not cookbook:
        raise HTTPException(status_code=404, detail="Cookbook not found")
    
    # 1. Extract recipes
    ocr_service = OCRService()
    result = await ocr_service.extract_recipes_from_image(
        request.image_base64,
        request.cookbook_id
    )
    
    if result.confidence == "error":
         raise HTTPException(status_code=500, detail="OCR processing failed at API level")

    # 2. Deduplicate based on name/page
    result.recipes = ocr_service.deduplicate_recipes(result.recipes)
    
    saved_count = 0
    skipped_count = 0
    
    # 3. Batch processing with Local Caching
    # This cache prevents adding 'beetroot' twice in the same request
    # Key: Ingredient Name (lowercase), Value: Ingredient Object
    processed_ingredients_cache = {}
    
    try:
        for ocr_recipe in result.recipes:
            # Check if recipe already exists
            existing = db.query(Recipe).filter(
                Recipe.cookbook_id == request.cookbook_id,
                Recipe.name == ocr_recipe.recipe_name,
                Recipe.page_number == ocr_recipe.page_number
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            db_recipe = Recipe(
                name=ocr_recipe.recipe_name,
                page_number=ocr_recipe.page_number,
                cookbook_id=request.cookbook_id
            )
            
            # Process Ingredients
            for ingredient_name in ocr_recipe.ingredients:
                ingredient_name = str(ingredient_name).strip()
                if not ingredient_name:
                    continue
                    
                normalized_name = IngredientService.normalize_ingredient_name(ingredient_name)
                cache_key = ingredient_name.lower()
                
                # Step A: Check Local Cache (Found in this batch?)
                if cache_key in processed_ingredients_cache:
                    ingredient = processed_ingredients_cache[cache_key]
                else:
                    # Step B: Check Database (Found in DB?)
                    # Using func.lower for case-insensitive lookup
                    ingredient = db.query(Ingredient).filter(
                        func.lower(Ingredient.name) == cache_key
                    ).first()
                    
                    if not ingredient:
                        # Step C: Create New
                        logger.info(f"Creating new ingredient: {ingredient_name}")
                        ingredient = Ingredient(
                            name=ingredient_name,
                            normalized_name=normalized_name
                        )
                        db.add(ingredient)
                        # Flush to ensure it has an ID/Identity for the session
                        db.flush() 
                    
                    # Add to local cache for subsequent items in this loop
                    processed_ingredients_cache[cache_key] = ingredient
                
                # Append the ingredient object to the recipe
                db_recipe.ingredients.append(ingredient)
            
            db.add(db_recipe)
            saved_count += 1
        
        db.commit()
        logger.info(f"Successfully saved {saved_count} recipes")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Database Save Error: {e}")
        # Return a clean error message to the client
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "message": f"Successfully processed {len(result.recipes)} recipes",
        "saved": saved_count,
        "skipped": skipped_count,
        "confidence": result.confidence,
        "raw_response": result.raw_response
    }