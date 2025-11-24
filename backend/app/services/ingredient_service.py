from typing import List, Dict
from difflib import SequenceMatcher
from sqlalchemy.orm import Session
from app.models import Ingredient
from app.schemas import IngredientMergeSuggestion

class IngredientService:
    
    @staticmethod
    def normalize_ingredient_name(name: str) -> str:
        """
        Normalize ingredient names for better matching
        - Convert to lowercase
        - Remove extra whitespace
        - Handle common plurals
        """
        normalized = name.lower().strip()
        
        # Simple plural handling
        plural_mappings = {
            'tomatoes': 'tomato',
            'potatoes': 'potato',
            'onions': 'onion',
            'carrots': 'carrot',
            'peppers': 'pepper',
            'mushrooms': 'mushroom',
            'chickpeas': 'chickpea',
            'beans': 'bean',
            'berries': 'berry',
            'cherries': 'cherry',
        }
        
        # Check for exact plural match
        if normalized in plural_mappings:
            normalized = plural_mappings[normalized]
        # Check if ends with common plural 's' and singular exists in mappings
        elif normalized.endswith('s') and normalized[:-1] in plural_mappings.values():
            normalized = normalized[:-1]
            
        return normalized
    
    @staticmethod
    def calculate_similarity(str1: str, str2: str) -> float:
        """Calculate similarity between two strings (0-1)"""
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()
    
    @staticmethod
    def find_similar_ingredients(
        db: Session,
        ingredient_name: str,
        threshold: float = 0.75,
        exclude_id: int = None
    ) -> List[Dict]:
        """
        Find ingredients that are similar to the given name
        Returns list of {id, name, similarity_score}
        """
        all_ingredients = db.query(Ingredient).all()
        similar = []
        
        normalized_input = IngredientService.normalize_ingredient_name(ingredient_name)
        
        for ingredient in all_ingredients:
            if exclude_id and ingredient.id == exclude_id:
                continue
                
            # Check similarity with original name
            similarity = IngredientService.calculate_similarity(
                ingredient_name,
                ingredient.name
            )
            
            # Also check with normalized names
            normalized_similarity = IngredientService.calculate_similarity(
                normalized_input,
                ingredient.normalized_name or ingredient.name
            )
            
            max_similarity = max(similarity, normalized_similarity)
            
            if max_similarity >= threshold:
                similar.append({
                    'id': ingredient.id,
                    'name': ingredient.name,
                    'similarity_score': round(max_similarity, 2)
                })
        
        # Sort by similarity score (highest first)
        similar.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return similar
    
    @staticmethod
    def get_merge_suggestions(db: Session, threshold: float = 0.75) -> List[IngredientMergeSuggestion]:
        """
        Get suggestions for ingredients that might be duplicates/variations
        """
        all_ingredients = db.query(Ingredient).all()
        suggestions = []
        processed = set()
        
        for ingredient in all_ingredients:
            if ingredient.id in processed:
                continue
                
            similar = IngredientService.find_similar_ingredients(
                db,
                ingredient.name,
                threshold=threshold,
                exclude_id=ingredient.id
            )
            
            if similar:
                suggestions.append(IngredientMergeSuggestion(
                    ingredient_id=ingredient.id,
                    ingredient_name=ingredient.name,
                    similar_to=similar
                ))
                
                # Mark all similar ingredients as processed to avoid duplicate suggestions
                processed.add(ingredient.id)
                for sim in similar:
                    processed.add(sim['id'])
        
        return suggestions
    
    @staticmethod
    def merge_ingredients(
        db: Session,
        source_ingredient_id: int,
        target_ingredient_id: int
    ) -> Ingredient:
        """
        Merge source ingredient into target ingredient
        - All recipes linked to source will be relinked to target
        - Source ingredient will be deleted
        """
        source = db.query(Ingredient).filter(Ingredient.id == source_ingredient_id).first()
        target = db.query(Ingredient).filter(Ingredient.id == target_ingredient_id).first()
        
        if not source or not target:
            raise ValueError("Source or target ingredient not found")
        
        # Transfer all recipes from source to target
        for recipe in source.recipes:
            if recipe not in target.recipes:
                target.recipes.append(recipe)
        
        # Delete source ingredient
        db.delete(source)
        db.commit()
        db.refresh(target)
        
        return target
