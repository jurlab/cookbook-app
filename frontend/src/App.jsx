import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecipeList from './components/RecipeList';
import CookbookManager from './components/CookbookManager';
import OCRUpload from './components/OCRUpload';
import IngredientMerge from './components/IngredientMerge';
import RecipeManager from './components/RecipeManager';
import { recipeAPI, cookbookAPI } from './services/api';
import './index.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('search'); // 'search', 'recipes', 'upload', 'cookbooks', 'ingredients'
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger data reload

  useEffect(() => {
    loadCookbooks();
  }, []);

  const loadCookbooks = async () => {
    try {
      const response = await cookbookAPI.getAll();
      setCookbooks(response.data);
    } catch (error) {
      console.error('Error loading cookbooks:', error);
    }
  };

  const handleSearch = async (searchData) => {
    setLoading(true);
    setSearchPerformed(true);
    try {
      const response = await recipeAPI.search(searchData);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error searching recipes:', error);
      alert('Error searching recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecipe = async (recipeId, updates) => {
    try {
      await recipeAPI.update(recipeId, updates);
      setRecipes(recipes.map(r => 
        r.id === recipeId ? { ...r, ...updates } : r
      ));
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Error updating recipe. Please try again.');
    }
  };

  const handleIncrementCooked = async (recipeId) => {
    try {
      const response = await recipeAPI.incrementCooked(recipeId);
      setRecipes(recipes.map(r => 
        r.id === recipeId ? { ...r, times_cooked: response.data.times_cooked } : r
      ));
    } catch (error) {
      console.error('Error incrementing cook count:', error);
    }
  };

  const handleOCRComplete = () => {
    loadCookbooks();
    setRefreshTrigger(prev => prev + 1); // Increment trigger to force refresh
    setActiveView('search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'search' && (
          <>
            <SearchBar onSearch={handleSearch} cookbooks={cookbooks} />
            
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <p className="mt-4 text-gray-600">Searching recipes...</p>
              </div>
            )}
            
            {!loading && searchPerformed && recipes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No recipes found. Try different ingredients!</p>
              </div>
            )}
            
            {!loading && recipes.length > 0 && (
              <RecipeList 
                recipes={recipes} 
                onUpdateRecipe={handleUpdateRecipe}
                onIncrementCooked={handleIncrementCooked}
              />
            )}
            
            {!searchPerformed && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  👆 Search by ingredients to find recipes
                </p>
                <p className="text-gray-400">
                  Or add your first cookbook using the "Add Cookbook" button above
                </p>
              </div>
            )}
          </>
        )}
        
        {activeView === 'recipes' && (
          <RecipeManager refreshTrigger={refreshTrigger} />
        )}
        
        {activeView === 'upload' && (
          <OCRUpload 
            cookbooks={cookbooks} 
            onComplete={handleOCRComplete}
          />
        )}
        
        {activeView === 'cookbooks' && (
          <CookbookManager 
            cookbooks={cookbooks} 
            onUpdate={loadCookbooks}
          />
        )}
        
        {activeView === 'ingredients' && (
          <IngredientMerge />
        )}
      </main>
    </div>
  );
}

export default App;
