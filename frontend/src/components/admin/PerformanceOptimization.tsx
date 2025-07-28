import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Snackbar,
  FormGroup,
  Checkbox,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudQueue as CloudQueueIcon,
  Image as ImageIcon,
  DataUsage as DataUsageIcon,
  Memory as MemoryIcon,
  QueryStats as QueryStatsIcon,
  Cached as CachedIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timer as TimerIcon,
  Compress as CompressIcon,
  Analytics as AnalyticsIcon,
  NetworkCheck as NetworkCheckIcon,
  AutoFixHigh as AutoFixHighIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { performanceService } from '../../services/performanceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface CacheStats {
  totalKeys: number;
  usedMemory: string;
  hitRate: number;
  missRate: number;
  evictedKeys: number;
  connectedClients: number;
}

interface QueryOptimization {
  id: string;
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsSent: number;
  optimization: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'optimized' | 'failed';
}

interface CDNStats {
  provider: string;
  status: 'active' | 'inactive';
  bandwidth: {
    used: number;
    limit: number;
    unit: string;
  };
  requests: {
    total: number;
    cached: number;
    uncached: number;
  };
  cacheHitRate: number;
  dataTransferred: string;
  cost: number;
}

interface ImageOptimizationSettings {
  autoOptimize: boolean;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  formats: string[];
  lazyLoad: boolean;
  webpConversion: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target?: number;
}

