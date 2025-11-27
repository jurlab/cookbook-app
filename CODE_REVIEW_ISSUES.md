# Code Review: Performance and Stability Issues

This document highlights potential issues that could affect performance and stability of the cookbook application.

## 🔴 Critical Issues (Must Fix)

### 1. Missing Import - Runtime Error
**File:** `backend/app/routers/recipes.py:256`
- **Issue:** `StreamingResponse` is used but not imported
- **Impact:** CSV export endpoint will crash at runtime
- **Fix:** Add `from fastapi.responses import StreamingResponse`

### 2. Deprecated Pydantic API
**File:** `backend/app/routers/recipes.py` (lines 37, 52, 197)
- **Issue:** Using deprecated `RecipeSchema.from_orm(recipe).dict()` 
- **Impact:** May break with future Pydantic updates, less efficient
- **Fix:** Use `RecipeSchema.model_validate(recipe).model_dump()` for Pydantic v2

### 3. N+1 Query Problem
**File:** `backend/app/routers/cookbooks.py:23`
- **Issue:** `len(cookbook.recipes)` triggers a separate query for each cookbook
- **Impact:** With 100 cookbooks, this executes 101 queries instead of 2
- **Fix:** Use `joinedload` or `selectinload` to eager load recipes, or use `func.count()` in SQL

### 4. O(n²) Complexity in Similarity Search
**File:** `backend/app/services/ingredient_service.py:58, 98`
- **Issue:** `db.query(Ingredient).all()` loads ALL ingredients into memory, then compares each pair
- **Impact:** With 1000 ingredients, this performs ~500,000 comparisons
- **Fix:** Use database-level similarity functions (PostgreSQL trigram) or limit comparisons

### 5. CORS Security Issue
**File:** `backend/main.py:19`
- **Issue:** `allow_origins=["*"]` allows any origin
- **Impact:** Security vulnerability, allows any website to access your API
- **Fix:** Set specific allowed origins in production

## 🟡 Performance Issues

### 6. Missing Database Indexes
**Files:** `backend/app/models.py`
- **Issue:** No explicit indexes on frequently queried columns
- **Impact:** Slow queries as data grows
- **Recommendations:**
  - Add index on `Recipe.cookbook_id` (already has FK, but explicit index helps)
  - Add composite index on `(Ingredient.normalized_name, Ingredient.name)` for search
  - Add index on `Recipe.rating` if filtering by rating

### 7. No Connection Pooling Configuration
**File:** `backend/app/database.py:12`
- **Issue:** SQLAlchemy engine has no pool configuration
- **Impact:** Can exhaust database connections under load
- **Fix:** Add `pool_size`, `max_overflow`, `pool_pre_ping` parameters

### 8. Loading All Data Without Pagination
**Files:** 
- `backend/app/routers/ingredients.py:14` - loads all ingredients
- `backend/app/routers/cookbooks.py:13` - loads all cookbooks
- `backend/app/routers/recipes.py:220` - loads all recipes for CSV export
- **Impact:** Memory issues with large datasets, slow response times
- **Fix:** Implement pagination or streaming for large datasets

### 9. Large Limit Without Proper Handling
**File:** `backend/app/routers/recipes.py:22`
- **Issue:** Default limit of 10,000 recipes loaded into memory
- **Impact:** High memory usage, slow response times
- **Fix:** Reduce default limit, add proper pagination

### 10. Inefficient Recipe Search Query
**File:** `backend/app/routers/recipes.py:176-178`
- **Issue:** AND operator uses multiple `.filter()` calls which may not be optimal
- **Impact:** Slow queries with many ingredients
- **Fix:** Use subquery or `group_by` with `having` clause

### 11. Missing Eager Loading in Search
**File:** `backend/app/routers/recipes.py:192`
- **Issue:** Search results don't eager load `cookbook` relationship
- **Impact:** N+1 queries when accessing cookbook data
- **Fix:** Add `.options(joinedload(Recipe.cookbook))`

### 12. No Query Result Caching
**Files:** Multiple router files
- **Issue:** No caching for frequently accessed data (cookbooks, ingredients list)
- **Impact:** Unnecessary database queries
- **Fix:** Implement Redis or in-memory caching with TTL

## 🟠 Stability Issues

### 13. Missing Error Boundaries (Frontend)
**Files:** `frontend/src/App.jsx`, all components
- **Issue:** No React error boundaries to catch component errors
- **Impact:** One component error crashes entire app
- **Fix:** Add error boundaries around major sections

### 14. No Request Cancellation (Frontend)
**Files:** `frontend/src/services/api.js`, components
- **Issue:** No AbortController for canceling in-flight requests
- **Impact:** Memory leaks, race conditions when navigating quickly
- **Fix:** Implement request cancellation with AbortController

### 15. Potential Memory Leaks (Frontend)
**Files:** `frontend/src/components/OCRUpload.jsx:59`
- **Issue:** FileReader not cleaned up if component unmounts
- **Impact:** Memory leaks with large images
- **Fix:** Add cleanup in useEffect return function

