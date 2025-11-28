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
      setSuggestions(suggestions.filter(s => s.ingredient_id !== sourceId));
      alert('Ingredients merged successfully!');
    } catch (error) {
      console.error('Error merging ingredients:', error);
      alert('Error merging ingredients. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-8 bg-[#D94E3C]"></div>
          <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">Ingredient Management</h2>
        </div>
        <p className="text-[#1a1a1a]/60 mb-6 ml-6">
          Review and merge similar ingredients to keep your database organized
        </p>

        {/* Threshold slider */}
        <div className="mb-6 p-4 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10">
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
            Similarity Threshold: {(threshold * 100).toFixed(0)}%
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
            className="mt-4 px-4 py-2 bg-[#D94E3C] text-white font-bold uppercase text-sm hover:bg-[#c4453a] transition-colors border-2 border-[#1a1a1a]"
          >
            Refresh Suggestions
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#1a1a1a]/20 border-t-[#D94E3C] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#1a1a1a]/60 font-medium uppercase tracking-wide">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#1a1a1a]/20">
            <p className="text-[#1a1a1a]/70 text-lg mb-2">
              No similar ingredients found!
            </p>
            <p className="text-[#1a1a1a]/40">
              Your ingredients are well organized
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.ingredient_id}
                className="border-2 border-[#1a1a1a] p-4"
              >
                <div className="mb-3">
                  <span className="font-bold text-[#1a1a1a] text-lg">
                    {suggestion.ingredient_name}
                  </span>
                  <span className="text-[#1a1a1a]/50 ml-2">is similar to:</span>
                </div>

                <div className="space-y-2">
                  {suggestion.similar_to.map((similar) => (
                    <div
                      key={similar.id}
                      className="flex items-center justify-between bg-[#1a1a1a]/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#1a1a1a]">{similar.name}</span>
                        <span className="text-xs bg-[#E6A817] text-[#1a1a1a] px-2 py-1 font-bold uppercase">
                          {(similar.similarity_score * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <button
                        onClick={() => handleMerge(
                          suggestion.ingredient_id,
                          similar.id,
                          suggestion.ingredient_name,
                          similar.name
                        )}
                        className="px-4 py-2 bg-[#2851A3] text-white text-sm font-bold uppercase hover:bg-[#1f4280] transition-colors"
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

      {/* Info box */}
      <div className="mt-6 bg-[#E6A817]/20 border-2 border-[#E6A817]/40 p-5">
        <h3 className="font-bold text-[#1a1a1a] mb-3 uppercase text-sm tracking-wide">About Ingredient Merging</h3>
        <ul className="text-sm text-[#1a1a1a]/70 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-[#E6A817] mt-0.5">•</span>
            Merging combines duplicate or similar ingredients
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E6A817] mt-0.5">•</span>
            All recipes will be updated automatically
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E6A817] mt-0.5">•</span>
            The source ingredient will be deleted
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E6A817] mt-0.5">•</span>
            This action cannot be undone
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E6A817] mt-0.5">•</span>
            Higher threshold = only very similar ingredients shown
          </li>
        </ul>
      </div>
    </div>
  );
}

export default IngredientMerge;
