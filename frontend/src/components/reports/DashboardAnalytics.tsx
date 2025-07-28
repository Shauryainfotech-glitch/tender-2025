import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Menu,
  LinearProgress,
  Stack,
  Skeleton,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  FullscreenExit as MinimizeIcon,
  Fullscreen as MaximizeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Palette as ThemeIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  ContentCopy as CopyIcon,
  DragIndicator as DragIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  PushPin as PinIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { reportService } from '../../services/reportService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const ResponsiveGridLayout = WidthProvider(ReactGridLayout);

interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'list' | 'table' | 'custom';
  title: string;
  description?: string;
  dataSource: string;
  refreshInterval?: number; // in seconds
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
    metric?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupBy?: string;
    filters?: any[];
    displayFormat?: string;
    showTrend?: boolean;
    showComparison?: boolean;
    comparisonPeriod?: 'day' | 'week' | 'month' | 'year';
    thresholds?: {
      warning?: number;
      danger?: number;
    };
    colors?: string[];
    limit?: number;
  };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
  isPinned?: boolean;
  isVisible?: boolean;
}

interface Dashboard {
  id?: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  theme?: 'light' | 'dark';
  layout?: 'grid' | 'list';
  filters?: any[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  tags?: string[];
}

interface WidgetData {
  [widgetId: string]: {
    data: any;
    loading: boolean;
    error?: string;
    lastUpdated?: Date;
  };
}

const DashboardAnalytics: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard>({
    name: 'Main Dashboard',
    widgets: [],
    layout: 'grid',
  });
  const [widgetData, setWidgetData] = useState<WidgetData>({});
  const [savedDashboards, setSavedDashboards] = useState<Dashboard[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [showDashboardDialog, setShowDashboardDialog] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [globalFilters, setGlobalFilters] = useState<any[]>([]);
  const [refreshIntervals, setRefreshIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});

  const widgetTemplates = [
    {
      type: 'stat',
      title: 'Total Tenders',
      icon: <TaskIcon />,
      dataSource: 'tenders',
      config: {
        metric: 'count',
        showTrend: true,
        showComparison: true,
        comparisonPeriod: 'month',
      },
      layout: { w: 3, h: 2 },
    },
    {
      type: 'stat',
      title: 'Active Vendors',
      icon: <PeopleIcon />,
      dataSource: 'vendors',
      config: {
        metric: 'count',
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
        showTrend: true,
      },
      layout: { w: 3, h: 2 },
    },
    {
      type: 'stat',
      title: 'Total Value',
      icon: <MoneyIcon />,
      dataSource: 'tenders',
      config: {
        metric: 'value',
        aggregation: 'sum',
        displayFormat: 'currency',
        showTrend: true,
      },
      layout: { w: 3, h: 2 },
    },
    {
      type: 'stat',
      title: 'Success Rate',
      icon: <SuccessIcon />,
      dataSource: 'bids',
      config: {
        metric: 'success_rate',
        displayFormat: 'percentage',
        thresholds: { warning: 60, danger: 40 },
      },
      layout: { w: 3, h: 2 },
    },
    {
      type: 'chart',
      title: 'Tender Trends',
      icon: <TrendingUpIcon />,
      dataSource: 'tenders',
      config: {
        chartType: 'line',
        metric: 'count',
        groupBy: 'month',
        showComparison: true,
      },
      layout: { w: 6, h: 4 },
    },
    {
      type: 'chart',
      title: 'Category Distribution',
      icon: <PieChartIcon />,
      dataSource: 'tenders',
      config: {
        chartType: 'pie',
        metric: 'count',
        groupBy: 'category',
      },
      layout: { w: 6, h: 4 },
    },
    {
      type: 'chart',
      title: 'Monthly Revenue',
      icon: <BarChartIcon />,
      dataSource: 'tenders',
      config: {
        chartType: 'bar',
        metric: 'value',
        aggregation: 'sum',
        groupBy: 'month',
      },
      layout: { w: 12, h: 4 },
    },
    {
      type: 'list',
      title: 'Recent Activities',
      icon: <ScheduleIcon />,
      dataSource: 'activities',
      config: {
        limit: 10,
      },
      layout: { w: 6, h: 4 },
    },
    {
      type: 'table',
      title: 'Top Vendors',
      icon: <PeopleIcon />,
      dataSource: 'vendors',
      config: {
        limit: 5,
        metric: 'total_value',
        aggregation: 'sum',
      },
      layout: { w: 6, h: 4 },
    },
  ];

