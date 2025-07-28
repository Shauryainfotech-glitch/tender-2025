import api from './api';

export const searchService = {
  // Perform search with filters
  performSearch: async (params: {
    query?: string;
    filters?: any[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    return api.post('/search', params);
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string) => {
    return api.get('/search/suggestions', { params: { query } });
  },

  // Saved searches
  getSavedSearches: async (params?: any) => {
    return api.get('/search/saved', { params });
  },

  getSavedSearch: async (id: string) => {
    return api.get(`/search/saved/${id}`);
  },

  createSavedSearch: async (data: any) => {
    return api.post('/search/saved', data);
  },

  updateSavedSearch: async (id: string, data: any) => {
    return api.put(`/search/saved/${id}`, data);
  },

  deleteSavedSearch: async (id: string) => {
    return api.delete(`/search/saved/${id}`);
  },

  // Search history
  getSearchHistory: async (params?: any) => {
    return api.get('/search/history', { params });
  },

  saveSearchHistory: async (data: any) => {
    return api.post('/search/history', data);
  },

  clearSearchHistory: async () => {
    return api.delete('/search/history');
  },

  // Trending searches
  getTrendingSearches: async (params?: any) => {
    return api.get('/search/trending', { params });
  },

  // Export search results
  exportSearchResults: async (params: {
    query?: string;
    filters?: any[];
    format: 'csv' | 'excel' | 'pdf';
  }) => {
    return api.post('/search/export', params, {
      responseType: 'blob',
    });
  },

  // Search analytics
  getSearchAnalytics: async (params?: any) => {
    return api.get('/search/analytics', { params });
  },

  // Elasticsearch specific
  reindexContent: async () => {
    return api.post('/search/reindex');
  },

  getIndexStats: async () => {
    return api.get('/search/stats');
  },

  // Advanced search features
  searchByCategory: async (category: string, params?: any) => {
    return api.get(`/search/category/${category}`, { params });
  },

  searchBySimilarity: async (documentId: string, params?: any) => {
    return api.get(`/search/similar/${documentId}`, { params });
  },

  // Faceted search
  getSearchFacets: async (params?: any) => {
    return api.get('/search/facets', { params });
  },

  // Search filters configuration
  getFilterOptions: async () => {
    return api.get('/search/filters/options');
  },

  // Full-text search specific endpoints
  searchTenders: async (params: any) => {
    return api.post('/search/tenders', params);
  },

  searchDocuments: async (params: any) => {
    return api.post('/search/documents', params);
  },

  searchVendors: async (params: any) => {
    return api.post('/search/vendors', params);
  },

  searchBids: async (params: any) => {
    return api.post('/search/bids', params);
  },

  // Global search
  globalSearch: async (query: string, params?: any) => {
    return api.get('/search/global', { params: { query, ...params } });
  },

  // Search preferences
  getSearchPreferences: async () => {
    return api.get('/search/preferences');
  },

  updateSearchPreferences: async (data: any) => {
    return api.put('/search/preferences', data);
  },

  // Search templates
  getSearchTemplates: async () => {
    return api.get('/search/templates');
  },

  createSearchTemplate: async (data: any) => {
    return api.post('/search/templates', data);
  },

  updateSearchTemplate: async (id: string, data: any) => {
    return api.put(`/search/templates/${id}`, data);
  },

  deleteSearchTemplate: async (id: string) => {
    return api.delete(`/search/templates/${id}`);
  },

  // Batch operations
  batchSearch: async (searches: any[]) => {
    return api.post('/search/batch', { searches });
  },

  // Search monitoring
  getSearchMetrics: async (params?: any) => {
    return api.get('/search/metrics', { params });
  },

  // AI-powered search
  semanticSearch: async (params: {
    query: string;
    context?: string;
    filters?: any[];
  }) => {
    return api.post('/search/semantic', params);
  },

  // Search suggestions based on context
  getContextualSuggestions: async (context: string) => {
    return api.get('/search/suggestions/contextual', { params: { context } });
  },

  // Search shortcuts
  getSearchShortcuts: async () => {
    return api.get('/search/shortcuts');
  },

  createSearchShortcut: async (data: any) => {
    return api.post('/search/shortcuts', data);
  },

  deleteSearchShortcut: async (id: string) => {
    return api.delete(`/search/shortcuts/${id}`);
  },
};

export default searchService;
