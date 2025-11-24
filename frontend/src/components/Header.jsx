function Header({ activeView, setActiveView }) {
  const navItems = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'recipes', label: 'All Recipes', icon: '📝' },
    { id: 'upload', label: 'Add Cookbook', icon: '📸' },
    { id: 'cookbooks', label: 'My Cookbooks', icon: '📚' },
    { id: 'ingredients', label: 'Ingredients', icon: '🥕' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🍳</span>
            <h1 className="text-2xl font-bold text-gray-900">
              My Cookbook Collection
            </h1>
          </div>
        </div>
        
        <nav className="flex space-x-1 border-t border-gray-200 -mb-px">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                px-6 py-3 text-sm font-medium transition-colors
                ${activeView === item.id
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