const PerformanceOptimization: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [queryOptimizations, setQueryOptimizations] = useState<QueryOptimization[]>([]);
  const [cdnStats, setCDNStats] = useState<CDNStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [imageSettings, setImageSettings] = useState<ImageOptimizationSettings>({
    autoOptimize: true,
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    formats: ['webp', 'jpeg', 'png'],
    lazyLoad: true,
    webpConversion: true,
    compressionLevel: 'medium',
  });
  const [lazyLoadingConfig, setLazyLoadingConfig] = useState({
    enabled: true,
    threshold: 100,
    batchSize: 20,
    debounceDelay: 300,
    virtualScrolling: true,
    infiniteScroll: true,
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [cacheConfig, setCacheConfig] = useState({
    ttl: 3600,
    maxKeys: 10000,
    evictionPolicy: 'lru',
    compression: true,
    warming: false,
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [cacheRes, queryRes, cdnRes, metricsRes, historyRes] = await Promise.all([
        performanceService.getCacheStats(),
        performanceService.getQueryOptimizations(),
        performanceService.getCDNStats(),
        performanceService.getPerformanceMetrics(),
        performanceService.getPerformanceHistory(),
      ]);
      setCacheStats(cacheRes.data);
      setQueryOptimizations(queryRes.data);
      setCDNStats(cdnRes.data);
      setPerformanceMetrics(metricsRes.data);
      setPerformanceHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading performance data:', error);
      showSnackbar('Error loading performance data', 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClearCache = async (pattern?: string) => {
    if (window.confirm(`Are you sure you want to clear ${pattern ? `cache matching "${pattern}"` : 'all cache'}?`)) {
      setLoading(true);
      try {
        await performanceService.clearCache(pattern);
        await loadData();
        showSnackbar('Cache cleared successfully', 'success');
      } catch (error) {
        console.error('Error clearing cache:', error);
        showSnackbar('Error clearing cache', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleWarmCache = async () => {
    setLoading(true);
    try {
      await performanceService.warmCache();
      showSnackbar('Cache warming started', 'success');
    } catch (error) {
      console.error('Error warming cache:', error);
      showSnackbar('Error warming cache', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeQuery = async (query: QueryOptimization) => {
    setLoading(true);
    try {
      await performanceService.optimizeQuery(query.id);
      await loadData();
      showSnackbar('Query optimized successfully', 'success');
    } catch (error) {
      console.error('Error optimizing query:', error);
      showSnackbar('Error optimizing query', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeQueries = async () => {
    setLoading(true);
    try {
      await performanceService.analyzeQueries();
      await loadData();
      showSnackbar('Query analysis completed', 'success');
    } catch (error) {
      console.error('Error analyzing queries:', error);
      showSnackbar('Error analyzing queries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImageSettings = async () => {
    setLoading(true);
    try {
      await performanceService.updateImageSettings(imageSettings);
      showSnackbar('Image optimization settings updated', 'success');
    } catch (error) {
      console.error('Error updating image settings:', error);
      showSnackbar('Error updating image settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeImages = async () => {
    setLoading(true);
    try {
      const result = await performanceService.optimizeExistingImages();
      showSnackbar(`Optimized ${result.data.optimizedCount} images`, 'success');
    } catch (error) {
      console.error('Error optimizing images:', error);
      showSnackbar('Error optimizing images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLazyLoadingConfig = async () => {
    setLoading(true);
    try {
      await performanceService.updateLazyLoadingConfig(lazyLoadingConfig);
      showSnackbar('Lazy loading configuration updated', 'success');
    } catch (error) {
      console.error('Error updating lazy loading config:', error);
      showSnackbar('Error updating lazy loading config', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeCDN = async (path?: string) => {
    if (window.confirm(`Are you sure you want to purge ${path ? `CDN path "${path}"` : 'entire CDN cache'}?`)) {
      setLoading(true);
      try {
        await performanceService.purgeCDN(path);
        showSnackbar('CDN cache purged successfully', 'success');
      } catch (error) {
        console.error('Error purging CDN:', error);
        showSnackbar('Error purging CDN', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunPerformanceTest = async () => {
    setLoading(true);
    try {
      const result = await performanceService.runPerformanceTest();
      setSelectedItem(result.data);
      setOpenDialog('performance-test-result');
    } catch (error) {
      console.error('Error running performance test:', error);
      showSnackbar('Error running performance test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (metric: PerformanceMetric) => {
    if (metric.trend === 'up') return <TrendingUpIcon color={metric.status === 'good' ? 'success' : 'error'} />;
    if (metric.trend === 'down') return <TrendingDownIcon color={metric.status === 'good' ? 'success' : 'error'} />;
    return <TrendingUpIcon color="action" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Performance Optimization</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunPerformanceTest}
          >
            Run Performance Test
          </Button>
        </Box>
      </Box>

      {/* Performance Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {performanceMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {metric.name}
                    </Typography>
                    <Typography variant="h5">
                      {metric.value} {metric.unit}
                    </Typography>
                    {metric.target && (
                      <Typography variant="caption" color="textSecondary">
                        Target: {metric.target} {metric.unit}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {getStatusIcon(metric.status)}
                    {getMetricIcon(metric)}
                  </Box>
                </Box>
                {metric.target && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metric.value / metric.target) * 100, 100)}
                    sx={{ mt: 1 }}
                    color={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Redis Cache" icon={<CachedIcon />} />
          <Tab label="Database Optimization" icon={<QueryStatsIcon />} />
          <Tab label="Lazy Loading" icon={<DataUsageIcon />} />
          <Tab label="Image Optimization" icon={<ImageIcon />} />
          <Tab label="CDN Integration" icon={<CloudQueueIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {/* Redis Cache Management */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cache Statistics
                </Typography>
                {cacheStats ? (
                  <Box>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <StorageIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Keys"
                          secondary={cacheStats.totalKeys.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <MemoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Memory Used"
                          secondary={cacheStats.usedMemory}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Hit Rate"
                          secondary={`${cacheStats.hitRate.toFixed(2)}%`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            size="small"
                            label={cacheStats.hitRate > 80 ? 'Good' : 'Needs Improvement'}
                            color={cacheStats.hitRate > 80 ? 'success' : 'warning'}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Miss Rate"
                          secondary={`${cacheStats.missRate.toFixed(2)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Evicted Keys"
                          secondary={cacheStats.evictedKeys.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <NetworkCheckIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Connected Clients"
                          secondary={cacheStats.connectedClients}
                        />
                      </ListItem>
                    </List>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cache Configuration
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="TTL (seconds)"
                    type="number"
                    value={cacheConfig.ttl}
                    onChange={(e) => setCacheConfig({ ...cacheConfig, ttl: parseInt(e.target.value) })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Max Keys"
                    type="number"
                    value={cacheConfig.maxKeys}
                    onChange={(e) => setCacheConfig({ ...cacheConfig, maxKeys: parseInt(e.target.value) })}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Eviction Policy</InputLabel>
                    <Select
                      value={cacheConfig.evictionPolicy}
                      onChange={(e) => setCacheConfig({ ...cacheConfig, evictionPolicy: e.target.value })}
                    >
                      <MenuItem value="lru">LRU (Least Recently Used)</MenuItem>
                      <MenuItem value="lfu">LFU (Least Frequently Used)</MenuItem>
                      <MenuItem value="random">Random</MenuItem>
                      <MenuItem value="ttl">TTL-based</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cacheConfig.compression}
                        onChange={(e) => setCacheConfig({ ...cacheConfig, compression: e.target.checked })}
                      />
                    }
                    label="Enable Compression"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cacheConfig.warming}
                        onChange={(e) => setCacheConfig({ ...cacheConfig, warming: e.target.checked })}
                      />
                    }
                    label="Enable Cache Warming"
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => performanceService.updateCacheConfig(cacheConfig)}
                    >
                      Save Configuration
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={() => handleClearCache()}
                    >
                      Clear All Cache
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CachedIcon />}
                      onClick={handleWarmCache}
                    >
                      Warm Cache
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cache Hit Rate Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cacheHitRate" stroke="#4caf50" name="Hit Rate (%)" />
                    <Line type="monotone" dataKey="cacheMissRate" stroke="#f44336" name="Miss Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Database Query Optimization */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Query Optimization</Typography>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={handleAnalyzeQueries}
          >
            Analyze All Queries
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Query</TableCell>
                <TableCell>Execution Time</TableCell>
                <TableCell>Rows Examined</TableCell>
                <TableCell>Rows Sent</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Optimization</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queryOptimizations.map((query) => (
                <TableRow key={query.id}>
                  <TableCell>
                    <Tooltip title={query.query}>
                      <Typography noWrap sx={{ maxWidth: 300 }}>
                        {query.query}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{query.executionTime}ms</TableCell>
                  <TableCell>{query.rowsExamined.toLocaleString()}</TableCell>
                  <TableCell>{query.rowsSent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={query.priority}
                      color={
                        query.priority === 'high'
                          ? 'error'
                          : query.priority === 'medium'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={query.status}
                      color={
                        query.status === 'optimized'
                          ? 'success'
                          : query.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{query.optimization}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<AutoFixHighIcon />}
                      onClick={() => handleOptimizeQuery(query)}
                      disabled={query.status === 'optimized'}
                    >
                      Optimize
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Query Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="avgQueryTime" stackId="1" stroke="#8884d8" fill="#8884d8" name="Avg Query Time (ms)" />
                  <Area type="monotone" dataKey="slowQueries" stackId="1" stroke="#ffc658" fill="#ffc658" name="Slow Queries" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Lazy Loading Configuration */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lazy Loading Configuration
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lazyLoadingConfig.enabled}
                        onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, enabled: e.target.checked })}
                      />
                    }
                    label="Enable Lazy Loading"
                  />
                  <TextField
                    fullWidth
                    label="Threshold (pixels)"
                    type="number"
                    value={lazyLoadingConfig.threshold}
                    onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, threshold: parseInt(e.target.value) })}
                    margin="normal"
                    helperText="Distance from viewport to start loading"
                  />
                  <TextField
                    fullWidth
                    label="Batch Size"
                    type="number"
                    value={lazyLoadingConfig.batchSize}
                    onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, batchSize: parseInt(e.target.value) })}
                    margin="normal"
                    helperText="Number of items to load at once"
                  />
                  <TextField
                    fullWidth
                    label="Debounce Delay (ms)"
                    type="number"
                    value={lazyLoadingConfig.debounceDelay}
                    onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, debounceDelay: parseInt(e.target.value) })}
                    margin="normal"
                    helperText="Delay before loading after scroll stops"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lazyLoadingConfig.virtualScrolling}
                        onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, virtualScrolling: e.target.checked })}
                      />
                    }
                    label="Enable Virtual Scrolling"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lazyLoadingConfig.infiniteScroll}
                        onChange={(e) => setLazyLoadingConfig({ ...lazyLoadingConfig, infiniteScroll: e.target.checked })}
                      />
                    }
                    label="Enable Infinite Scroll"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpdateLazyLoadingConfig}
                      fullWidth
                    >
                      Update Configuration
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lazy Loading Performance
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Current Implementation Status
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Images"
                        secondary="Lazy loading enabled for all images"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tables"
                        secondary="Virtual scrolling for large datasets"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Lists"
                        secondary="Infinite scroll with batch loading"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Components"
                        secondary="Code splitting and lazy imports"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Image Optimization */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Optimization Settings
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={imageSettings.autoOptimize}
                        onChange={(e) => setImageSettings({ ...imageSettings, autoOptimize: e.target.checked })}
                      />
                    }
                    label="Auto-optimize on upload"
                  />
                  <Typography gutterBottom>Quality: {imageSettings.quality}%</Typography>
                  <Slider
                    value={imageSettings.quality}
                    onChange={(e, value) => setImageSettings({ ...imageSettings, quality: value as number })}
                    min={0}
                    max={100}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' },
                    ]}
                  />
                  <TextField
                    fullWidth
                    label="Max Width (px)"
                    type="number"
                    value={imageSettings.maxWidth}
                    onChange={(e) => setImageSettings({ ...imageSettings, maxWidth: parseInt(e.target.value) })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Max Height (px)"
                    type="number"
                    value={imageSettings.maxHeight}
                    onChange={(e) => setImageSettings({ ...imageSettings, maxHeight: parseInt(e.target.value) })}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Compression Level</InputLabel>
                    <Select
                      value={imageSettings.compressionLevel}
                      onChange={(e) => setImageSettings({ ...imageSettings, compressionLevel: e.target.value as any })}
                    >
                      <MenuItem value="low">Low (Better Quality)</MenuItem>
                      <MenuItem value="medium">Medium (Balanced)</MenuItem>
                      <MenuItem value="high">High (Smaller Size)</MenuItem>
                    </Select>
                  </FormControl>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={imageSettings.formats.includes('webp')}
                          onChange={(e) => {
                            const formats = e.target.checked
                              ? [...imageSettings.formats, 'webp']
                              : imageSettings.formats.filter(f => f !== 'webp');
                            setImageSettings({ ...imageSettings, formats });
                          }}
                        />
                      }
                      label="WebP"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={imageSettings.formats.includes('jpeg')}
                          onChange={(e) => {
                            const formats = e.target.checked
                              ? [...imageSettings.formats, 'jpeg']
                              : imageSettings.formats.filter(f => f !== 'jpeg');
                            setImageSettings({ ...imageSettings, formats });
                          }}
                        />
                      }
                      label="JPEG"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={imageSettings.formats.includes('png')}
                          onChange={(e) => {
                            const formats = e.target.checked
                              ? [...imageSettings.formats, 'png']
                              : imageSettings.formats.filter(f => f !== 'png');
                            setImageSettings({ ...imageSettings, formats });
                          }}
                        />
                      }
                      label="PNG"
                    />
                  </FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={imageSettings.lazyLoad}
                        onChange={(e) => setImageSettings({ ...imageSettings, lazyLoad: e.target.checked })}
                      />
                    }
                    label="Enable lazy loading"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={imageSettings.webpConversion}
                        onChange={(e) => setImageSettings({ ...imageSettings, webpConversion: e.target.checked })}
                      />
                    }
                    label="Auto-convert to WebP"
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpdateImageSettings}
                      fullWidth
                    >
                      Save Settings
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CompressIcon />}
                      onClick={handleOptimizeImages}
                      fullWidth
                    >
                      Optimize Existing
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Optimization Stats
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Optimized', value: 75 },
                          { name: 'Unoptimized', value: 25 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4caf50" />
                        <Cell fill="#ff9800" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Images"
                        secondary="1,234"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Average Size Reduction"
                        secondary="68%"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Storage Saved"
                        secondary="2.3 GB"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* CDN Integration */}
        {cdnStats && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    CDN Status
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CloudQueueIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Provider"
                        secondary={cdnStats.provider}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {cdnStats.status === 'active' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            size="small"
                            label={cdnStats.status}
                            color={cdnStats.status === 'active' ? 'success' : 'error'}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DataUsageIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Data Transferred"
                        secondary={cdnStats.dataTransferred}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cache Hit Rate"
                        secondary={`${cdnStats.cacheHitRate}%`}
                      />
                    </ListItem>
                  </List>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => handlePurgeCDN()}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Purge CDN Cache
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bandwidth Usage
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3">
                      {cdnStats.bandwidth.used} / {cdnStats.bandwidth.limit}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cdnStats.bandwidth.unit}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(cdnStats.bandwidth.used / cdnStats.bandwidth.limit) * 100}
                    sx={{ mt: 2 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    {((cdnStats.bandwidth.used / cdnStats.bandwidth.limit) * 100).toFixed(1)}% used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Request Statistics
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Requests"
                        secondary={cdnStats.requests.total.toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Cached Requests"
                        secondary={cdnStats.requests.cached.toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Origin Requests"
                        secondary={cdnStats.requests.uncached.toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Estimated Cost"
                        secondary={`$${cdnStats.cost.toFixed(2)}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    CDN Performance Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="cdnRequests" fill="#8884d8" name="Total Requests" />
                      <Bar yAxisId="right" dataKey="cdnHitRate" fill="#82ca9d" name="Hit Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Performance Test Result Dialog */}
      <Dialog
        open={openDialog === 'performance-test-result'}
        onClose={() => setOpenDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Performance Test Results</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Alert severity={selectedItem.overall === 'good' ? 'success' : 'warning'} sx={{ mb: 2 }}>
                Overall Performance: {selectedItem.overall}
              </Alert>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItem.metrics?.map((metric: any) => (
                      <TableRow key={metric.name}>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell>{metric.value} {metric.unit}</TableCell>
                        <TableCell>{metric.target} {metric.unit}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={metric.status}
                            color={
                              metric.status === 'pass' ? 'success' :
                              metric.status === 'warning' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {selectedItem.recommendations && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {selectedItem.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PerformanceOptimization;
