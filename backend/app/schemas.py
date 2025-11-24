from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Ingredient Schemas
class IngredientBase(BaseModel):
    name: str

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    normalized_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class IngredientMergeSuggestion(BaseModel):
    ingredient_id: int
    ingredient_name: str
    similar_to: List[dict]  # [{id: int, name: str, similarity_score: float}]

# Recipe Schemas
class RecipeBase(BaseModel):
    name: str
    page_number: str
    cookbook_id: int

class RecipeCreate(RecipeBase):
    ingredient_names: List[str]

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    page_number: Optional[str] = None
    rating: Optional[float] = None
    times_cooked: Optional[int] = None
    notes: Optional[str] = None
    ingredient_names: Optional[List[str]] = None

class Recipe(RecipeBase):
    id: int
    rating: float
    times_cooked: int
    notes: Optional[str] = None
    date_added: datetime
    ingredients: List[Ingredient]
    
    class Config:
        from_attributes = True

class RecipeWithCookbook(Recipe):
    cookbook_title: str
    cookbook_author: Optional[str] = None

# Cookbook Schemas
class CookbookBase(BaseModel):
    title: str
    author: Optional[str] = None

class CookbookCreate(CookbookBase):
    pass

class Cookbook(CookbookBase):
    id: int
    cover_image_url: Optional[str] = None
    date_added: datetime
    recipe_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# OCR Schemas
class OCRResult(BaseModel):
    recipe_name: str
    page_number: str
    ingredients: List[str]

class OCRResponse(BaseModel):
    cookbook_id: Optional[int] = None
    recipes: List[OCRResult]
    confidence: str  # "high", "medium", "low"
    raw_response: Optional[str] = None  # Raw Claude Vision response for debugging
    
class OCRRequest(BaseModel):
    cookbook_id: Optional[int] = None
    image_base64: str

# Search Schemas
class SearchQuery(BaseModel):
    ingredients: List[str]
    operator: str = "AND"  # "AND" or "OR"
    cookbook_ids: Optional[List[int]] = None
    min_rating: Optional[float] = None
