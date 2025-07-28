import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Bid {
  id: string;
  tenderId: string;
  tenderTitle: string;
  bidderId: string;
  bidderName: string;
  bidderOrganization: string;
  proposedAmount: number;
  currency: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submissionDate: Date;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  rank?: number;
  documents: BidDocument[];
  proposal: string;
  compliance: {
    technical: boolean;
    financial: boolean;
    documentation: boolean;
  };
  evaluationComments?: string;
  evaluatedBy?: string;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface BidDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  isRequired: boolean;
  uploadedAt: Date;
}

interface BidFilters {
  tenderId?: string;
  status?: string;
  bidderId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'submissionDate' | 'proposedAmount' | 'totalScore' | 'rank';
  sortOrder?: 'asc' | 'desc';
}

interface BidState {
  bids: Bid[];
  currentBid: Bid | null;
  myBids: Bid[];
  tenderBids: Bid[];
  isLoading: boolean;
  error: string | null;
  filters: BidFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  submissionStatus: {
    isSubmitting: boolean;
    submitError: string | null;
  };
}

const initialState: BidState = {
  bids: [],
  currentBid: null,
  myBids: [],
  tenderBids: [],
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'submissionDate',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  submissionStatus: {
    isSubmitting: false,
    submitError: null,
  },
};

// Async thunks
export const fetchBids = createAsyncThunk(
  'bids/fetchBids',
  async (params: { page?: number; limit?: number; filters?: BidFilters }, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/bids?page=${params.page || 1}&limit=${params.limit || 10}`);
      if (!response.ok) throw new Error('Failed to fetch bids');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/bids/my-bids');
      if (!response.ok) throw new Error('Failed to fetch my bids');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBidsByTender = createAsyncThunk(
  'bids/fetchBidsByTender',
  async (tenderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/tender/${tenderId}`);
      if (!response.ok) throw new Error('Failed to fetch tender bids');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBidById = createAsyncThunk(
  'bids/fetchBidById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData: Partial<Bid>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData),
      });
      if (!response.ok) throw new Error('Failed to create bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBid = createAsyncThunk(
  'bids/updateBid',
  async ({ id, data }: { id: string; data: Partial<Bid> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/${id}/submit`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to submit bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawBid = createAsyncThunk(
  'bids/withdrawBid',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/${id}/withdraw`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to withdraw bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const evaluateBid = createAsyncThunk(
  'bids/evaluateBid',
  async ({ id, evaluation }: { id: string; evaluation: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bids/${id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation),
      });
      if (!response.ok) throw new Error('Failed to evaluate bid');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.submissionStatus.submitError = null;
    },
    setFilters: (state, action: PayloadAction<BidFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'submissionDate',
        sortOrder: 'desc',
      };
    },
    setCurrentBid: (state, action: PayloadAction<Bid | null>) => {
      state.currentBid = action.payload;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    setPagination: (state, action: PayloadAction<Partial<BidState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSubmissionStatus: (state) => {
      state.submissionStatus = {
        isSubmitting: false,
        submitError: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bids
      .addCase(fetchBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch my bids
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.myBids = action.payload;
      })
      
      // Fetch tender bids
      .addCase(fetchBidsByTender.fulfilled, (state, action) => {
        state.tenderBids = action.payload;
      })
      
      // Fetch bid by ID
      .addCase(fetchBidById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBid = action.payload;
      })
      .addCase(fetchBidById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create bid
      .addCase(createBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids.unshift(action.payload);
        state.myBids.unshift(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.submissionStatus.isSubmitting = true;
        state.submissionStatus.submitError = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.submissionStatus.isSubmitting = false;
        // Update bid status in all relevant arrays
        const updateBidStatus = (bids: Bid[]) => {
          const index = bids.findIndex(b => b.id === action.payload.id);
          if (index !== -1) {
            bids[index] = action.payload;
          }
        };
        updateBidStatus(state.bids);
        updateBidStatus(state.myBids);
        updateBidStatus(state.tenderBids);
        if (state.currentBid?.id === action.payload.id) {
          state.currentBid = action.payload;
        }
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.submissionStatus.isSubmitting = false;
        state.submissionStatus.submitError = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentBid,
  clearCurrentBid,
  setPagination,
  clearSubmissionStatus,
} = bidSlice.actions;

export default bidSlice.reducer;
