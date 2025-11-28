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
    <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] p-6 mb-8">
      {/* Section header with Bauhaus color block */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-8 bg-[#2851A3]"></div>
        <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">Search by Ingredients</h2>
      </div>

      {/* Input row */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type an ingredient and press Enter"
          className="flex-1 px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3] transition-colors"
        />
        <button
          onClick={handleAddIngredient}
          className="px-6 py-3 bg-[#E6A817] text-[#1a1a1a] font-bold uppercase tracking-wide hover:bg-[#d49a15] transition-colors border-2 border-[#1a1a1a]"
        >
          Add
        </button>
      </div>

      {/* Ingredient tags */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center px-4 py-2 bg-[#2851A3] text-white font-medium"
            >
              {ingredient}
              <button
                onClick={() => handleRemoveIngredient(ingredient)}
                className="ml-3 text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            Match Type
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3] cursor-pointer"
          >
            <option value="AND">All ingredients (AND)</option>
            <option value="OR">Any ingredient (OR)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            Minimum Rating
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="Any"
            className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            Filter by Cookbook
          </label>
          <div className="max-h-24 overflow-y-auto border-2 border-[#1a1a1a] bg-white p-2">
            {cookbooks.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/50 px-2">No cookbooks added yet</p>
            ) : (
              cookbooks.map((cookbook) => (
                <label key={cookbook.id} className="flex items-center py-1 cursor-pointer hover:bg-[#1a1a1a]/5 px-2">
                  <input
                    type="checkbox"
                    checked={selectedCookbooks.includes(cookbook.id)}
                    onChange={() => toggleCookbook(cookbook.id)}
                    className="mr-3"
                  />
                  <span className="text-sm text-[#1a1a1a]">{cookbook.title}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={ingredients.length === 0}
        className="w-full py-4 bg-[#D94E3C] text-white font-bold uppercase tracking-wider text-lg hover:bg-[#c4453a] disabled:bg-[#1a1a1a]/20 disabled:text-[#1a1a1a]/40 disabled:cursor-not-allowed transition-colors border-2 border-[#1a1a1a]"
      >
        Search Recipes
      </button>
    </div>
  );
}

export default SearchBar;
