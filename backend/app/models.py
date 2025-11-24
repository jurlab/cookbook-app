from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Text
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
    cookbook_id = Column(Integer, ForeignKey("cookbooks.id"))
    name = Column(String, index=True)
    page_number = Column(String)
    rating = Column(Integer, default=0)
    times_cooked = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    date_added = Column(DateTime, default=datetime.utcnow)
    
    cookbook = relationship("Cookbook", back_populates="recipes")
    ingredients = relationship("Ingredient", secondary=recipe_ingredients, back_populates="recipes")

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    normalized_name = Column(String, index=True)
    
    recipes = relationship("Recipe", secondary=recipe_ingredients, back_populates="ingredients")