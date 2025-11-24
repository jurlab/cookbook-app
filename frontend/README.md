# Cookbook Index - Frontend

React frontend for the Cookbook Index application with Tailwind CSS.

## Setup Instructions

### 1. Prerequisites
- Node.js 16 or higher
- npm (comes with Node.js)

### 2. Local Development Setup

```bash
# Navigate to frontend directory
cd cookbook-app/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (default points to localhost:8000)
```

### 3. Running Locally

```bash
# Make sure backend is running first (see backend/README.md)

# Start development server
npm run dev
```

The application will be available at: http://localhost:3000

### 4. Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Features

### 🔍 Search
- Search recipes by ingredient(s)
- AND/OR operator for flexible searching
- Filter by cookbook
- Filter by minimum rating
- View all matching recipes with full details

### 📸 Add Cookbook
- Upload index page photos
- AI-powered OCR extraction using Claude Vision
- Create new cookbooks or add to existing ones
- Automatic duplicate detection

### 📚 My Cookbooks
- View all your cookbooks
- See recipe counts
- Delete cookbooks (with confirmation)

### 🥕 Ingredients
- View ingredient merge suggestions
- Merge similar ingredients automatically
- Adjustable similarity threshold
- Keep your ingredient list organized

### Recipe Cards
- Star rating (1-5 stars)
- Cook count tracking with one click
- Add personal notes
- View all ingredients
- See cookbook and page number

## Deploying to Vercel

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

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://cookbook-api-xxxx.onrender.com`)
6. Click "Deploy"

### 3. Update Backend CORS
After deployment, update your backend's CORS settings to allow requests from your Vercel domain.

In `backend/main.py`, update the `allow_origins` list:
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

## Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── RecipeList.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── OCRUpload.jsx
│   │   ├── CookbookManager.jsx
│   │   └── IngredientMerge.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles (Tailwind)
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls

## Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR). Changes to components will reflect immediately without full page reload.

### Responsive Design
The app is optimized for iPad but works on all screen sizes. Test on different devices using browser DevTools.

### API Integration
All API calls are in `/src/services/api.js`. The base URL is configurable via `VITE_API_URL` environment variable.

## Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in `.env` is correct
- Check browser console for CORS errors

### "npm install" fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try updating Node.js to latest LTS version

### Styles not loading
- Ensure Tailwind is properly configured
- Check that `index.css` imports are at top of main.jsx
- Clear browser cache

### Build errors
- Check for syntax errors in components
- Ensure all imports are correct
- Try deleting `node_modules` and reinstalling

## iPad Optimization

The app is specifically optimized for iPad use:
- Large touch targets (minimum 44x44px)
- Comfortable font sizes
- Responsive grid layouts
- Easy navigation
- Quick actions (increment cook count, rating)

## Future Enhancements

Ideas for future development:
- Recipe image uploads
- Shopping list generation from ingredients
- Meal planning calendar
- Recipe sharing between users
- Print-friendly recipe pages
- Dark mode
- Offline support with Service Workers
