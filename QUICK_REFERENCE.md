# 📚 Cookbook Index - Quick Reference

## 🚀 One-Command Setup (After Prerequisites)

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env - add ANTHROPIC_API_KEY
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

## 📋 Project Structure

```
cookbook-app/
├── backend/              # FastAPI server
│   ├── app/
│   │   ├── models.py      # Database models
│   │   ├── schemas.py     # API schemas
│   │   ├── database.py    # DB config
│   │   ├── routers/       # API endpoints
│   │   └── services/      # Business logic
│   ├── main.py            # FastAPI app
│   ├── requirements.txt   # Python deps
│   └── .env              # Config (create from .env.example)
│
├── frontend/             # React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API client
│   │   ├── App.jsx       # Main app
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Node deps
│   └── .env             # Config (create from .env.example)
│
└── README.md            # Main docs
```

## 🔑 Environment Variables

**backend/.env:**
```
DATABASE_URL=sqlite:///./cookbook.db
ANTHROPIC_API_KEY=your_key_here
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:8000
```

## 🛠️ Common Commands

### Backend
```bash
# Activate venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Run server
uvicorn main:app --reload

# Run on different port
uvicorn main:app --port 8001

# View API docs
open http://localhost:8000/docs
```

### Frontend
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# SQLite (local)
sqlite3 cookbook.db
.tables
.schema recipes

# PostgreSQL (production)
# Use Render dashboard or psql
```

## 🎯 Key Features

### Search
- Type ingredients in search bar
- Choose AND (all) or OR (any)
- Filter by cookbook or rating
- Click search to find recipes

### Add Cookbook
1. Click "Add Cookbook" tab
2. Create new or select existing
3. Upload index page photo
4. AI extracts recipes automatically
5. Review and add more pages

### Recipe Management
- ⭐ Click stars to rate
- 👨‍🍳 Click "Cooked" to increment
- 📝 Add personal notes
- View ingredients and page number

### Ingredient Management
- View all ingredients
- Get merge suggestions
- Combine duplicates/variations
- Keep database clean

## 🌐 Deployment Checklist

### Render (Backend)
- [ ] Create PostgreSQL database
- [ ] Copy Internal Database URL
- [ ] Create Web Service
- [ ] Set root directory: `backend`
- [ ] Set build: `pip install -r requirements.txt`
- [ ] Set start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add env var: `DATABASE_URL`
- [ ] Add env var: `ANTHROPIC_API_KEY`
- [ ] Deploy and note URL

### Vercel (Frontend)
- [ ] Create new project
- [ ] Import GitHub repo
- [ ] Set root directory: `frontend`
- [ ] Set framework: `Vite`
- [ ] Set build: `npm run build`
- [ ] Set output: `dist`
- [ ] Add env var: `VITE_API_URL` (Render URL)
- [ ] Deploy

### Post-Deployment
- [ ] Update CORS in `backend/main.py`
- [ ] Add Vercel URL to `allow_origins`
- [ ] Commit and push to redeploy
- [ ] Test production app

## 💰 Cost Estimate

### Free Tier (Total: $0/month)
- Render PostgreSQL: 1GB storage (free)
- Render Web Service: 750 hrs/month (free, sleeps after 15 min)
- Vercel: Unlimited deployments (free)
- Claude API: Pay per use (~$0.01-0.02 per photo)

**Initial OCR**: ~$0.50-1.00 for 15 cookbooks (60-75 photos)
**Ongoing**: $0/month (no OCR needed after initial setup)

### Paid Tier (~$7-10/month)
- Render Web Service: $7/month (always on, better performance)
- Render PostgreSQL: Free tier sufficient for this app
- Vercel: Free tier sufficient

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `lsof -ti:8000 \| xargs kill -9` |
| Module not found | Activate venv, reinstall deps |
| Cannot connect to API | Check backend is running, check VITE_API_URL |
| CORS error | Add frontend URL to allow_origins |
| OCR fails | Check ANTHROPIC_API_KEY, verify image is clear |
| Build fails | Check logs, verify all files committed |
| Render sleeps | First request after 15 min will be slow |

## 📱 Keyboard Shortcuts

- **Search**: Enter to add ingredient
- **Navigate**: Tab between fields
- **Submit**: Enter to search/save
- **Close**: Esc to cancel dialogs

## 📊 API Endpoints

### Cookbooks
- `GET /cookbooks/` - List all
- `POST /cookbooks/` - Create
- `DELETE /cookbooks/{id}` - Delete

### Recipes
- `GET /recipes/` - List all
- `POST /recipes/search` - Search by ingredients
- `PATCH /recipes/{id}` - Update
- `POST /recipes/{id}/increment-cooked` - Track cooking

### Ingredients
- `GET /ingredients/` - List all
- `GET /ingredients/merge-suggestions` - Get suggestions
- `POST /ingredients/merge` - Merge two ingredients

### OCR
- `POST /ocr/extract` - Preview extraction
- `POST /ocr/extract-and-save` - Extract and save

Full API docs: http://localhost:8000/docs

## 💡 Pro Tips

1. **Test locally first** - Process 1-2 cookbooks before deploying
2. **Batch upload** - Process all pages of one cookbook at once
3. **Merge ingredients** - Run merge suggestions after adding all cookbooks
4. **Rate as you cook** - Make it a habit to rate after cooking
5. **Use notes** - Track modifications, favorites, allergies
6. **Filter searches** - Combine ingredient search with cookbook filter
7. **Backup data** - Export/import feature coming soon, for now rely on DB backups

## 📞 Getting Help

- **Setup issues**: See SETUP_GUIDE.md
- **Backend questions**: See backend/README.md
- **Frontend questions**: See frontend/README.md
- **General info**: See README.md

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can create a cookbook
- [ ] Can upload and process an image
- [ ] Recipes appear in database
- [ ] Can search for ingredients
- [ ] Can rate and track recipes
- [ ] Ingredient merge works

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
