import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Mock interfaces - these should be replaced with actual types
interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  currency: string;
  publishDate: Date;
  closingDate: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
  organizationId: string;
  organizationName: string;
  documents?: TenderDocument[];
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TenderDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  isRequired: boolean;
}

interface TenderFilters {
  category?: string;
  status?: string;
  minValue?: number;
  maxValue?: number;
  organizationId?: string;
  search?: string;
  sortBy?: 'publishDate' | 'closingDate' | 'estimatedValue' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface TenderState {
  tenders: Tender[];
  currentTender: Tender | null;
  isLoading: boolean;
  error: string | null;
  filters: TenderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchResults: Tender[];
  isSearching: boolean;
}

const initialState: TenderState = {
  tenders: [],
  currentTender: null,
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'publishDate',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchResults: [],
  isSearching: false,
};

// Async thunks - these would connect to actual API endpoints
export const fetchTenders = createAsyncThunk(
  'tenders/fetchTenders',
  async (params: { page?: number; limit?: number; filters?: TenderFilters }, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual service
      const response = await fetch(`/api/tenders?page=${params.page || 1}&limit=${params.limit || 10}`);
      if (!response.ok) throw new Error('Failed to fetch tenders');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTenderById = createAsyncThunk(
  'tenders/fetchTenderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tenders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch tender');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTender = createAsyncThunk(
  'tenders/createTender',
  async (tenderData: Partial<Tender>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData),
      });
      if (!response.ok) throw new Error('Failed to create tender');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTender = createAsyncThunk(
  'tenders/updateTender',
  async ({ id, data }: { id: string; data: Partial<Tender> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update tender');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTender = createAsyncThunk(
  'tenders/deleteTender',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tenders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete tender');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchTenders = createAsyncThunk(
  'tenders/searchTenders',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tenders/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tenderSlice = createSlice({
  name: 'tenders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<TenderFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'publishDate',
        sortOrder: 'desc',
      };
    },
    setCurrentTender: (state, action: PayloadAction<Tender | null>) => {
      state.currentTender = action.payload;
    },
    clearCurrentTender: (state) => {
      state.currentTender = null;
    },
    setPagination: (state, action: PayloadAction<Partial<TenderState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tenders
      .addCase(fetchTenders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch tender by ID
      .addCase(fetchTenderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTender = action.payload;
      })
      .addCase(fetchTenderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create tender
      .addCase(createTender.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTender.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenders.unshift(action.payload);
      })
      .addCase(createTender.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update tender
      .addCase(updateTender.fulfilled, (state, action) => {
        const index = state.tenders.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenders[index] = action.payload;
        }
        if (state.currentTender?.id === action.payload.id) {
          state.currentTender = action.payload;
        }
      })
      
      // Delete tender
      .addCase(deleteTender.fulfilled, (state, action) => {
        state.tenders = state.tenders.filter(t => t.id !== action.payload);
        if (state.currentTender?.id === action.payload) {
          state.currentTender = null;
        }
      })
      
      // Search tenders
      .addCase(searchTenders.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchTenders.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTenders.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentTender,
  clearCurrentTender,
  setPagination,
  clearSearchResults,
} = tenderSlice.actions;

export default tenderSlice.reducer;
