import { useState, useEffect } from 'react';
import { recipeAPI, cookbookAPI } from '../services/api';
import RecipeEditModal from './RecipeEditModal';

function RecipeManager({ refreshTrigger }) {
  const [recipes, setRecipes] = useState([]);
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCookbook, setFilterCookbook] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'cookbook', 'date'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const recipesPerPage = 50;

  useEffect(() => {
    loadData();
  }, [refreshTrigger, currentPage]); // Reload when refreshTrigger or page changes

  const loadData = async () => {
    setLoading(true);
    try {
      const cookbookFilter = filterCookbook ? parseInt(filterCookbook) : null;
      const [recipesRes, cookbooksRes] = await Promise.all([
        recipeAPI.getAll(cookbookFilter, currentPage, recipesPerPage),
        cookbookAPI.getAll()
      ]);
      
      // Handle new paginated response format
      if (recipesRes.data.items) {
        setRecipes(recipesRes.data.items);
        setTotalRecipes(recipesRes.data.total);
        setTotalPages(recipesRes.data.pages);
      } else {
        // Fallback for old format (shouldn't happen with new API)
        setRecipes(recipesRes.data);
        setTotalRecipes(recipesRes.data.length);
      }
      setCookbooks(cookbooksRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId, recipeName) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      return;
    }

    try {
      await recipeAPI.delete(recipeId);
      // Reload from server to ensure sync
      // If we deleted the last item on the page, go back a page
      if (recipes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Error deleting recipe');
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
  };

  const handleSaveEdit = async (updatedRecipe) => {
    try {
      await recipeAPI.update(updatedRecipe.id, {
        name: updatedRecipe.name,
        page_number: updatedRecipe.page_number,
        ingredient_names: updatedRecipe.ingredients.map(i => i.name)
      });
      
      // Reload data to get fresh info
      await loadData();
      setEditingRecipe(null);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Error updating recipe');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await recipeAPI.exportCSV();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cookbook_recipes.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting recipes');
    }
  };

  // Client-side filtering and sorting (for search term only)
  // Note: Cookbook filter is now server-side via loadData
  const filteredRecipes = recipes
    .filter(recipe => {
      if (!searchTerm) return true;
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cookbook':
          return a.cookbook_title.localeCompare(b.cookbook_title);
        case 'date':
          return new Date(b.date_added) - new Date(a.date_added);
        default:
          return 0;
      }
    });

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (filterCookbook !== '') {
      setCurrentPage(1);
    }
  }, [filterCookbook]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📝 All Recipes ({totalRecipes} total, showing {filteredRecipes.length} on this page)
          </h2>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📊 Export to CSV
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or ingredient..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Cookbook
            </label>
            <select
              value={filterCookbook}
              onChange={async (e) => {
                setFilterCookbook(e.target.value);
                setCurrentPage(1);
                // Trigger reload with new filter
                setLoading(true);
                try {
                  const cookbookFilter = e.target.value ? parseInt(e.target.value) : null;
                  const recipesRes = await recipeAPI.getAll(cookbookFilter, 1, recipesPerPage);
                  if (recipesRes.data.items) {
                    setRecipes(recipesRes.data.items);
                    setTotalRecipes(recipesRes.data.total);
                    setTotalPages(recipesRes.data.pages);
                  }
                } catch (error) {
                  console.error('Error loading recipes:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Cookbooks</option>
              {cookbooks.map(cb => (
                <option key={cb.id} value={cb.id}>{cb.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="name">Recipe Name</option>
              <option value="cookbook">Cookbook</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recipes found</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipe Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cookbook
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cooked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingredients
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {recipe.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {recipe.cookbook_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {recipe.page_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {'⭐'.repeat(Math.floor(recipe.rating))}
                          {recipe.rating === 0 && '☆☆☆☆☆'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {recipe.times_cooked}×
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {recipe.ingredients.slice(0, 3).map(ing => (
                            <span key={ing.id} className="inline-block px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded">
                              {ing.name}
                            </span>
                          ))}
                          {recipe.ingredients.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{recipe.ingredients.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(recipe)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id, recipe.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalRecipes} total recipes)
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecipe && (
        <RecipeEditModal
          recipe={editingRecipe}
          cookbooks={cookbooks}
          onSave={handleSaveEdit}
          onClose={() => setEditingRecipe(null)}
        />
      )}
    </div>
  );
}

export default RecipeManager;
