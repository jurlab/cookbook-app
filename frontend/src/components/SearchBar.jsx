import { useState } from 'react';

function SearchBar({ onSearch, cookbooks }) {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [operator, setOperator] = useState('AND');
  const [selectedCookbooks, setSelectedCookbooks] = useState([]);
  const [minRating, setMinRating] = useState('');

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed.toLowerCase()]);
      setIngredientInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSearch = () => {
    if (ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    const searchData = {
      ingredients: ingredients,
      operator: operator,
      cookbook_ids: selectedCookbooks.length > 0 ? selectedCookbooks : null,
      min_rating: minRating ? parseFloat(minRating) : null,
    };

    onSearch(searchData);
  };

  const toggleCookbook = (cookbookId) => {
    setSelectedCookbooks(prev =>
      prev.includes(cookbookId)
        ? prev.filter(id => id !== cookbookId)
        : [...prev, cookbookId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by ingredients
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type an ingredient and press Enter"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleAddIngredient}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                🏷️ {ingredient}
                <button
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Match type
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="AND">All ingredients (AND)</option>
            <option value="OR">Any ingredient (OR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum rating
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="Any"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by cookbook
          </label>
          <div className="max-h-24 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {cookbooks.length === 0 ? (
              <p className="text-sm text-gray-500">No cookbooks added yet</p>
            ) : (
              cookbooks.map((cookbook) => (
                <label key={cookbook.id} className="flex items-center mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCookbooks.includes(cookbook.id)}
                    onChange={() => toggleCookbook(cookbook.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{cookbook.title}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={ingredients.length === 0}
        className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        🔍 Search Recipes
      </button>
    </div>
  );
}

export default SearchBar;
