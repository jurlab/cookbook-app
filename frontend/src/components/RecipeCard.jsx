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
        className={`text-2xl transition-transform hover:scale-110 ${
          star <= rating ? 'text-[#E6A817]' : 'text-[#1a1a1a]/20'
        }`}
      >
        ★
      </button>
    ));
  };

  // Rotating accent colors for visual variety
  const accentColors = ['#D94E3C', '#2851A3', '#E6A817'];
  const accentColor = accentColors[recipe.id % 3];

  return (
    <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] transition-shadow duration-200">
      {/* Color accent bar */}
      <div className="h-2" style={{ backgroundColor: accentColor }}></div>
      
      <div className="p-5">
        {/* Recipe name */}
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 leading-tight">
          {recipe.name}
        </h3>
        
        {/* Cookbook info */}
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/70 mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-medium">{recipe.cookbook_title}</span>
        </div>
        <div className="text-sm text-[#1a1a1a]/50 mb-4">
          Page {recipe.page_number}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {renderStars()}
        </div>

        {/* Cook count button */}
        <button
          onClick={handleIncrementCooked}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]/5 hover:bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 transition-colors mb-4"
        >
          <span className="text-lg">👨‍🍳</span>
          <span className="font-medium text-[#1a1a1a]">Cooked: {recipe.times_cooked}</span>
        </button>

        {/* Ingredients */}
        <div className="border-t-2 border-[#1a1a1a]/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.map((ingredient) => (
              <span
                key={ingredient.id}
                className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {ingredient.name}
              </span>
            ))}
          </div>
        </div>

        {/* Notes section */}
        {isEditing ? (
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]/10">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this recipe..."
              className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-sm focus:outline-none focus:border-[#2851A3]"
              rows="3"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-[#2851A3] text-white text-sm font-bold uppercase"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotes(recipe.notes || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-[#1a1a1a]/10 text-[#1a1a1a] text-sm font-bold uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]/10">
            {recipe.notes ? (
              <div
                onClick={() => setIsEditing(true)}
                className="text-sm text-[#1a1a1a]/70 cursor-pointer hover:bg-[#1a1a1a]/5 p-2 -m-2"
              >
                <span className="font-medium text-[#1a1a1a]">Notes:</span> {recipe.notes}
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-[#1a1a1a]/40 hover:text-[#2851A3] transition-colors"
              >
                + Add notes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeCard;
