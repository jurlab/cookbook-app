import RecipeCard from './RecipeCard';

function RecipeList({ recipes, onUpdateRecipe, onIncrementCooked }) {
  return (
    <div>
      {/* Results header with Bauhaus accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-8 bg-[#D94E3C]"></div>
        <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">
          Found {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onUpdate={onUpdateRecipe}
            onIncrementCooked={onIncrementCooked}
          />
        ))}
      </div>
    </div>
  );
}

export default RecipeList;
