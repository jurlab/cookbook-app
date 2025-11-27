import axios from 'axios';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cookbookAPI = {
  getAll: () => api.get('/cookbooks/'),
  getById: (id) => api.get(`/cookbooks/${id}`),
  create: (data) => api.post('/cookbooks/', data),
  delete: (id) => api.delete(`/cookbooks/${id}`),
};

export const recipeAPI = {
  getAll: (cookbookId = null, page = 1, limit = 50) => {
    const params = { page, limit };
    if (cookbookId) {
      params.cookbook_id = cookbookId;
    }
    return api.get('/recipes/', { params });
  },
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes/', data),
  update: (id, data) => api.patch(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  search: (searchData) => api.post('/recipes/search', searchData),
  incrementCooked: (id) => api.post(`/recipes/${id}/increment-cooked`),
  exportCSV: () => api.get('/recipes/export/csv', { responseType: 'blob' }),
};

export const ingredientAPI = {
  getAll: () => api.get('/ingredients/'),
  getMergeSuggestions: (threshold = 0.75) => 
    api.get('/ingredients/merge-suggestions', { params: { threshold } }),
  merge: (sourceId, targetId) => 
    api.post('/ingredients/merge', null, { params: { source_id: sourceId, target_id: targetId } }),
  delete: (id) => api.delete(`/ingredients/${id}`),
};

export const ocrAPI = {
  extract: (data) => api.post('/ocr/extract', data),
  extractAndSave: (data) => api.post('/ocr/extract-and-save', data),
};

export default api;
