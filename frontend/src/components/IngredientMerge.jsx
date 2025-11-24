import { useState, useEffect } from 'react';
import { ingredientAPI } from '../services/api';

function IngredientMerge() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.75);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await ingredientAPI.getMergeSuggestions(threshold);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (sourceId, targetId, sourceName, targetName) => {
    if (!confirm(`Merge "${sourceName}" into "${targetName}"?\n\nAll recipes using "${sourceName}" will be updated to use "${targetName}".`)) {
      return;
    }

    try {
      await ingredientAPI.merge(sourceId, targetId);
      // Remove the merged suggestion from the list
      setSuggestions(suggestions.filter(s => s.ingredient_id !== sourceId));
      alert('Ingredients merged successfully!');
    } catch (error) {
      console.error('Error merging ingredients:', error);
      alert('Error merging ingredients. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🥕 Ingredient Management
        </h2>
        <p className="text-gray-600 mb-6">
          Review and merge similar ingredients to keep your database organized
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Similarity threshold: {(threshold * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <button
            onClick={loadSuggestions}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Refresh Suggestions
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              ✨ No similar ingredients found!
            </p>
            <p className="text-gray-400 mt-2">
              Your ingredients are well organized
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.ingredient_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">
                    {suggestion.ingredient_name}
                  </span>
                  <span className="text-gray-500 ml-2">is similar to:</span>
                </div>

                <div className="space-y-2">
                  {suggestion.similar_to.map((similar) => (
                    <div
                      key={similar.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">{similar.name}</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {(similar.similarity_score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <button
                        onClick={() => handleMerge(
                          suggestion.ingredient_id,
                          similar.id,
                          suggestion.ingredient_name,
                          similar.name
                        )}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Merge →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About ingredient merging:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Merging combines duplicate or similar ingredients</li>
          <li>• All recipes will be updated automatically</li>
          <li>• The source ingredient will be deleted</li>
          <li>• This action cannot be undone</li>
          <li>• Higher threshold = only very similar ingredients shown</li>
        </ul>
      </div>
    </div>
  );
}

export default IngredientMerge;
