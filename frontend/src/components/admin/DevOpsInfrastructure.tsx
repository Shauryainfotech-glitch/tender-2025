import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  Divider,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Build as BuildIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as NotificationsActiveIcon,
  GitHub as GitHubIcon,
  AccountTree as AccountTreeIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  DataUsage as DataUsageIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
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
import { devOpsService } from '../../services/devOpsService';
import { format, formatDistanceToNow } from 'date-fns';

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
      id={`devops-tabpanel-${index}`}
      aria-labelledby={`devops-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
  stages: PipelineStage[];
  triggeredBy: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  commit: {
    sha: string;
    message: string;
    author: string;
  };
}

interface PipelineStage {
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'skipped';
  startTime?: string;
  endTime?: string;
  jobs: string[];
}

interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  duration: number;
  lastRun: string;
}

interface ErrorEvent {
  id: string;
  project: string;
  environment: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  count: number;
  resolved: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  message: string;
  metadata?: any;
}

interface PerformanceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  errorRate: number;
}

const DevOpsInfrastructure: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [errorEvents, setErrorEvents] = useState<ErrorEvent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [filters, setFilters] = useState({
    environment: 'all',
    timeRange: '24h',
    logLevel: 'all',
    service: 'all',
  });
  const [pipelineConfig, setPipelineConfig] = useState({
    name: '',
    branch: 'main',
    stages: [],
    triggers: {
      push: true,
      pullRequest: true,
      schedule: '',
    },
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const loadData = async () => {
    try {
      const [pipelinesRes, testsRes, errorsRes, logsRes, metricsRes] = await Promise.all([
        devOpsService.getPipelines(filters),
        devOpsService.getTestSuites(),
        devOpsService.getErrorEvents(filters),
        devOpsService.getLogs(filters),
        devOpsService.getPerformanceMetrics(filters),
      ]);
      setPipelines(pipelinesRes.data);
      setTestSuites(testsRes.data);
      setErrorEvents(errorsRes.data);
      setLogs(logsRes.data);
      setPerformanceMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error loading DevOps data:', error);
      showSnackbar('Error loading DevOps data', 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRunPipeline = async (pipelineId?: string) => {
    setLoading(true);
    try {
      await devOpsService.runPipeline(pipelineId || 'new', pipelineConfig);
      await loadData();
      showSnackbar('Pipeline started successfully', 'success');
    } catch (error) {
      console.error('Error running pipeline:', error);
      showSnackbar('Error running pipeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPipeline = async (pipelineId: string) => {
    try {
      await devOpsService.cancelPipeline(pipelineId);
      await loadData();
      showSnackbar('Pipeline cancelled', 'success');
    } catch (error) {
      console.error('Error cancelling pipeline:', error);
      showSnackbar('Error cancelling pipeline', 'error');
    }
  };

  const handleRunTests = async (suiteId?: string) => {
    setLoading(true);
    try {
      await devOpsService.runTestSuite(suiteId || 'all');
      showSnackbar('Test suite started', 'success');
    } catch (error) {
      console.error('Error running tests:', error);
      showSnackbar('Error running tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveError = async (errorId: string) => {
    try {
      await devOpsService.resolveError(errorId);
      await loadData();
      showSnackbar('Error marked as resolved', 'success');
    } catch (error) {
      console.error('Error resolving error:', error);
      showSnackbar('Error resolving error', 'error');
    }
  };

  const handleExportLogs = async () => {
    setLoading(true);
    try {
      const response = await devOpsService.exportLogs(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Logs exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting logs:', error);
      showSnackbar('Error exporting logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPipelineStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={20} />;
      case 'pending':
        return <ScheduleIcon color="action" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateTestCoverage = () => {
    if (testSuites.length === 0) return 0;
    const totalCoverage = testSuites.reduce((acc, suite) => acc + suite.coverage, 0);
    return (totalCoverage / testSuites.length).toFixed(1);
  };

  const calculateErrorRate = () => {
    const totalErrors = errorEvents.filter(e => e.level === 'error').length;
    const totalEvents = errorEvents.length;
    return totalEvents > 0 ? ((totalErrors / totalEvents) * 100).toFixed(1) : '0';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">DevOps & Infrastructure</Typography>
        <Box>
          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={filters.environment}
              onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="production">Production</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="development">Development</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Build Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {pipelines.length > 0
                      ? `${((pipelines.filter(p => p.status === 'success').length / pipelines.length) * 100).toFixed(0)}%`
                      : '0%'}
                  </Typography>
                </Box>
                <BuildIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Test Coverage
                  </Typography>
                  <Typography variant="h4">{calculateTestCoverage()}%</Typography>
                </Box>
                <AssessmentIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Error Rate
                  </Typography>
                  <Typography variant="h4">{calculateErrorRate()}%</Typography>
                </Box>
                <BugReportIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {performanceMetrics.length > 0
                      ? `${(performanceMetrics.reduce((acc, m) => acc + m.responseTime, 0) / performanceMetrics.length).toFixed(0)}ms`
                      : '0ms'}
                  </Typography>
                </Box>
                <SpeedIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="CI/CD Pipelines" icon={<AccountTreeIcon />} />
          <Tab label="Automated Testing" icon={<CodeIcon />} />
          <Tab label="Performance Monitoring" icon={<TimelineIcon />} />
          <Tab label="Error Tracking" icon={<BugReportIcon />} />
          <Tab label="Log Aggregation" icon={<StorageIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {/* CI/CD Pipelines */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">CI/CD Pipelines</Typography>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => setOpenDialog('pipeline-config')}
          >
            Run Pipeline
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pipeline</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelines.map((pipeline) => (
                <React.Fragment key={pipeline.id}>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPipelineStatusIcon(pipeline.status)}
                        <Typography sx={{ ml: 1 }}>{pipeline.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{pipeline.branch}</TableCell>
                    <TableCell>
                      <Chip
                        label={pipeline.status}
                        size="small"
                        color={
                          pipeline.status === 'success'
                            ? 'success'
                            : pipeline.status === 'failed'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{pipeline.triggeredBy}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(pipeline.startTime), { addSuffix: true })}</TableCell>
                    <TableCell>{pipeline.duration ? `${pipeline.duration}s` : '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(pipeline);
                          setOpenDialog('pipeline-details');
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {pipeline.status === 'running' && (
                        <IconButton
                          size="small"
                          onClick={() => handleCancelPipeline(pipeline.id)}
                        >
                          <StopIcon fontSize="small" />
                        </IconButton>
                      )}
                      {['success', 'failed', 'cancelled'].includes(pipeline.status) && (
                        <IconButton
                          size="small"
                          onClick={() => handleRunPipeline(pipeline.id)}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Automated Testing */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Test Suites</Typography>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => handleRunTests()}
          >
            Run All Tests
          </Button>
        </Box>

        <Grid container spacing={3}>
          {testSuites.map((suite) => (
            <Grid item xs={12} md={6} key={suite.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{suite.name}</Typography>
                      <Chip label={suite.type} size="small" />
                    </Box>
                    <IconButton onClick={() => handleRunTests(suite.id)}>
                      <PlayArrowIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Test Coverage</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {suite.coverage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={suite.coverage}
                      color={suite.coverage > 80 ? 'success' : suite.coverage > 60 ? 'warning' : 'error'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {suite.totalTests}
                        </Typography>
                        <Typography variant="caption">Total</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {suite.passedTests}
                        </Typography>
                        <Typography variant="caption">Passed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="error.main">
                          {suite.failedTests}
                        </Typography>
                        <Typography variant="caption">Failed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                          {suite.skippedTests}
                        </Typography>
                        <Typography variant="caption">Skipped</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Duration: {suite.duration}ms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last run: {formatDistanceToNow(new Date(suite.lastRun), { addSuffix: true })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Performance Monitoring */}
        <Typography variant="h6" gutterBottom>
          System Performance
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Time Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" name="Response Time (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Utilization
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" name="CPU %" />
                    <Area type="monotone" dataKey="memory" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Memory %" />
                    <Area type="monotone" dataKey="disk" stackId="1" stroke="#ffc658" fill="#ffc658" name="Disk %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Rate & Network Usage
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="errorRate" stroke="#ff0000" name="Error Rate %" />
                    <Line yAxisId="right" type="monotone" dataKey="network" stroke="#00ff00" name="Network (MB/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Error Tracking */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Error Events</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.logLevel}
                onChange={(e) => setFilters({ ...filters, logLevel: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setOpenDialog('error-filters')}
            >
              More Filters
            </Button>
          </Box>
        </Box>

        <List>
          {errorEvents.map((error) => (
            <ListItem key={error.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
              <ListItemIcon>
                {error.level === 'error' ? (
                  <ErrorIcon color="error" />
                ) : error.level === 'warning' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <InfoIcon color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{error.message}</Typography>
                    <Chip label={error.environment} size="small" />
                    <Chip label={`x${error.count}`} size="small" color="error" />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {error.project} • {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                    </Typography>
                    {error.url && (
                      <Typography variant="caption" display="block">
                        URL: {error.url}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => {
                    setSelectedItem(error);
                    setOpenDialog('error-details');
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
                {!error.resolved && (
                  <IconButton onClick={() => handleResolveError(error.id)}>
                    <CheckCircleIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* Log Aggregation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Log Entries</Typography>
          <Box>
            <TextField
              size="small"
              placeholder="Search logs..."
              sx={{ mr: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportLogs}
            >
              Export
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.level.toUpperCase()}
                      size="small"
                      color={getLogLevelColor(log.level) as any}
                    />
                  </TableCell>
                  <TableCell>{log.service}</TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 400 }}>
                      {log.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedItem(log);
                        setOpenDialog('log-details');
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Pipeline Configuration Dialog */}
      <Dialog open={openDialog === 'pipeline-config'} onClose={() => setOpenDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Pipeline</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Pipeline Name"
            value={pipelineConfig.name}
            onChange={(e) => setPipelineConfig({ ...pipelineConfig, name: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Branch</InputLabel>
            <Select
              value={pipelineConfig.branch}
              onChange={(e) => setPipelineConfig({ ...pipelineConfig, branch: e.target.value })}
            >
              <MenuItem value="main">main</MenuItem>
              <MenuItem value="develop">develop</MenuItem>
              <MenuItem value="staging">staging</MenuItem>
              <MenuItem value="feature">feature/*</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Triggers
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={pipelineConfig.triggers.push}
                onChange={(e) => setPipelineConfig({
                  ...pipelineConfig,
                  triggers: { ...pipelineConfig.triggers, push: e.target.checked }
                })}
              />
            }
            label="On Push"
          />
          <FormControlLabel
            control={
              <Switch
                checked={pipelineConfig.triggers.pullRequest}
                onChange={(e) => setPipelineConfig({
                  ...pipelineConfig,
                  triggers: { ...pipelineConfig.triggers, pullRequest: e.target.checked }
                })}
              />
            }
            label="On Pull Request"
          />
          <TextField
            fullWidth
            label="Schedule (Cron Expression)"
            value={pipelineConfig.triggers.schedule}
            onChange={(e) => setPipelineConfig({
              ...pipelineConfig,
              triggers: { ...pipelineConfig.triggers, schedule: e.target.value }
            })}
            margin="normal"
            helperText="e.g., 0 0 * * * (daily at midnight)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button onClick={() => handleRunPipeline()} variant="contained">
            Run Pipeline
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pipeline Details Dialog */}
      <Dialog open={openDialog === 'pipeline-details'} onClose={() => setOpenDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Pipeline Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Branch: {selectedItem.branch}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Triggered by: {selectedItem.triggeredBy}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Started: {format(new Date(selectedItem.startTime), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {selectedItem.duration ? `${selectedItem.duration}s` : 'Running...'}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Commit
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  {selectedItem.commit.sha}
                </Typography>
                <Typography variant="body2">{selectedItem.commit.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  by {selectedItem.commit.author}
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Stages
              </Typography>
              {selectedItem.stages?.map((stage: PipelineStage, index: number) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPipelineStatusIcon(stage.status)}
                      <Typography>{stage.name}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {stage.jobs.map((job, jobIndex) => (
                        <ListItem key={jobIndex}>
                          <ListItemText primary={job} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Details Dialog */}
      <Dialog open={openDialog === 'error-details'} onClose={() => setOpenDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Error Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Alert severity={selectedItem.level as any} sx={{ mb: 2 }}>
                {selectedItem.message}
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Project: {selectedItem.project}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Environment: {selectedItem.environment}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Count: {selectedItem.count}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    First seen: {format(new Date(selectedItem.timestamp), 'PPpp')}
                  </Typography>
                </Grid>
                {selectedItem.url && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      URL: {selectedItem.url}
                    </Typography>
                  </Grid>
                )}
                {selectedItem.userAgent && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      User Agent: {selectedItem.userAgent}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              {selectedItem.stackTrace && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Stack Trace
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto', maxHeight: 400 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {selectedItem.stackTrace}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Close</Button>
          {selectedItem && !selectedItem.resolved && (
            <Button
              onClick={() => {
                handleResolveError(selectedItem.id);
                setOpenDialog(null);
              }}
              variant="contained"
            >
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Log Details Dialog */}
      <Dialog open={openDialog === 'log-details'} onClose={() => setOpenDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp: {format(new Date(selectedItem.timestamp), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Level: <Chip label={selectedItem.level.toUpperCase()} size="small" color={getLogLevelColor(selectedItem.level) as any} />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Service: {selectedItem.service}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Message
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2">{selectedItem.message}</Typography>
                </Paper>
              </Box>
              {selectedItem.metadata && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Metadata
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedItem.metadata, null, 2)}
                    </pre>
                  </Paper>
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

export default DevOpsInfrastructure;
