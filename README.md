# 🍳 Cookbook Index - Recipe Management System

A full-stack web application for digitizing and searching through your physical cookbook collection. Upload photos of cookbook indices, and use AI-powered OCR to extract recipes and make them searchable by ingredients.

## ✨ Features

- 📸 **AI-Powered OCR**: Upload photos of cookbook index pages and automatically extract recipes using Claude Vision
- 🔍 **Intelligent Search**: Find recipes by ingredients with AND/OR logic
- ⭐ **Recipe Tracking**: Rate recipes and track how many times you've cooked them
- 📝 **Personal Notes**: Add notes and modifications to recipes
- 🥕 **Ingredient Management**: Automatically suggest merging similar ingredients
- 📚 **Multi-Cookbook Support**: Manage multiple cookbooks in one place
- 📱 **iPad Optimized**: Mobile-first design perfect for use while cooking

## 🏗️ Architecture

**Backend**
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- Anthropic Claude API for OCR
- Deployed on Render

**Frontend**
- React + Vite
- Tailwind CSS
- Axios for API calls
- Deployed on Vercel

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Local Development

**1. Clone the repository**
```bash
git clone YOUR_REPO_URL
cd cookbook-app
```

**2. Setup Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
uvicorn main:app --reload
```

Backend will be available at http://localhost:8000

**3. Setup Frontend** (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

Frontend will be available at http://localhost:3000

### First Steps

1. **Add a Cookbook**: Click "Add Cookbook" tab
2. **Upload Index Photos**: Take clear photos of your cookbook index pages
3. **Extract Recipes**: Let AI extract recipes automatically
4. **Search**: Use the search tab to find recipes by ingredient!

## 📖 Documentation

- [Backend Documentation](backend/README.md) - API setup, endpoints, deployment
- [Frontend Documentation](frontend/README.md) - UI components, features, deployment

## 🌐 Deployment

### Deploy to Render (Backend) + Vercel (Frontend)

**Cost**: Free tier available (with limitations)

See detailed deployment instructions in:
- [Backend Deployment Guide](backend/README.md#deploying-to-render)
- [Frontend Deployment Guide](frontend/README.md#deploying-to-vercel)

## 📸 Example Workflow

1. Take photos of your cookbook index pages (2-3 pages per cookbook typically)
2. Upload them via the "Add Cookbook" interface
3. AI extracts recipes with ingredients and page numbers
4. Search for "chicken" - find all chicken recipes across all your cookbooks!
5. Rate recipes as you cook them
6. Track how many times you've made each recipe
7. Add personal notes like "add more garlic" or "kids loved it"

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **PostgreSQL**: Relational database for structured queries
- **SQLAlchemy**: Python ORM
- **Anthropic Claude**: AI vision for OCR
- **Pydantic**: Data validation

### Frontend
- **React**: UI library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client

## 📊 Database Schema

```
cookbooks
├── id
├── title
├── author
├── cover_image_url
└── date_added

recipes
├── id
├── cookbook_id (FK)
├── name
├── page_number
├── rating (0-5)
├── times_cooked
├── notes
└── date_added

ingredients
├── id
├── name
└── normalized_name

recipe_ingredients (junction table)
├── recipe_id
└── ingredient_id
```

## 🔑 Key Design Decisions

1. **Ingredient-First Indexing**: Matches how cookbook indices work - recipes are organized by ingredients
2. **AI OCR**: Uses Claude Vision for accurate extraction from photos
3. **Normalization**: Automatic ingredient normalization (e.g., "tomatoes" → "tomato")
4. **Deduplication**: Same recipe appearing under multiple ingredients is handled correctly
5. **Progressive Web App**: Works offline and can be installed on iPad
6. **Local-First**: Can run entirely on SQLite for privacy

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📝 License

MIT License - feel free to use and modify for your own cookbook collection!

## 🎯 Future Ideas

- [ ] Recipe image uploads
- [ ] Shopping list generation
- [ ] Meal planning calendar
- [ ] Recipe sharing
- [ ] Print-friendly views
- [ ] Dark mode
- [ ] Mobile app version
- [ ] Voice search
- [ ] Nutrition information
- [ ] Recipe scaling (2x, 1/2x)

## 💡 Tips

- Take clear, well-lit photos of index pages
- Process one page at a time for best results
- Use the ingredient merge feature to keep your database clean
- Add notes as you cook to remember modifications
- Rate recipes to find your favorites quickly

## 🐛 Troubleshooting

See documentation in backend/README.md and frontend/README.md for detailed troubleshooting guides.

## 📧 Questions?

Create an issue or check the documentation in the backend/ and frontend/ directories.

---

Built with ❤️ for home cooks who love their cookbook collections!