  const chartColors = {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  };

  const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    loadInitialData();
    return () => {
      // Clear all refresh intervals on unmount
      Object.values(refreshIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  useEffect(() => {
    // Load widget data when dashboard changes
    dashboard.widgets.forEach(widget => {
      loadWidgetData(widget);
      setupWidgetRefresh(widget);
    });
  }, [dashboard.widgets]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const dashboardsRes = await reportService.getDashboards();
      setSavedDashboards(dashboardsRes.data);
      
      // Load default dashboard if exists
      if (dashboardsRes.data.length > 0) {
        setDashboard(dashboardsRes.data[0]);
      } else {
        // Create default widgets
        const defaultWidgets = widgetTemplates.slice(0, 4).map((template, index) => ({
          ...template,
          id: `widget-${Date.now()}-${index}`,
          layout: {
            ...template.layout,
            x: (index % 4) * 3,
            y: Math.floor(index / 4) * 2,
          },
          isVisible: true,
        }));
        setDashboard(prev => ({ ...prev, widgets: defaultWidgets }));
      }
    } catch (err: any) {
      setError('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetData = async (widget: DashboardWidget) => {
    setWidgetData(prev => ({
      ...prev,
      [widget.id]: {
        ...prev[widget.id],
        loading: true,
        error: undefined,
      },
    }));

    try {
      const response = await reportService.getWidgetData({
        dataSource: widget.dataSource,
        config: widget.config,
        filters: [...(widget.config.filters || []), ...globalFilters],
        dateRange,
      });

      setWidgetData(prev => ({
        ...prev,
        [widget.id]: {
          data: response.data,
          loading: false,
          lastUpdated: new Date(),
        },
      }));
    } catch (err: any) {
      setWidgetData(prev => ({
        ...prev,
        [widget.id]: {
          data: null,
          loading: false,
          error: err.response?.data?.message || 'Failed to load widget data',
        },
      }));
    }
  };

  const setupWidgetRefresh = (widget: DashboardWidget) => {
    if (widget.refreshInterval) {
      // Clear existing interval if any
      if (refreshIntervals[widget.id]) {
        clearInterval(refreshIntervals[widget.id]);
      }

      // Set up new interval
      const interval = setInterval(() => {
        loadWidgetData(widget);
      }, widget.refreshInterval * 1000);

      setRefreshIntervals(prev => ({
        ...prev,
        [widget.id]: interval,
      }));
    }
  };

  const handleAddWidget = (template: any) => {
    const newWidget: DashboardWidget = {
      ...template,
      id: `widget-${Date.now()}`,
      layout: {
        ...template.layout,
        x: 0,
        y: 0,
      },
      isVisible: true,
    };

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    setShowWidgetDialog(false);
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      ),
    }));
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!window.confirm('Are you sure you want to remove this widget?')) {
      return;
    }

    // Clear refresh interval if exists
    if (refreshIntervals[widgetId]) {
      clearInterval(refreshIntervals[widgetId]);
      setRefreshIntervals(prev => {
        const { [widgetId]: _, ...rest } = prev;
        return rest;
      });
    }

    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
    }));
  };

  const handleLayoutChange = (layout: any[]) => {
    if (!editMode) return;

    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => {
        const layoutItem = layout.find(l => l.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            layout: {
              ...widget.layout,
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return widget;
      }),
    }));
  };

  const handleSaveDashboard = async () => {
    if (!dashboard.name.trim()) {
      setError('Please enter a dashboard name');
      return;
    }

    setLoading(true);
    try {
      if (dashboard.id) {
        await reportService.updateDashboard(dashboard.id, dashboard);
        setSuccess('Dashboard updated successfully');
      } else {
        await reportService.createDashboard(dashboard);
        setSuccess('Dashboard saved successfully');
      }
      
      // Reload dashboards
      const dashboardsRes = await reportService.getDashboards();
      setSavedDashboards(dashboardsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDashboard = async (format: 'pdf' | 'image') => {
    setLoading(true);
    try {
      const response = await reportService.exportDashboard(dashboard, format);
      
      // Handle file download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'image/png',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dashboard.name}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Dashboard exported successfully');
    } catch (err: any) {
      setError('Failed to export dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const data = widgetData[widget.id];
    const isFullscreen = fullscreenWidget === widget.id;

    if (!widget.isVisible && !editMode) {
      return null;
    }

    const content = (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: widget.isVisible ? 1 : 0.5,
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 1300 : 'auto',
          m: isFullscreen ? 2 : 0,
        }}
      >
        <CardContent sx={{ pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div">
              {widget.title}
              {widget.isPinned && (
                <Tooltip title="Pinned">
                  <PinIcon sx={{ ml: 1, fontSize: 16, color: 'primary.main' }} />
                </Tooltip>
              )}
            </Typography>
            <Box>
              {editMode && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateWidget(widget.id, { 
                      isVisible: !widget.isVisible 
                    })}
                  >
                    {widget.isVisible ? <ViewIcon /> : <HideIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateWidget(widget.id, { 
                      isPinned: !widget.isPinned 
                    })}
                  >
                    <PinIcon color={widget.isPinned ? 'primary' : 'inherit'} />
                  </IconButton>
                </>
              )}
              <IconButton
                size="small"
                onClick={() => loadWidgetData(widget)}
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setFullscreenWidget(
                  isFullscreen ? null : widget.id
                )}
              >
                {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
              </IconButton>
              {editMode && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveWidget(widget.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {widget.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {widget.description}
            </Typography>
          )}

          <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {data?.loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                zIndex: 1,
              }}>
                <CircularProgress />
              </Box>
            )}

            {data?.error && (
              <Alert severity="error">{data.error}</Alert>
            )}

            {!data?.loading && !data?.error && (
              <>
                {widget.type === 'stat' && renderStatWidget(widget, data?.data)}
                {widget.type === 'chart' && renderChartWidget(widget, data?.data)}
                {widget.type === 'list' && renderListWidget(widget, data?.data)}
                {widget.type === 'table' && renderTableWidget(widget, data?.data)}
              </>
            )}
          </Box>

          {data?.lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Last updated: {format(data.lastUpdated, 'HH:mm:ss')}
            </Typography>
          )}
        </CardContent>
      </Card>
    );

    return content;
  };

  const renderStatWidget = (widget: DashboardWidget, data: any) => {
    if (!data) return <Skeleton variant="rectangular" height="100%" />;

    const { value, trend, comparison, status } = data;
    const config = widget.config;

    const getStatusColor = () => {
      if (config.thresholds) {
        if (value <= config.thresholds.danger!) return 'error';
        if (value <= config.thresholds.warning!) return 'warning';
      }
      return 'success';
    };

    const formatValue = (val: number) => {
      if (config.displayFormat === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      }
      if (config.displayFormat === 'percentage') {
        return `${val.toFixed(1)}%`;
      }
      return val.toLocaleString();
    };

    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h3" component="div" color={getStatusColor()}>
          {formatValue(value)}
        </Typography>

        {config.showTrend && trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon color="success" />
            ) : trend < 0 ? (
              <TrendingDownIcon color="error" />
            ) : null}
            <Typography
              variant="body2"
              color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
            >
              {Math.abs(trend).toFixed(1)}%
            </Typography>
          </Box>
        )}

        {config.showComparison && comparison !== undefined && (
          <Typography variant="body2" color="text.secondary">
            vs last {config.comparisonPeriod}: {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}%
          </Typography>
        )}
      </Box>
    );
  };

  const renderChartWidget = (widget: DashboardWidget, data: any) => {
    if (!data) return <Skeleton variant="rectangular" height="100%" />;

    const { labels, datasets } = data;
    const config = widget.config;

    const chartData = {
      labels,
      datasets: datasets.map((dataset: any, index: number) => ({
        ...dataset,
        backgroundColor: config.colors?.[index] || 
          Object.values(chartColors)[index % Object.values(chartColors).length],
        borderColor: config.colors?.[index] || 
          Object.values(chartColors)[index % Object.values(chartColors).length],
      })),
    };

    const chartOptions = {
      ...defaultChartOptions,
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          ...defaultChartOptions.plugins.legend,
          display: config.chartType === 'pie' || config.chartType === 'doughnut',
        },
      },
    };

    return (
      <Box sx={{ height: '100%', position: 'relative' }}>
        {config.chartType === 'line' && <Line data={chartData} options={chartOptions} />}
        {config.chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
        {config.chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
        {config.chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
        {config.chartType === 'area' && (
          <Line 
            data={{
              ...chartData,
              datasets: chartData.datasets.map((d: any) => ({
                ...d,
                fill: true,
              })),
            }} 
            options={chartOptions} 
          />
        )}
      </Box>
    );
  };

  const renderListWidget = (widget: DashboardWidget, data: any) => {
    if (!data) return <Skeleton variant="rectangular" height="100%" />;

    return (
      <List sx={{ overflow: 'auto', height: '100%' }}>
        {data.items.map((item: any, index: number) => (
          <ListItem key={index} divider>
            <ListItemIcon>
              <Avatar sx={{ width: 32, height: 32 }}>
                {item.icon || item.title?.[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              secondary={item.subtitle}
            />
            {item.badge && (
              <Chip label={item.badge} size="small" color={item.badgeColor || 'default'} />
            )}
          </ListItem>
        ))}
      </List>
    );
  };

  const renderTableWidget = (widget: DashboardWidget, data: any) => {
    if (!data) return <Skeleton variant="rectangular" height="100%" />;

    return (
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {data.columns.map((column: any) => (
                <th
                  key={column.key}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'left',
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row: any, index: number) => (
              <tr key={index}>
                {data.columns.map((column: any) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {dashboard.name}
            {dashboard.description && (
              <Typography variant="body2" color="text.secondary">
                {dashboard.description}
              </Typography>
            )}
          </Typography>
          <Box>
            <ToggleButton
              value="edit"
              selected={editMode}
              onChange={() => setEditMode(!editMode)}
              size="small"
              sx={{ mr: 1 }}
            >
              {editMode ? <LockIcon /> : <UnlockIcon />}
              {editMode ? 'Lock' : 'Edit'}
            </ToggleButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowWidgetDialog(true)}
              sx={{ mr: 1 }}
              disabled={!editMode}
            >
              Add Widget
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDashboard}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && dashboard.widgets.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No widgets added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click "Add Widget" to start building your dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowWidgetDialog(true)}
            >
              Add First Widget
            </Button>
          </Box>
        )}

        {!loading && dashboard.widgets.length > 0 && (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: dashboard.widgets.map(w => ({ ...w.layout, i: w.id })) }}
            cols={12}
            rowHeight={60}
            isDraggable={editMode}
            isResizable={editMode}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
          >
            {dashboard.widgets.map(widget => (
              <div key={widget.id}>
                {editMode && (
                  <div
                    className="drag-handle"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      cursor: 'move',
                      padding: '4px',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px 0 4px 0',
                    }}
                  >
                    <DragIcon fontSize="small" />
                  </div>
                )}
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </Box>

      {/* Add Widget Dialog */}
      <Dialog
        open={showWidgetDialog}
        onClose={() => setShowWidgetDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {widgetTemplates.map((template, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleAddWidget(template)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {template.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {template.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.type === 'stat' && 'Display a single metric with trend'}
                      {template.type === 'chart' && 'Visualize data with charts'}
                      {template.type === 'list' && 'Show a list of items'}
                      {template.type === 'table' && 'Display data in a table format'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={template.type} size="small" sx={{ mr: 0.5 }} />
                      <Chip label={template.dataSource} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWidgetDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          handleExportDashboard('pdf');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Export as PDF" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportDashboard('image');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Export as Image" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          // Handle dashboard settings
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard Settings" />
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle sharing
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Share Dashboard" />
        </MenuItem>
      </Menu>

      {/* Success/Error Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

// Import required icons
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
} from '@mui/icons-material';

export default DashboardAnalytics;
