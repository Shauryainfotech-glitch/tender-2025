import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  Menu,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  LinearProgress,
  Collapse,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  SavedSearch as SavedSearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  MoreVert as MoreIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  ImportExport as SortIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { format, subDays, subMonths } from 'date-fns';
import { searchService } from '../../services/searchService';

interface SearchFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  label?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range';
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  usageCount: number;
  lastUsed?: Date;
  tags: string[];
  sharedWith?: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter[];
  timestamp: Date;
  resultCount: number;
}

interface SearchResult {
  id: string;
  type: 'tender' | 'document' | 'vendor' | 'bid';
  title: string;
  description: string;
  score: number;
  highlights: Record<string, string[]>;
  metadata: Record<string, any>;
}

interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range';
  operators: { value: string; label: string }[];
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
}

const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<SavedSearch | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [saveSearchForm, setSaveSearchForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    shareWith: [] as string[],
  });

  const filterOptions: FilterOption[] = [
    {
      field: 'type',
      label: 'Type',
      type: 'select',
      operators: [{ value: 'equals', label: 'Is' }, { value: 'not_equals', label: 'Is not' }],
      options: [
        { value: 'tender', label: 'Tender' },
        { value: 'document', label: 'Document' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'bid', label: 'Bid' },
      ],
    },
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      operators: [{ value: 'equals', label: 'Is' }, { value: 'in', label: 'Is one of' }],
      options: [
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' },
        { value: 'draft', label: 'Draft' },
        { value: 'awarded', label: 'Awarded' },
      ],
    },
    {
      field: 'category',
      label: 'Category',
      type: 'select',
      operators: [{ value: 'equals', label: 'Is' }, { value: 'in', label: 'Is one of' }],
      options: [
        { value: 'construction', label: 'Construction' },
        { value: 'it_services', label: 'IT Services' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'supplies', label: 'Supplies' },
      ],
    },
    {
      field: 'value',
      label: 'Estimated Value',
      type: 'range',
      operators: [
        { value: 'between', label: 'Between' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
      ],
      min: 0,
      max: 10000000,
    },
    {
      field: 'date',
      label: 'Date',
      type: 'date',
      operators: [
        { value: 'equals', label: 'On' },
        { value: 'between', label: 'Between' },
        { value: 'after', label: 'After' },
        { value: 'before', label: 'Before' },
      ],
    },
    {
      field: 'location',
      label: 'Location',
      type: 'text',
      operators: [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Exact match' },
        { value: 'starts_with', label: 'Starts with' },
      ],
    },
    {
      field: 'vendor',
      label: 'Vendor',
      type: 'text',
      operators: [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Exact match' },
      ],
    },
    {
      field: 'hasAttachments',
      label: 'Has Attachments',
      type: 'boolean',
      operators: [{ value: 'equals', label: 'Is' }],
    },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'value', label: 'Value' },
    { value: 'title', label: 'Title' },
    { value: 'popularity', label: 'Popularity' },
  ];

  const datePresets = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Last 7 days', getValue: () => subDays(new Date(), 7) },
    { label: 'Last 30 days', getValue: () => subDays(new Date(), 30) },
    { label: 'Last 3 months', getValue: () => subMonths(new Date(), 3) },
    { label: 'Last 6 months', getValue: () => subMonths(new Date(), 6) },
    { label: 'Last year', getValue: () => subMonths(new Date(), 12) },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSearchSuggestions();
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      const [savedSearchesRes, historyRes] = await Promise.all([
        searchService.getSavedSearches(),
        searchService.getSearchHistory(),
      ]);
      setSavedSearches(savedSearchesRes.data);
      setSearchHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchSearchSuggestions = async () => {
    try {
      const response = await searchService.getSearchSuggestions(searchQuery);
      setSearchSuggestions(response.data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && filters.length === 0) {
      setError('Please enter a search query or add filters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const searchParams = {
        query: searchQuery,
        filters,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: resultsPerPage,
      };

      const response = await searchService.performSearch(searchParams);
      setSearchResults(response.data.results);
      setTotalResults(response.data.total);

      // Save to history
      await searchService.saveSearchHistory({
        query: searchQuery,
        filters,
        resultCount: response.data.total,
      });

      // Reload history
      const historyRes = await searchService.getSearchHistory();
      setSearchHistory(historyRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = (filter: SearchFilter) => {
    setFilters([...filters, { ...filter, id: Date.now().toString() }]);
  };

  const handleUpdateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleClearFilters = () => {
    setFilters([]);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchForm.name.trim()) {
      setError('Please enter a name for the saved search');
      return;
    }

    try {
      const data = {
        ...saveSearchForm,
        query: searchQuery,
        filters,
        sortBy,
        sortOrder,
      };

      if (selectedSavedSearch) {
        await searchService.updateSavedSearch(selectedSavedSearch.id, data);
      } else {
        await searchService.createSavedSearch(data);
      }

      // Reload saved searches
      const savedSearchesRes = await searchService.getSavedSearches();
      setSavedSearches(savedSearchesRes.data);

      setShowSaveDialog(false);
      resetSaveSearchForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save search');
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    if (savedSearch.sortBy) setSortBy(savedSearch.sortBy);
    if (savedSearch.sortOrder) setSortOrder(savedSearch.sortOrder);
    handleSearch();
  };

  const handleDeleteSavedSearch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      await searchService.deleteSavedSearch(id);
      const savedSearchesRes = await searchService.getSavedSearches();
      setSavedSearches(savedSearchesRes.data);
    } catch (err) {
      console.error('Failed to delete saved search:', err);
    }
  };

  const handleToggleStar = async (savedSearch: SavedSearch) => {
    try {
      await searchService.updateSavedSearch(savedSearch.id, {
        isStarred: !savedSearch.isStarred,
      });
      const savedSearchesRes = await searchService.getSavedSearches();
      setSavedSearches(savedSearchesRes.data);
    } catch (err) {
      console.error('Failed to update saved search:', err);
    }
  };

  const handleExportResults = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await searchService.exportSearchResults({
        query: searchQuery,
        filters,
        format,
      });
      // Handle file download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-results.${format}`;
      a.click();
    } catch (err) {
      console.error('Failed to export results:', err);
    }
  };

  const resetSaveSearchForm = () => {
    setSaveSearchForm({
      name: '',
      description: '',
      tags: [],
      shareWith: [],
    });
    setSelectedSavedSearch(null);
  };

  const getFilterLabel = (filter: SearchFilter) => {
    const option = filterOptions.find(o => o.field === filter.field);
    const operator = option?.operators.find(o => o.value === filter.operator);
    
    if (filter.type === 'range' && filter.operator === 'between') {
      return `${option?.label} ${operator?.label} ${filter.value[0]} and ${filter.value[1]}`;
    }
    
    if (filter.type === 'select' && option?.options) {
      const valueOption = option.options.find(o => o.value === filter.value);
      return `${option.label} ${operator?.label} ${valueOption?.label || filter.value}`;
    }
    
    return `${option?.label} ${operator?.label} ${filter.value}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <BusinessIcon />;
      case 'document':
        return <CategoryIcon />;
      case 'vendor':
        return <PersonIcon />;
      case 'bid':
        return <MoneyIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Search Header */}
      <Paper sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              freeSolo
              options={searchSuggestions}
              value={searchQuery}
              onChange={(_, value) => setSearchQuery(value || '')}
              onInputChange={(_, value) => setSearchQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="Search tenders, documents, vendors..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilterBuilder(true)}
                sx={{ minWidth: 120 }}
              >
                Filters ({filters.length})
              </Button>
              <IconButton onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {filters.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.map((filter) => (
              <Chip
                key={filter.id}
                label={getFilterLabel(filter)}
                onDelete={() => handleRemoveFilter(filter.id)}
                size="small"
              />
            ))}
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </Box>
        )}

        {/* Advanced Options */}
        <Collapse in={showAdvancedOptions}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={sortOrder}
                  exclusive
                  onChange={(_, value) => value && setSortOrder(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="asc">Ascending</ToggleButton>
                  <ToggleButton value="desc">Descending</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Results Per Page</InputLabel>
                  <Select
                    value={resultsPerPage}
                    label="Results Per Page"
                    onChange={(e) => setResultsPerPage(Number(e.target.value))}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={() => setShowSaveDialog(true)}
                  >
                    Save Search
                  </Button>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value)}
                    size="small"
                  >
                    <ToggleButton value="list">
                      <ListViewIcon />
                    </ToggleButton>
                    <ToggleButton value="grid">
                      <GridViewIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Paper sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
          >
            <Tab label="Saved" icon={<SavedSearchIcon />} />
            <Tab label="History" icon={<HistoryIcon />} />
            <Tab label="Trending" icon={<TrendingIcon />} />
          </Tabs>

          {/* Saved Searches */}
          {activeTab === 0 && (
            <List>
              {savedSearches
                .sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0))
                .map((savedSearch) => (
                  <ListItem
                    key={savedSearch.id}
                    button
                    onClick={() => handleLoadSavedSearch(savedSearch)}
                  >
                    <ListItemIcon>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(savedSearch);
                        }}
                      >
                        {savedSearch.isStarred ? <StarIcon color="primary" /> : <StarBorderIcon />}
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText
                      primary={savedSearch.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            {savedSearch.query || 'No query'} + {savedSearch.filters.length} filters
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary">
                            Used {savedSearch.usageCount} times
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedSavedSearch(savedSearch);
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          )}

          {/* Search History */}
          {activeTab === 1 && (
            <List>
              {searchHistory.map((history) => (
                <ListItem
                  key={history.id}
                  button
                  onClick={() => {
                    setSearchQuery(history.query);
                    setFilters(history.filters);
                    handleSearch();
                  }}
                >
                  <ListItemText
                    primary={history.query || 'Filter-only search'}
                    secondary={
                      <Box>
                        <Typography variant="caption" component="div">
                          {history.resultCount} results
                        </Typography>
                        <Typography variant="caption" component="div" color="text.secondary">
                          {format(new Date(history.timestamp), 'MMM d, h:mm a')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Trending Searches */}
          {activeTab === 2 && (
            <List>
              <ListItem>
                <ListItemText
                  secondary="Trending searches will appear here based on system-wide usage"
                />
              </ListItem>
            </List>
          )}
        </Paper>

        {/* Results Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && searchResults.length === 0 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search query or filters
              </Typography>
            </Box>
          )}

          {!loading && searchResults.length > 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {totalResults} results found
                </Typography>
                <Box>
                  <IconButton onClick={() => handleExportResults('csv')}>
                    <Tooltip title="Export as CSV">
                      <DownloadIcon />
                    </Tooltip>
                  </IconButton>
                  <IconButton>
                    <Tooltip title="Analytics">
                      <AnalyticsIcon />
                    </Tooltip>
                  </IconButton>
                </Box>
              </Box>

              {viewMode === 'list' ? (
                <Stack spacing={2}>
                  {searchResults.map((result) => (
                    <Card key={result.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ mr: 2 }}>
                            {getTypeIcon(result.type)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {result.title}
                              <Chip
                                label={result.type}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                              dangerouslySetInnerHTML={{
                                __html: result.highlights.description?.[0] || result.description,
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {result.metadata.category && (
                                <Chip
                                  icon={<CategoryIcon />}
                                  label={result.metadata.category}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {result.metadata.location && (
                                <Chip
                                  icon={<LocationIcon />}
                                  label={result.metadata.location}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {result.metadata.value && (
                                <Chip
                                  icon={<MoneyIcon />}
                                  label={`$${result.metadata.value.toLocaleString()}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {result.metadata.date && (
                                <Chip
                                  icon={<CalendarIcon />}
                                  label={format(new Date(result.metadata.date), 'MMM d, yyyy')}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Score: {(result.score * 100).toFixed(0)}%
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setSelectedResult(result);
                                setAnchorEl(e.currentTarget);
                              }}
                            >
                              <MoreIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Grid container spacing={2}>
                  {searchResults.map((result) => (
                    <Grid item xs={12} sm={6} md={4} key={result.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getTypeIcon(result.type)}
                            <Typography variant="h6" sx={{ ml: 1, flex: 1 }} noWrap>
                              {result.title}
                            </Typography>
                          </Box>
                          <Chip
                            label={result.type}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 2,
                            }}
                          >
                            {result.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {result.metadata.tags?.map((tag: string) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small">View Details</Button>
                          <Box sx={{ ml: 'auto' }}>
                            <Typography variant="caption" color="text.secondary">
                              Score: {(result.score * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Filter Builder Dialog */}
      <Dialog
        open={showFilterBuilder}
        onClose={() => setShowFilterBuilder(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Build Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {filterOptions.map((option) => (
              <Accordion key={option.field}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{option.label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FilterBuilder
                    option={option}
                    onAddFilter={handleAddFilter}
                    datePresets={datePresets}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterBuilder(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowFilterBuilder(false);
              handleSearch();
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Search Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSavedSearch ? 'Edit Saved Search' : 'Save Search'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={saveSearchForm.name}
                onChange={(e) => setSaveSearchForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={saveSearchForm.description}
                onChange={(e) => setSaveSearchForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={saveSearchForm.tags}
                onChange={(_, value) => setSaveSearchForm(prev => ({ ...prev, tags: value }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSearch}>
            {selectedSavedSearch ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedSavedSearch && (
          <>
            <MenuItem
              onClick={() => {
                setSaveSearchForm({
                  name: selectedSavedSearch.name,
                  description: selectedSavedSearch.description || '',
                  tags: selectedSavedSearch.tags,
                  shareWith: selectedSavedSearch.sharedWith || [],
                });
                setShowSaveDialog(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({
                query: selectedSavedSearch.query,
                filters: selectedSavedSearch.filters,
              }));
              setAnchorEl(null);
            }}>
              <ListItemIcon>
                <CopyIcon />
              </ListItemIcon>
              <ListItemText primary="Copy" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <ShareIcon />
              </ListItemIcon>
              <ListItemText primary="Share" />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleDeleteSavedSearch(selectedSavedSearch.id);
                setAnchorEl(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

// Filter Builder Component
interface FilterBuilderProps {
  option: FilterOption;
  onAddFilter: (filter: SearchFilter) => void;
  datePresets: Array<{ label: string; getValue: () => Date }>;
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({ option, onAddFilter, datePresets }) => {
  const [operator, setOperator] = useState(option.operators[0].value);
  const [value, setValue] = useState<any>('');
  const [rangeValue, setRangeValue] = useState<[number, number]>([
    option.min || 0,
    option.max || 100,
  ]);

  const handleAdd = () => {
    let filterValue = value;

    if (option.type === 'range' && operator === 'between') {
      filterValue = rangeValue;
    } else if (option.type === 'boolean') {
      filterValue = value === 'true';
    } else if (option.type === 'number') {
      filterValue = Number(value);
    }

    onAddFilter({
      id: '',
      field: option.field,
      operator,
      value: filterValue,
      type: option.type,
      label: option.label,
    });

    // Reset values
    setValue('');
    setRangeValue([option.min || 0, option.max || 100]);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Operator</InputLabel>
            <Select
              value={operator}
              label="Operator"
              onChange={(e) => setOperator(e.target.value)}
            >
              {option.operators.map(op => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          {option.type === 'text' && (
            <TextField
              fullWidth
              size="small"
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}

          {option.type === 'number' && operator !== 'between' && (
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}

          {option.type === 'select' && (
            <FormControl fullWidth size="small">
              <InputLabel>Value</InputLabel>
              <Select
                value={value}
                label="Value"
                onChange={(e) => setValue(e.target.value)}
                multiple={operator === 'in'}
              >
                {option.options?.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {option.type === 'boolean' && (
            <FormControl fullWidth size="small">
              <InputLabel>Value</InputLabel>
              <Select
                value={value}
                label="Value"
                onChange={(e) => setValue(e.target.value)}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          )}

          {option.type === 'date' && operator !== 'between' && (
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}

          {(option.type === 'range' || (option.type === 'number' && operator === 'between')) && (
            <Box sx={{ px: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {rangeValue[0]} - {rangeValue[1]}
              </Typography>
              <Slider
                value={rangeValue}
                onChange={(_, value) => setRangeValue(value as [number, number])}
                valueLabelDisplay="auto"
                min={option.min}
                max={option.max}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleAdd}
            disabled={!value && option.type !== 'range'}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      {option.type === 'date' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Quick select:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {datePresets.map(preset => (
              <Chip
                key={preset.label}
                label={preset.label}
                size="small"
                onClick={() => setValue(preset.getValue().toISOString().split('T')[0])}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdvancedSearch;
