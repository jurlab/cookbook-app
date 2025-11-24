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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">✏️ Edit Recipe</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Recipe Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Cookbook */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cookbook *
              </label>
              <select
                value={cookbookId}
                onChange={(e) => setCookbookId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Number *
              </label>
              <input
                type="text"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="e.g., 45 or 52-3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients *
              </label>
              
              {/* Current ingredients */}
              <div className="flex flex-wrap gap-2 mb-3">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    🏷️ {ingredient}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                💾 Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
