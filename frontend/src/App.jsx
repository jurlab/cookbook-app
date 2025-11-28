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
  const [activeView, setActiveView] = useState('search');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setRefreshTrigger(prev => prev + 1);
    setActiveView('search');
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'search' && (
          <>
            <SearchBar onSearch={handleSearch} cookbooks={cookbooks} />
            
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#1a1a1a]/20 border-t-[#D94E3C] rounded-full animate-spin"></div>
                <p className="mt-4 text-[#1a1a1a]/60 font-medium uppercase tracking-wide">Searching recipes...</p>
              </div>
            )}
            
            {!loading && searchPerformed && recipes.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-[#1a1a1a]/20 bg-[#fffdf7]">
                <p className="text-[#1a1a1a]/60 text-lg">No recipes found. Try different ingredients!</p>
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
              <div className="text-center py-16 border-2 border-dashed border-[#1a1a1a]/20 bg-[#fffdf7]">
                {/* Bauhaus-inspired decorative element */}
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-[#E6A817] rounded-full opacity-20"></div>
                  <div className="absolute inset-4 bg-[#E6A817] rounded-full opacity-40"></div>
                  <div className="absolute inset-8 bg-[#E6A817] rounded-full"></div>
                </div>
                <p className="text-[#1a1a1a]/70 text-lg mb-2 font-medium">
                  Search by ingredients to find recipes
                </p>
                <p className="text-[#1a1a1a]/40">
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

      {/* Bauhaus footer decoration */}
      <footer className="mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-2">
          <div className="w-8 h-2 bg-[#D94E3C]"></div>
          <div className="w-8 h-2 bg-[#E6A817]"></div>
          <div className="w-8 h-2 bg-[#2851A3]"></div>
        </div>
      </footer>
    </div>
  );
}

export default App;
