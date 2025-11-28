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
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const recipesPerPage = 50;

  useEffect(() => {
    loadData();
  }, [refreshTrigger, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cookbookFilter = filterCookbook ? parseInt(filterCookbook) : null;
      const [recipesRes, cookbooksRes] = await Promise.all([
        recipeAPI.getAll(cookbookFilter, currentPage, recipesPerPage),
        cookbookAPI.getAll()
      ]);
      
      if (recipesRes.data.items) {
        setRecipes(recipesRes.data.items);
        setTotalRecipes(recipesRes.data.total);
        setTotalPages(recipesRes.data.pages);
      } else {
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

  useEffect(() => {
    if (filterCookbook !== '') {
      setCurrentPage(1);
    }
  }, [filterCookbook]);

  // Accent colors for ingredients
  const accentColors = ['#D94E3C', '#2851A3', '#E6A817'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-[#2851A3]"></div>
            <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">
              All Recipes ({totalRecipes} total)
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#2851A3] text-white font-bold uppercase text-sm hover:bg-[#1f4280] transition-colors border-2 border-[#1a1a1a]"
            >
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#2d7d46] text-white font-bold uppercase text-sm hover:bg-[#256b3a] transition-colors border-2 border-[#1a1a1a]"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
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
              className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
              Filter by Cookbook
            </label>
            <select
              value={filterCookbook}
              onChange={async (e) => {
                setFilterCookbook(e.target.value);
                setCurrentPage(1);
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
              className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3] cursor-pointer"
            >
              <option value="">All Cookbooks</option>
              {cookbooks.map(cb => (
                <option key={cb.id} value={cb.id}>{cb.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3] cursor-pointer"
            >
              <option value="name">Recipe Name</option>
              <option value="cookbook">Cookbook</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        </div>

        {/* Loading / Empty / Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#1a1a1a]/20 border-t-[#2851A3] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#1a1a1a]/60 font-medium uppercase tracking-wide">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#1a1a1a]/20">
            <p className="text-[#1a1a1a]/50 text-lg">No recipes found</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto border-2 border-[#1a1a1a]">
              <table className="min-w-full">
                <thead className="bg-[#1a1a1a] text-[#fffdf7]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Recipe Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Cookbook
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Cooked
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Ingredients
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1a1a1a]/10">
                  {filteredRecipes.map((recipe, index) => (
                    <tr key={recipe.id} className="hover:bg-[#1a1a1a]/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-[#1a1a1a]">
                          {recipe.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1a1a1a]/70">
                          {recipe.cookbook_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1a1a1a]/70">
                        {recipe.page_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#E6A817]">
                          {'★'.repeat(Math.floor(recipe.rating))}
                          <span className="text-[#1a1a1a]/20">{'★'.repeat(5 - Math.floor(recipe.rating))}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1a1a1a]/70 font-medium">
                        {recipe.times_cooked}×
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {recipe.ingredients.slice(0, 3).map((ing, i) => (
                            <span 
                              key={ing.id} 
                              className="inline-block px-2 py-1 text-xs font-medium uppercase"
                              style={{ 
                                backgroundColor: `${accentColors[i % 3]}20`, 
                                color: accentColors[i % 3] 
                              }}
                            >
                              {ing.name}
                            </span>
                          ))}
                          {recipe.ingredients.length > 3 && (
                            <span className="text-xs text-[#1a1a1a]/50 font-medium">
                              +{recipe.ingredients.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEdit(recipe)}
                          className="text-[#2851A3] hover:text-[#1f4280] font-bold uppercase mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id, recipe.name)}
                          className="text-[#D94E3C] hover:text-[#c4453a] font-bold uppercase"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 border-2 border-[#1a1a1a] bg-white hover:bg-[#1a1a1a]/5 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase text-sm transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-[#1a1a1a]/70 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 border-2 border-[#1a1a1a] bg-white hover:bg-[#1a1a1a]/5 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase text-sm transition-colors"
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
