import { useState } from 'react';

function RecipeEditModal({ recipe, cookbooks, onSave, onClose }) {
  const [name, setName] = useState(recipe.name);
  const [pageNumber, setPageNumber] = useState(recipe.page_number);
  const [cookbookId, setCookbookId] = useState(recipe.cookbook_id);
  const [ingredients, setIngredients] = useState(recipe.ingredients.map(i => i.name));
  const [newIngredient, setNewIngredient] = useState('');

  const handleAddIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Recipe name is required');
      return;
    }
    
    if (!pageNumber.trim()) {
      alert('Page number is required');
      return;
    }
    
    if (ingredients.length === 0) {
      alert('At least one ingredient is required');
      return;
    }

    onSave({
      ...recipe,
      name: name.trim(),
      page_number: pageNumber.trim(),
      cookbook_id: parseInt(cookbookId),
      ingredients: ingredients.map(name => ({ name }))
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_#1a1a1a]">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-[#E6A817]"></div>
              <h3 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wide">Edit Recipe</h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a]/10 hover:bg-[#1a1a1a]/20 transition-colors text-[#1a1a1a] text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Recipe Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3]"
                required
              />
            </div>

            {/* Cookbook */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Cookbook *
              </label>
              <select
                value={cookbookId}
                onChange={(e) => setCookbookId(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3] cursor-pointer"
                required
              >
                {cookbooks.map(cb => (
                  <option key={cb.id} value={cb.id}>
                    {cb.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Number */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Page Number *
              </label>
              <input
                type="text"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="e.g., 45 or 52-3"
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
                required
              />
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Ingredients *
              </label>
              
              {/* Current ingredients */}
              <div className="flex flex-wrap gap-2 mb-3">
                {ingredients.map((ingredient, index) => {
                  const colors = ['#D94E3C', '#2851A3', '#E6A817'];
                  const color = colors[index % 3];
                  return (
                    <span
                      key={ingredient}
                      className="inline-flex items-center px-3 py-2 font-medium text-sm"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Add new ingredient */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  placeholder="Add ingredient..."
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-3 bg-[#E6A817] text-[#1a1a1a] font-bold uppercase hover:bg-[#d49a15] transition-colors border-2 border-[#1a1a1a]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-4 bg-[#2851A3] text-white font-bold uppercase tracking-wide hover:bg-[#1f4280] transition-colors border-2 border-[#1a1a1a]"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-[#1a1a1a]/10 text-[#1a1a1a] font-bold uppercase tracking-wide hover:bg-[#1a1a1a]/20 transition-colors border-2 border-[#1a1a1a]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecipeEditModal;
