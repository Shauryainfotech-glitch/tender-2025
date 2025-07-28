import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Organization {
  id: string;
  name: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'PUBLIC_SECTOR' | 'NGO' | 'INTERNATIONAL';
  registrationNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactEmail: string;
  contactPhone: string;
  website?: string;
  isVerified: boolean;
  verificationDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  description?: string;
  establishedYear?: number;
  employees?: number;
  industry?: string;
  documents: OrganizationDocument[];
  users: OrganizationUser[];
  statistics: {
    totalTenders: number;
    activeTenders: number;
    totalBids: number;
    successfulBids: number;
    averageRating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationDocument {
  id: string;
  type: 'REGISTRATION' | 'TAX_CERTIFICATE' | 'FINANCIAL_STATEMENT' | 'OTHER';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  isVerified: boolean;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
}

interface OrganizationUser {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: Date;
}

interface OrganizationFilters {
  type?: string;
  status?: string;
  isVerified?: boolean;
  search?: string;
  industry?: string;
  country?: string;
  sortBy?: 'name' | 'createdAt' | 'verificationDate' | 'totalTenders';
  sortOrder?: 'asc' | 'desc';
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  myOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  filters: OrganizationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  verificationStatus: {
    isVerifying: boolean;
    verificationError: string | null;
  };
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  myOrganization: null,
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'name',
    sortOrder: 'asc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  verificationStatus: {
    isVerifying: false,
    verificationError: null,
  },
};

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchOrganizations',
  async (params: { page?: number; limit?: number; filters?: OrganizationFilters }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations?page=${params.page || 1}&limit=${params.limit || 10}`);
      if (!response.ok) throw new Error('Failed to fetch organizations');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchOrganizationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyOrganization = createAsyncThunk(
  'organizations/fetchMyOrganization',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/organizations/my-organization');
      if (!response.ok) throw new Error('Failed to fetch my organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/createOrganization',
  async (organizationData: Partial<Organization>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationData),
      });
      if (!response.ok) throw new Error('Failed to create organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/updateOrganization',
  async ({ id, data }: { id: string; data: Partial<Organization> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOrganization = createAsyncThunk(
  'organizations/verifyOrganization',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${id}/verify`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to verify organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const suspendOrganization = createAsyncThunk(
  'organizations/suspendOrganization',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to suspend organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addOrganizationUser = createAsyncThunk(
  'organizations/addUser',
  async ({ organizationId, userData }: { organizationId: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to add user to organization');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.verificationStatus.verificationError = null;
    },
    setFilters: (state, action: PayloadAction<OrganizationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'name',
        sortOrder: 'asc',
      };
    },
    setCurrentOrganization: (state, action: PayloadAction<Organization | null>) => {
      state.currentOrganization = action.payload;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    setPagination: (state, action: PayloadAction<Partial<OrganizationState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateOrganizationStatistics: (state, action: PayloadAction<{ id: string; statistics: any }>) => {
      const { id, statistics } = action.payload;
      const organization = state.organizations.find(org => org.id === id);
      if (organization) {
        organization.statistics = { ...organization.statistics, ...statistics };
      }
      if (state.currentOrganization?.id === id) {
        state.currentOrganization.statistics = { ...state.currentOrganization.statistics, ...statistics };
      }
      if (state.myOrganization?.id === id) {
        state.myOrganization.statistics = { ...state.myOrganization.statistics, ...statistics };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch my organization
      .addCase(fetchMyOrganization.fulfilled, (state, action) => {
        state.myOrganization = action.payload;
      })
      
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations.unshift(action.payload);
        state.myOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update organization
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(org => org.id === action.payload.id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
        if (state.myOrganization?.id === action.payload.id) {
          state.myOrganization = action.payload;
        }
      })
      
      // Verify organization
      .addCase(verifyOrganization.pending, (state) => {
        state.verificationStatus.isVerifying = true;
        state.verificationStatus.verificationError = null;
      })
      .addCase(verifyOrganization.fulfilled, (state, action) => {
        state.verificationStatus.isVerifying = false;
        // Update organization in all relevant arrays
        const updateOrganization = (organizations: Organization[], updatedOrg: Organization) => {
          const index = organizations.findIndex(org => org.id === updatedOrg.id);
          if (index !== -1) {
            organizations[index] = updatedOrg;
          }
        };
        updateOrganization(state.organizations, action.payload);
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
        if (state.myOrganization?.id === action.payload.id) {
          state.myOrganization = action.payload;
        }
      })
      .addCase(verifyOrganization.rejected, (state, action) => {
        state.verificationStatus.isVerifying = false;
        state.verificationStatus.verificationError = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentOrganization,
  clearCurrentOrganization,
  setPagination,
  updateOrganizationStatistics,
} = organizationSlice.actions;

export default organizationSlice.reducer;
