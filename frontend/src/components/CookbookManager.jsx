import { useState } from 'react';
import { cookbookAPI } from '../services/api';

function CookbookManager({ cookbooks, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (cookbookId, cookbookTitle) => {
    if (!confirm(`Are you sure you want to delete "${cookbookTitle}" and all its recipes?`)) {
      return;
    }

    setIsDeleting(cookbookId);
    try {
      await cookbookAPI.delete(cookbookId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting cookbook:', error);
      alert('Error deleting cookbook. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Rotating accent colors
  const accentColors = ['#D94E3C', '#2851A3', '#E6A817'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-[#E6A817]"></div>
          <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">My Cookbooks</h2>
        </div>

        {cookbooks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#1a1a1a]/20">
            <p className="text-[#1a1a1a]/50 text-lg mb-2">
              No cookbooks added yet
            </p>
            <p className="text-[#1a1a1a]/30">
              Use the "Add Cookbook" tab to upload your first cookbook index
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cookbooks.map((cookbook, index) => {
              const accentColor = accentColors[index % 3];
              return (
                <div
                  key={cookbook.id}
                  className="border-2 border-[#1a1a1a] p-5 hover:shadow-[4px_4px_0px_0px_#1a1a1a] transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {/* Color accent bar */}
                      <div 
                        className="w-2 self-stretch min-h-[60px]" 
                        style={{ backgroundColor: accentColor }}
                      ></div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1a1a1a]">
                          {cookbook.title}
                        </h3>
                        {cookbook.author && (
                          <p className="text-sm text-[#1a1a1a]/60 mt-1">
                            by {cookbook.author}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-6 text-sm text-[#1a1a1a]/50">
                          <span className="font-medium" style={{ color: accentColor }}>
                            {cookbook.recipe_count} {cookbook.recipe_count === 1 ? 'recipe' : 'recipes'}
                          </span>
                          <span>
                            Added {new Date(cookbook.date_added).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(cookbook.id, cookbook.title)}
                      disabled={isDeleting === cookbook.id}
                      className="px-4 py-2 bg-[#D94E3C]/10 text-[#D94E3C] font-bold uppercase text-sm hover:bg-[#D94E3C]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#D94E3C]/30"
                    >
                      {isDeleting === cookbook.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CookbookManager;
