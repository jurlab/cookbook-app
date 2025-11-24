# 🍳 Cookbook Index - Complete Setup Guide

Welcome! This guide will walk you through setting up your Cookbook Index application from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running Locally](#running-locally)
4. [Testing with Your Cookbook Photos](#testing)
5. [Deploying to Production](#deploying-to-production)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

### Required
- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
  - Sign up for Anthropic account
  - Navigate to API Keys section
  - Create a new API key
  - Copy it somewhere safe (you'll need it soon!)

API KEY

  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



### Optional
- **Git** - For version control and deployment
- **Code editor** - VS Code, Sublime Text, or your preference

---

## Initial Setup

### Step 1: Extract the Project

Extract the `cookbook-app` folder to a location on your computer where you want to work with it.

```
cookbook-app/
├── backend/     # Python API server
├── frontend/    # React web interface
└── README.md    # Main documentation
```

### Step 2: Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd cookbook-app/backend
```

**Create Python virtual environment:**
```bash
# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt when activated.

**Install Python packages:**
```bash
pip install -r requirements.txt
```

This will install FastAPI, SQLAlchemy, Anthropic, and other dependencies.

**Configure environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env file with your favorite text editor
# Add your Anthropic API key:
```

Your `.env` file should look like:
```
DATABASE_URL=sqlite:///./cookbook.db

```

### Step 3: Frontend Setup

Open a **NEW terminal window** (keep the backend terminal open) and navigate to frontend:

```bash
cd cookbook-app/frontend
```

**Install Node.js packages:**
```bash
npm install
```

This will install React, Vite, Tailwind CSS, and other dependencies. It may take a few minutes.

**Configure environment variables:**
```bash
# Copy the example file
cp .env.example .env
```

The default `.env` is already configured for local development:
```
VITE_API_URL=http://localhost:8000
```

---

## Running Locally

### Option 1: Using the Quick Start Script (Mac/Linux only)

From the project root directory:

```bash
cd cookbook-app
./start.sh
```

This will start both backend and frontend automatically!

### Option 2: Manual Start (Works on all platforms)

**Terminal 1 - Backend:**
```bash
cd cookbook-app/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Terminal 2 - Frontend:**
```bash
cd cookbook-app/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Access the Application

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (interactive API documentation)
- **Backend Health**: http://localhost:8000/health

---

## Testing with Your Cookbook Photos

Now let's test with your actual cookbook index photos!

### Step 1: Add Your First Cookbook

1. Open http://localhost:3000
2. Click the **"Add Cookbook"** tab (📸 icon)
3. Select **"+ Create new cookbook"** from the dropdown
4. Enter cookbook details:
   - Title: e.g., "Mediterranean Cookbook"
   - Author: e.g., "Jamie Oliver" (optional)
5. Click **"Upload index page photo"**
6. Select one of your cookbook index photos
7. Click **"🤖 Extract Recipes with AI"**

The AI will process your image and extract:
- Recipe names
- Page numbers
- Ingredients

### Step 2: Review Results

After processing (usually 10-30 seconds), you'll see:
- Number of recipes extracted
- Number of duplicates skipped

Click **"📸 Add Another Page"** to add more pages, or **"✓ Done"** to start searching!

### Step 3: Search for Recipes

1. Click the **"Search"** tab (🔍 icon)
2. Type an ingredient (e.g., "chicken")
3. Press Enter or click "Add"
4. Click **"🔍 Search Recipes"**

You should see all recipes containing chicken!

### Step 4: Interact with Recipes

For each recipe you can:
- ⭐ Click stars to rate (1-5)
- 👨‍🍳 Click "Cooked" button to track usage
- 📝 Click "+ Add notes" to add personal comments
- View all ingredients and cookbook info

---

## Deploying to Production

When you're ready to make your app accessible from anywhere (not just localhost), follow these steps:

### 1. Create GitHub Repository

```bash
cd cookbook-app
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy Backend to Render

**Create PostgreSQL Database:**
1. Go to https://dashboard.render.com
2. Click "New" → "PostgreSQL"
3. Configure:
   - Name: `cookbook-db`
   - Database: `cookbook`
   - Plan: **Free** (or paid for better performance)
4. Click "Create Database"
5. **Copy the "Internal Database URL"** - you'll need this!

**Deploy Backend Service:**
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `cookbook-api`
   - Region: Same as database
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
5. Plan: **Free** (or paid)
6. Click "Create Web Service"

Wait 5-10 minutes for deployment. Note your URL: `https://cookbook-api-XXXX.onrender.com`

### 3. Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://cookbook-api-XXXX.onrender.com`)
6. Click "Deploy"

Your app will be live at: `https://your-app.vercel.app`

### 4. Update Backend CORS

After frontend deployment, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app"  # Add your Vercel URL
    ],
    # ...
)
```

Commit and push this change to trigger redeployment.

### 5. Test Production App

1. Open your Vercel URL
2. Add a cookbook with index photos
3. Search for recipes
4. Everything should work exactly like local!

---

## Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'fastapi'"**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

**"Anthropic API error"**
- Check API key in `.env` is correct
- Verify API key has credits available at https://console.anthropic.com/

**"Database connection error"**
- For local: Check `DATABASE_URL=sqlite:///./cookbook.db` in `.env`
- For production: Verify Render PostgreSQL URL is correct

**"Port 8000 already in use"**
- Kill existing process: `lsof -ti:8000 | xargs kill -9`
- Or use different port: `uvicorn main:app --port 8001`

### Frontend Issues

**"npm install" fails**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Update Node.js to latest LTS: https://nodejs.org/

**"Cannot connect to API"**
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in `.env`
- Open browser console (F12) to see error details

**"Page not loading/blank screen"**
- Check terminal for error messages
- Clear browser cache
- Try incognito/private mode

**"OCR not working"**
- Verify backend is receiving the image (check backend logs)
- Check Anthropic API key is valid
- Ensure image is clear and well-lit

### Production Issues

**"Render: Build failed"**
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure `DATABASE_URL` environment variable is set

**"Vercel: Build failed"**
- Check build logs in Vercel dashboard
- Verify `package.json` is correct
- Ensure `VITE_API_URL` points to your Render backend

**"CORS errors in production"**
- Update `allow_origins` in `backend/main.py` with your Vercel URL
- Commit and push to redeploy

**"OCR expensive/slow in production"**
- Each image costs ~$0.01-0.02 with Claude Vision
- Budget ~$0.50-1.00 for processing all 15 cookbooks (~60-75 photos)
- Free Render tier sleeps after 15 min inactivity (first request may be slow)

---

## Usage Tips

### For Best OCR Results
- Take photos in good lighting
- Keep camera steady (avoid blur)
- Ensure index page is flat
- Process one page at a time
- Review extracted recipes and correct any errors

### Managing Ingredients
- Use the "Ingredients" tab regularly
- Merge similar ingredients (e.g., "tomatoes" + "tomato")
- Higher similarity threshold = stricter matching
- Lower threshold = more suggestions

### Organizing Recipes
- Rate recipes as you cook them
- Increment cook count when you make a recipe
- Add notes like "kids loved it" or "add more garlic"
- Use search filters to find highly-rated recipes

### Database Management
- Export data regularly (feature coming soon)
- Keep similar ingredients merged for cleaner searches
- Delete old/unused cookbooks to keep things tidy

---

## Next Steps

Now that you're set up:

1. ✅ Add all your cookbooks
2. ✅ Process all index pages
3. ✅ Test searching by ingredients
4. ✅ Start cooking and rating!

**Pro tip**: Add your first few cookbooks locally before deploying to production. This lets you test thoroughly and understand the workflow without any costs.

---

## Support

- **Backend docs**: See `backend/README.md`
- **Frontend docs**: See `frontend/README.md`
- **Main README**: See `README.md` in project root

Enjoy your digital cookbook collection! 🎉
