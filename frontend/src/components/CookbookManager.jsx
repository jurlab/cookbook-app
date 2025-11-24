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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📚 My Cookbooks
        </h2>

        {cookbooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No cookbooks added yet
            </p>
            <p className="text-gray-400">
              Use the "Add Cookbook" tab to upload your first cookbook index
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cookbooks.map((cookbook) => (
              <div
                key={cookbook.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cookbook.title}
                    </h3>
                    {cookbook.author && (
                      <p className="text-sm text-gray-600 mt-1">
                        by {cookbook.author}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        📖 {cookbook.recipe_count} {cookbook.recipe_count === 1 ? 'recipe' : 'recipes'}
                      </span>
                      <span>
                        📅 Added {new Date(cookbook.date_added).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cookbook.id, cookbook.title)}
                    disabled={isDeleting === cookbook.id}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting === cookbook.id ? '...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CookbookManager;
