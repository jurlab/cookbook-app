# Cookbook Index API - Backend

FastAPI backend for the Cookbook Index application.

## Setup Instructions

### 1. Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### 2. Local Development Setup

```bash
# Navigate to backend directory
cd cookbook-app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Anthropic API key
# You can get one from: https://console.anthropic.com/
```

### 3. Running Locally

```bash
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

### 4. Testing the API

Once running, you can:
1. Visit http://localhost:8000/docs for interactive API documentation
2. Test endpoints directly in the browser
3. Use the frontend application to interact with the API

## API Endpoints

### Cookbooks
- `GET /cookbooks/` - List all cookbooks
- `POST /cookbooks/` - Create a new cookbook
- `GET /cookbooks/{id}` - Get cookbook details
- `DELETE /cookbooks/{id}` - Delete a cookbook

### Recipes
- `GET /recipes/` - List all recipes
- `GET /recipes/{id}` - Get recipe details
- `POST /recipes/` - Create a recipe
- `PATCH /recipes/{id}` - Update a recipe
- `DELETE /recipes/{id}` - Delete a recipe
- `POST /recipes/search` - Search recipes by ingredients
- `POST /recipes/{id}/increment-cooked` - Increment cook count

### Ingredients
- `GET /ingredients/` - List all ingredients
- `GET /ingredients/merge-suggestions` - Get merge suggestions
- `POST /ingredients/merge` - Merge two ingredients
- `DELETE /ingredients/{id}` - Delete an ingredient

### OCR
- `POST /ocr/extract` - Extract recipes from image (preview only)
- `POST /ocr/extract-and-save` - Extract and save recipes to database

## Deploying to Render

### 1. Push code to GitHub
```bash
# From project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Create PostgreSQL Database on Render
1. Go to https://dashboard.render.com
2. Click "New" -> "PostgreSQL"
3. Configure:
   - Name: `cookbook-db`
   - Database: `cookbook`
   - User: `cookbook_user`
   - Region: Choose nearest to you
   - Plan: Free (or paid for better performance)
4. Click "Create Database"
5. Copy the "Internal Database URL" (will be used in next step)

### 3. Create Web Service on Render
1. Click "New" -> "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `cookbook-api`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL from step 2
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
5. Choose Free plan (or paid)
6. Click "Create Web Service"

### 4. Note Your API URL
After deployment, Render will give you a URL like:
`https://cookbook-api-xxxx.onrender.com`

Save this URL - you'll need it for the frontend configuration.

## Database

The application uses SQLAlchemy ORM with:
- **Local development**: SQLite (file-based database)
- **Production**: PostgreSQL (on Render)

Database migrations are handled automatically on startup through SQLAlchemy's `create_all()`.

## Environment Variables

Required environment variables:

- `DATABASE_URL`: Database connection string
- `ANTHROPIC_API_KEY`: API key for Claude Vision OCR

## Project Structure

```
backend/
├── app/
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # Database configuration
│   ├── routers/            # API endpoints
│   │   ├── cookbooks.py
│   │   ├── recipes.py
│   │   ├── ingredients.py
│   │   └── ocr.py
│   └── services/           # Business logic
│       ├── ocr_service.py
│       └── ingredient_service.py
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
└── .env.example           # Environment variables template
```

## Troubleshooting

### "ModuleNotFoundError"
Make sure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### "Database connection error"
Check your DATABASE_URL in .env file is correct.

### "Anthropic API error"
Verify your ANTHROPIC_API_KEY in .env is valid and has credits available.

### Render deployment issues
- Check build logs in Render dashboard
- Ensure environment variables are set correctly
- Verify DATABASE_URL uses `postgresql://` not `postgres://`
