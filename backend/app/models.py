from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

recipe_ingredients = Table(
    'recipe_ingredients', Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id')),
    Column('ingredient_id', Integer, ForeignKey('ingredients.id'))
)

class Cookbook(Base):
    __tablename__ = "cookbooks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    cover_image_url = Column(String, nullable=True)
    date_added = Column(DateTime, default=datetime.utcnow)
    recipes = relationship("Recipe", back_populates="cookbook", cascade="all, delete-orphan")

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    cookbook_id = Column(Integer, ForeignKey("cookbooks.id"), index=True)  # Index for frequent filtering
    name = Column(String, index=True)
    page_number = Column(String)
    rating = Column(Integer, default=0, index=True)  # Index for rating filters
    times_cooked = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    date_added = Column(DateTime, default=datetime.utcnow, index=True)  # Index for date sorting
    
    cookbook = relationship("Cookbook", back_populates="recipes")
    ingredients = relationship("Ingredient", secondary=recipe_ingredients, back_populates="recipes")
    
    # Composite index for common query patterns
    __table_args__ = (
        Index('idx_recipe_cookbook_name', 'cookbook_id', 'name'),
    )

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    normalized_name = Column(String, index=True)
    
    recipes = relationship("Recipe", secondary=recipe_ingredients, back_populates="ingredients")
    
    # Composite index for efficient ingredient search
    __table_args__ = (
        Index('idx_ingredient_search', 'normalized_name', 'name'),
    )