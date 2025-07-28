import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Modal {
  id: string;
  type: string;
  isOpen: boolean;
  data?: any;
  props?: any;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  isVisible: boolean;
}

interface Sidebar {
  isOpen: boolean;
  isCollapsed: boolean;
  activeItem?: string;
}

interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

interface UIState {
  modals: Modal[];
  toasts: Toast[];
  sidebar: Sidebar;
  theme: Theme;
  isLoading: boolean;
  loadingMessage: string;
  breadcrumbs: Array<{
    label: string;
    path?: string;
    isActive?: boolean;
  }>;
  pageTitle: string;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'danger' | 'warning' | 'info';
  };
  filters: {
    isOpen: boolean;
    activeFilters: Record<string, any>;
  };
  search: {
    isOpen: boolean;
    query: string;
    results: any[];
    isSearching: boolean;
  };
}

const initialState: UIState = {
  modals: [],
  toasts: [],
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },
  theme: {
    mode: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    primaryColor: localStorage.getItem('primaryColor') || '#1976d2',
    fontFamily: localStorage.getItem('fontFamily') || 'Roboto',
    fontSize: (localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium',
  },
  isLoading: false,
  loadingMessage: '',
  breadcrumbs: [],
  pageTitle: 'AVGC Tender Management',
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
  },
  filters: {
    isOpen: false,
    activeFilters: {},
  },
  search: {
    isOpen: false,
    query: '',
    results: [],
    isSearching: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal management
    openModal: (state, action: PayloadAction<{ id: string; type: string; data?: any; props?: any }>) => {
      const existingModal = state.modals.find(modal => modal.id === action.payload.id);
      if (existingModal) {
        existingModal.isOpen = true;
        existingModal.data = action.payload.data;
        existingModal.props = action.payload.props;
      } else {
        state.modals.push({
          ...action.payload,
          isOpen: true,
        });
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(modal => modal.id === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    closeAllModals: (state) => {
      state.modals.forEach(modal => {
        modal.isOpen = false;
      });
    },
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },

    // Toast management
    addToast: (state, action: PayloadAction<Omit<Toast, 'id' | 'isVisible'>>) => {
      const id = Date.now().toString();
      state.toasts.push({
        ...action.payload,
        id,
        isVisible: true,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    hideToast: (state, action: PayloadAction<string>) => {
      const toast = state.toasts.find(toast => toast.id === action.payload);
      if (toast) {
        toast.isVisible = false;
      }
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload;
    },
    setActiveSidebarItem: (state, action: PayloadAction<string | undefined>) => {
      state.sidebar.activeItem = action.payload;
    },

    // Theme management
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme.mode = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
      localStorage.setItem('primaryColor', action.payload);
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.theme.fontFamily = action.payload;
      localStorage.setItem('fontFamily', action.payload);
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.theme.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },
    resetTheme: (state) => {
      state.theme = {
        mode: 'light',
        primaryColor: '#1976d2',
        fontFamily: 'Roboto',
        fontSize: 'medium',
      };
      localStorage.removeItem('theme');
      localStorage.removeItem('primaryColor');
      localStorage.removeItem('fontFamily');
      localStorage.removeItem('fontSize');
    },

    // Loading management
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || '';
    },

    // Navigation management
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action: PayloadAction<{ label: string; path?: string }>) => {
      state.breadcrumbs.push({ ...action.payload, isActive: false });
      // Mark the last item as active
      if (state.breadcrumbs.length > 0) {
        state.breadcrumbs[state.breadcrumbs.length - 1].isActive = true;
      }
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
      document.title = `${action.payload} | AVGC Tender Management`;
    },

    // Confirm dialog management
    openConfirmDialog: (state, action: PayloadAction<Omit<UIState['confirmDialog'], 'isOpen'>>) => {
      state.confirmDialog = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog.isOpen = false;
    },

    // Filter management
    toggleFilters: (state) => {
      state.filters.isOpen = !state.filters.isOpen;
    },
    setFiltersOpen: (state, action: PayloadAction<boolean>) => {
      state.filters.isOpen = action.payload;
    },
    setActiveFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters.activeFilters = action.payload;
    },
    clearActiveFilters: (state) => {
      state.filters.activeFilters = {};
    },

    // Search management
    toggleSearch: (state) => {
      state.search.isOpen = !state.search.isOpen;
      if (!state.search.isOpen) {
        state.search.query = '';
        state.search.results = [];
      }
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.search.isOpen = action.payload;
      if (!action.payload) {
        state.search.query = '';
        state.search.results = [];
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.search.results = action.payload;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.search.isSearching = action.payload;
    },
    clearSearch: (state) => {
      state.search.query = '';
      state.search.results = [];
      state.search.isSearching = false;
    },

    // Reset all UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme settings
      };
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  removeModal,
  
  // Toast actions
  addToast,
  removeToast,
  hideToast,
  clearAllToasts,
  
  // Sidebar actions
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  setActiveSidebarItem,
  
  // Theme actions
  setThemeMode,
  setPrimaryColor,
  setFontFamily,
  setFontSize,
  resetTheme,
  
  // Loading actions
  setLoading,
  
  // Navigation actions
  setBreadcrumbs,
  addBreadcrumb,
  setPageTitle,
  
  // Confirm dialog actions
  openConfirmDialog,
  closeConfirmDialog,
  
  // Filter actions
  toggleFilters,
  setFiltersOpen,
  setActiveFilters,
  clearActiveFilters,
  
  // Search actions
  toggleSearch,
  setSearchOpen,
  setSearchQuery,
  setSearchResults,
  setSearching,
  clearSearch,
  
  // Reset action
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
