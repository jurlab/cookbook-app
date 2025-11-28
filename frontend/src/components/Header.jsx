function Header({ activeView, setActiveView }) {
  const navItems = [
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'recipes', label: 'All Recipes', icon: 'list' },
    { id: 'upload', label: 'Add Cookbook', icon: 'camera' },
    { id: 'cookbooks', label: 'My Cookbooks', icon: 'book' },
    { id: 'ingredients', label: 'Ingredients', icon: 'carrot' },
  ];

  const icons = {
    search: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    camera: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    book: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    carrot: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
  };

  return (
    <header className="bg-[#1a1a1a] text-[#fffdf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center py-5">
          <div className="flex items-center gap-4">
            {/* Bauhaus-inspired geometric logo */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-[#E6A817] rounded-full"></div>
              <div className="absolute top-1 left-1 w-5 h-5 bg-[#D94E3C]"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-[#2851A3]"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                COOKBOOK
              </h1>
              <p className="text-xs tracking-[0.3em] text-[#fffdf7]/60 uppercase">Collection</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 gap-1 scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeView === item.id
                  ? 'bg-[#E6A817] text-[#1a1a1a]'
                  : 'text-[#fffdf7]/70 hover:text-[#fffdf7] hover:bg-[#fffdf7]/10'
                }
              `}
            >
              {icons[item.icon]}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