### 16. No Rate Limiting
**File:** `backend/main.py`
- **Issue:** No rate limiting on API endpoints
- **Impact:** Vulnerable to abuse, DoS attacks
- **Fix:** Add `slowapi` or similar middleware

### 17. Missing Input Validation
**Files:** Multiple router files
- **Issue:** Limited validation on user inputs (e.g., ingredient names, recipe names)
- **Impact:** Potential SQL injection (though SQLAlchemy helps), data quality issues
- **Fix:** Add Pydantic validators for length, format, etc.

### 18. No Transaction Isolation
**File:** `backend/app/routers/ocr.py:138`
- **Issue:** Large batch operations commit all at once
- **Impact:** If one recipe fails, entire batch rolls back (may be intentional, but no partial success)
- **Fix:** Consider batch commits or better error handling

### 19. Missing Database Migrations
**File:** `backend/main.py:8`
- **Issue:** Using `create_all()` for schema changes
- **Impact:** Can't handle schema migrations in production, data loss risk
- **Fix:** Use Alembic for proper migrations

### 20. No Health Check for Database
**File:** `backend/main.py:45`
- **Issue:** Health check doesn't verify database connectivity
- **Impact:** App reports healthy even if database is down
- **Fix:** Add database ping to health check

## 🔵 Frontend Performance Issues

### 21. No Debouncing on Search
**File:** `frontend/src/components/SearchBar.jsx` (if exists)
- **Issue:** Search likely fires on every keystroke
- **Impact:** Excessive API calls
- **Fix:** Add debouncing (300-500ms)

### 22. No Virtualization for Large Lists
**File:** `frontend/src/components/RecipeList.jsx:12`
- **Issue:** Renders all recipes in DOM
- **Impact:** Slow rendering with 1000+ recipes
- **Fix:** Use `react-window` or `react-virtualized`

### 23. No API Response Caching
**File:** `frontend/src/services/api.js`
- **Issue:** No caching of API responses
- **Impact:** Redundant network requests
- **Fix:** Implement React Query or SWR for caching

### 24. Large Image Handling
**File:** `frontend/src/components/OCRUpload.jsx:61`
- **Issue:** No image size validation or compression before upload
- **Impact:** Slow uploads, high bandwidth usage
- **Fix:** Add client-side image compression

### 25. Missing Loading States
**Files:** Various components
- **Issue:** Some operations don't show loading indicators
- **Impact:** Poor UX, users may click multiple times
- **Fix:** Add loading states for all async operations

## 📊 Database Issues

### 26. SQLite in Production
**File:** `backend/app/database.py:10`
- **Issue:** Defaults to SQLite which doesn't scale
- **Impact:** Performance issues, concurrency problems
- **Fix:** Use PostgreSQL in production (already supported, but default should be clearer)

### 27. No Database Connection Retry Logic
**File:** `backend/app/database.py`
- **Issue:** No retry logic for database connection failures
- **Impact:** App crashes on transient database issues
- **Fix:** Add connection retry with exponential backoff

### 28. Missing Foreign Key Constraints
**File:** `backend/app/models.py`
- **Issue:** Foreign keys exist but no explicit constraint validation
- **Impact:** Potential orphaned records
- **Note:** SQLAlchemy handles this, but explicit constraints help

## 🔧 Code Quality Issues

### 29. Inconsistent Error Handling
**Files:** Multiple files
- **Issue:** Some endpoints return generic errors, others are more specific
- **Impact:** Harder to debug issues
- **Fix:** Standardize error responses

### 30. Missing Logging
**Files:** Most router files
- **Issue:** Limited logging for debugging
- **Impact:** Hard to troubleshoot production issues
- **Fix:** Add structured logging (e.g., with `structlog`)

### 31. No API Versioning
**File:** `backend/main.py`
- **Issue:** No API versioning strategy
- **Impact:** Breaking changes affect all clients
- **Fix:** Add version prefix (e.g., `/api/v1/`)

## 📝 Recommendations Priority

### High Priority (Fix Immediately)
1. Missing StreamingResponse import (#1)
2. Deprecated Pydantic API (#2)
3. N+1 query in cookbooks (#3)
4. CORS security (#5)

### Medium Priority (Fix Soon)
5. Connection pooling (#7)
6. Database indexes (#6)
7. Pagination (#8, #9)
8. Error boundaries (#13)
9. Rate limiting (#16)

### Low Priority (Nice to Have)
10. Caching (#12, #23)
11. Virtualization (#22)
12. Request cancellation (#14)
13. Image compression (#24)

## 🎯 Quick Wins

These can be fixed quickly with high impact:

1. **Add StreamingResponse import** - 1 line fix
2. **Fix Pydantic API** - 3 line changes
3. **Add connection pooling** - 3-4 lines
4. **Fix N+1 query in cookbooks** - Use `func.count()` in query
5. **Add database indexes** - Add to model definitions
6. **Add error boundaries** - Wrap main sections in React

---

*Generated: $(date)*
*Reviewer: AI Code Review*

