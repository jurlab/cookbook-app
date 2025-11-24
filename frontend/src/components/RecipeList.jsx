import RecipeCard from './RecipeCard';

function RecipeList({ recipes, onUpdateRecipe, onIncrementCooked }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Found {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
