import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  LinearProgress,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  LocalOffer as OfferIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
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
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dashboardService from '../services/dashboardService';

const localizer = momentLocalizer(moment);

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'activity' | 'calendar' | 'quickActions' | 'performance';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  config?: any;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactElement;
  color: string;
  action: () => void;
}

interface Activity {
  id: string;
  type: 'tender' | 'bid' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  avatar?: string;
  status?: 'success' | 'warning' | 'error';
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  target?: number;
  color: string;
}

interface DashboardStats {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  pendingBids: number;
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  revenueChange: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const defaultWidgets: Widget[] = [
    { id: 'stats', type: 'stats', title: 'Overview Statistics', size: 'large', position: 0, visible: true },
    { id: 'quickActions', type: 'quickActions', title: 'Quick Actions', size: 'medium', position: 1, visible: true },
    { id: 'performance', type: 'performance', title: 'Performance Metrics', size: 'medium', position: 2, visible: true },
    { id: 'recentActivity', type: 'activity', title: 'Recent Activities', size: 'medium', position: 3, visible: true },
    { id: 'tenderChart', type: 'chart', title: 'Tender Analytics', size: 'medium', position: 4, visible: true },
    { id: 'calendar', type: 'calendar', title: 'Upcoming Events', size: 'large', position: 5, visible: true }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'createTender',
      title: 'Create Tender',
      icon: <AddIcon />,
      color: theme.palette.primary.main,
      action: () => console.log('Create tender')
    },
    {
      id: 'viewBids',
      title: 'View Bids',
      icon: <GavelIcon />,
      color: theme.palette.success.main,
      action: () => console.log('View bids')
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <AnalyticsIcon />,
      color: theme.palette.warning.main,
      action: () => console.log('View reports')
    },
    {
      id: 'users',
      title: 'Manage Users',
      icon: <PeopleIcon />,
      color: theme.palette.info.main,
      action: () => console.log('Manage users')
    }
  ];

  useEffect(() => {
    loadDashboardData();
    loadWidgetConfiguration();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, recentActivities, metrics, events] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivities(),
        dashboardService.getPerformanceMetrics(),
        dashboardService.getCalendarEvents()
      ]);
      
      setStats(dashboardStats);
      setActivities(recentActivities);
      setPerformanceMetrics(metrics);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetConfiguration = async () => {
    try {
      const savedWidgets = await dashboardService.getWidgetConfiguration();
      setWidgets(savedWidgets.length > 0 ? savedWidgets : defaultWidgets);
    } catch (error) {
      setWidgets(defaultWidgets);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedWidgets = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setWidgets(updatedWidgets);
    dashboardService.saveWidgetConfiguration(updatedWidgets);
  };

  const handleWidgetVisibilityToggle = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    setWidgets(updatedWidgets);
    dashboardService.saveWidgetConfiguration(updatedWidgets);
  };

  const handleWidgetSizeChange = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, size } : widget
    );
    setWidgets(updatedWidgets);
    dashboardService.saveWidgetConfiguration(updatedWidgets);
  };

  const getWidgetGridSize = (size: 'small' | 'medium' | 'large') => {
    if (isMobile) return 12;
    if (isMedium) return size === 'small' ? 6 : 12;
    
    switch (size) {
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 12;
      default: return 6;
    }
  };

  const renderStatsWidget = () => {
    if (!stats) return null;

    const statCards = [
      {
        title: 'Total Tenders',
        value: stats.totalTenders,
        subtitle: `${stats.activeTenders} active`,
        icon: <AssignmentIcon />,
        color: theme.palette.primary.main,
        trend: 'up'
      },
      {
        title: 'Total Bids',
        value: stats.totalBids,
        subtitle: `${stats.pendingBids} pending`,
        icon: <GavelIcon />,
        color: theme.palette.success.main,
        trend: 'up'
      },
      {
        title: 'Active Users',
        value: stats.activeUsers,
        subtitle: `of ${stats.totalUsers} total`,
        icon: <PeopleIcon />,
        color: theme.palette.info.main,
        trend: 'stable'
      },
      {
        title: 'Revenue',
        value: `$${stats.revenue.toLocaleString()}`,
        subtitle: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`,
        icon: <MoneyIcon />,
        color: theme.palette.warning.main,
        trend: stats.revenueChange > 0 ? 'up' : 'down'
      }
    ];

    return (
      <Grid container spacing={2}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ ml: 'auto' }}>
                    {stat.trend === 'up' && <TrendingUpIcon color="success" />}
                    {stat.trend === 'down' && <TrendingDownIcon color="error" />}
                  </Box>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderQuickActionsWidget = () => (
    <Grid container spacing={2}>
      {quickActions.map((action) => (
        <Grid item xs={6} md={3} key={action.id}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={action.action}
          >
            <Avatar
              sx={{
                bgcolor: `${action.color}20`,
                color: action.color,
                width: 56,
                height: 56,
                margin: '0 auto',
                mb: 1
              }}
            >
              {action.icon}
            </Avatar>
            <Typography variant="body2">{action.title}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderActivityWidget = () => (
    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={activity.avatar} alt={activity.user}>
                {activity.user.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{activity.title}</Typography>
                  {activity.status && (
                    <Chip
                      size="small"
                      label={activity.status}
                      color={
                        activity.status === 'success' ? 'success' :
                        activity.status === 'warning' ? 'warning' : 'error'
                      }
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {activity.user}
                  </Typography>
                  {` — ${activity.description}`}
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {moment(activity.timestamp).fromNow()}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );

  const renderPerformanceWidget = () => (
    <Grid container spacing={2}>
      {performanceMetrics.map((metric) => (
        <Grid item xs={12} sm={6} key={metric.id}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {metric.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {metric.trend === 'up' ? (
                  <ArrowUpIcon color="success" fontSize="small" />
                ) : metric.trend === 'down' ? (
                  <ArrowDownIcon color="error" fontSize="small" />
                ) : null}
                <Typography
                  variant="caption"
                  color={metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 'error.main' : 'text.secondary'}
                >
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h5" gutterBottom>
              {metric.value}{metric.unit}
            </Typography>
            {metric.target && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={(metric.value / metric.target) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: metric.color,
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  Target: {metric.target}{metric.unit}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderChartWidget = () => {
    const chartData = [
      { name: 'Jan', tenders: 400, bids: 240, amt: 2400 },
      { name: 'Feb', tenders: 300, bids: 139, amt: 2210 },
      { name: 'Mar', tenders: 200, bids: 980, amt: 2290 },
      { name: 'Apr', tenders: 278, bids: 390, amt: 2000 },
      { name: 'May', tenders: 189, bids: 480, amt: 2181 },
      { name: 'Jun', tenders: 239, bids: 380, amt: 2500 }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip />
          <Legend />
          <Line type="monotone" dataKey="tenders" stroke={theme.palette.primary.main} strokeWidth={2} />
          <Line type="monotone" dataKey="bids" stroke={theme.palette.success.main} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderCalendarWidget = () => (
    <Box sx={{ height: 400 }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        defaultView="month"
        eventPropGetter={(event: any) => ({
          style: {
            backgroundColor: event.color || theme.palette.primary.main,
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
          }
        })}
      />
    </Box>
  );

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return renderStatsWidget();
      case 'quickActions':
        return renderQuickActionsWidget();
      case 'activity':
        return renderActivityWidget();
      case 'performance':
        return renderPerformanceWidget();
      case 'chart':
        return renderChartWidget();
      case 'calendar':
        return renderCalendarWidget();
      default:
        return null;
    }
  };

  const handleWidgetMenuClick = (event: React.MouseEvent<HTMLElement>, widget: Widget) => {
    setAnchorEl(event.currentTarget);
    setSelectedWidget(widget);
  };

  const handleWidgetMenuClose = () => {
    setAnchorEl(null);
    setSelectedWidget(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back! Here's what's happening today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Widgets */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <Grid
              container
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {widgets
                .filter(widget => widget.visible)
                .sort((a, b) => a.position - b.position)
                .map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <Grid
                        item
                        xs={12}
                        sm={getWidgetGridSize(widget.size)}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s'
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box {...provided.dragHandleProps} sx={{ cursor: 'grab', display: 'flex' }}>
                                  <DragIcon color="action" />
                                </Box>
                                <Typography variant="h6">{widget.title}</Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleWidgetMenuClick(e, widget)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                            {renderWidget(widget)}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {/* Widget Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleWidgetMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedWidget) {
            handleWidgetSizeChange(selectedWidget.id, 'small');
          }
          handleWidgetMenuClose();
        }}>
          Small Size
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedWidget) {
            handleWidgetSizeChange(selectedWidget.id, 'medium');
          }
          handleWidgetMenuClose();
        }}>
          Medium Size
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedWidget) {
            handleWidgetSizeChange(selectedWidget.id, 'large');
          }
          handleWidgetMenuClose();
        }}>
          Large Size
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedWidget) {
            handleWidgetVisibilityToggle(selectedWidget.id);
          }
          handleWidgetMenuClose();
        }}>
          Hide Widget
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Widget Visibility
          </Typography>
          <List>
            {widgets.map((widget) => (
              <ListItem key={widget.id}>
                <ListItemText primary={widget.title} />
                <ListItemSecondaryAction>
                  <Switch
                    checked={widget.visible}
                    onChange={() => handleWidgetVisibilityToggle(widget.id)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setWidgets(defaultWidgets);
              dashboardService.saveWidgetConfiguration(defaultWidgets);
              setSettingsOpen(false);
            }}
          >
            Reset to Default
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.id}
            icon={action.icon}
            tooltipTitle={action.title}
            onClick={() => {
              action.action();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>

      <style jsx global>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;
