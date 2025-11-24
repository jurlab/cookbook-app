import { useState } from 'react';

function RecipeCard({ recipe, onUpdate, onIncrementCooked }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(recipe.notes || '');
  const [rating, setRating] = useState(recipe.rating);

  const handleRatingChange = async (newRating) => {
    setRating(newRating);
    await onUpdate(recipe.id, { rating: newRating });
  };

  const handleSaveNotes = async () => {
    await onUpdate(recipe.id, { notes });
    setIsEditing(false);
  };

  const handleIncrementCooked = async () => {
    await onIncrementCooked(recipe.id);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => handleRatingChange(star)}
        className="text-2xl focus:outline-none hover:scale-110 transition-transform"
      >
        {star <= rating ? '⭐' : '☆'}
      </button>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {recipe.name}
        </h3>
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <span className="mr-2">📖</span>
          <span className="font-medium">{recipe.cookbook_title}</span>
        </div>
        <div className="text-sm text-gray-500">
          Page {recipe.page_number}
        </div>
      </div>

      <div className="flex items-center mb-3">
        {renderStars()}
      </div>

      <div className="flex items-center justify-between mb-3 text-sm">
        <button
          onClick={handleIncrementCooked}
          className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
        >
          <span className="mr-1">👨‍🍳</span>
          Cooked: {recipe.times_cooked}
        </button>
      </div>

      <div className="border-t pt-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.ingredients.map((ingredient) => (
            <span
              key={ingredient.id}
              className="inline-block px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded"
            >
              {ingredient.name}
            </span>
          ))}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this recipe..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveNotes}
              className="px-4 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNotes(recipe.notes || '');
                setIsEditing(false);
              }}
              className="px-4 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {recipe.notes ? (
            <div
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              📝 {recipe.notes}
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              + Add notes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
