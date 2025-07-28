import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Map as MapIcon,
  Info as InfoIcon,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [department, setDepartment] = useState('all');

  // Mock data for charts
  const tenderStatusData = {
    labels: ['Draft', 'Published', 'Under Evaluation', 'Awarded', 'Cancelled'],
    datasets: [
      {
        data: [15, 45, 30, 25, 5],
        backgroundColor: [
          '#FFA726',
          '#42A5F5',
          '#66BB6A',
          '#AB47BC',
          '#EF5350',
        ],
      },
    ],
  };

  const tenderTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tenders Created',
        data: [65, 59, 80, 81, 56, 75],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.1)',
        fill: true,
      },
      {
        label: 'Tenders Awarded',
        data: [45, 39, 60, 61, 36, 55],
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        fill: true,
      },
    ],
  };

  const vendorPerformanceData = {
    labels: ['Quality', 'Delivery', 'Price', 'Communication', 'Compliance'],
    datasets: [
      {
        label: 'Average Score',
        data: [4.2, 3.8, 4.5, 4.0, 4.7],
        backgroundColor: '#42A5F5',
        borderColor: '#1976D2',
        borderWidth: 1,
      },
    ],
  };

  const departmentData = {
    labels: ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Legal'],
    datasets: [
      {
        label: 'Active Tenders',
        data: [12, 8, 15, 20, 6, 10],
        backgroundColor: '#66BB6A',
      },
      {
        label: 'Completed Tenders',
        data: [30, 25, 40, 35, 20, 28],
        backgroundColor: '#42A5F5',
      },
    ],
  };

  // Key metrics
  const metrics = [
    {
      title: 'Total Tenders',
      value: '256',
      change: '+12.5%',
      trend: 'up',
      icon: <AssessmentIcon />,
      color: '#42A5F5',
    },
    {
      title: 'Active Vendors',
      value: '1,248',
      change: '+8.3%',
      trend: 'up',
      icon: <PieChartIcon />,
      color: '#66BB6A',
    },
    {
      title: 'Contract Value',
      value: '₹12.5M',
      change: '+15.2%',
      trend: 'up',
      icon: <BarChartIcon />,
      color: '#AB47BC',
    },
    {
      title: 'Avg. Processing Time',
      value: '18 days',
      change: '-5.2%',
      trend: 'down',
      icon: <LineChartIcon />,
      color: '#FFA726',
    },
  ];

  // Top vendors data
  const topVendors = [
    { name: 'ABC Corporation', contracts: 45, value: '₹2.5M', rating: 4.8 },
    { name: 'XYZ Industries', contracts: 38, value: '₹2.1M', rating: 4.6 },
    { name: 'Tech Solutions Ltd', contracts: 32, value: '₹1.8M', rating: 4.7 },
    { name: 'Global Services Inc', contracts: 28, value: '₹1.5M', rating: 4.5 },
    { name: 'Prime Contractors', contracts: 25, value: '₹1.2M', rating: 4.4 },
  ];

  // Recent activities
  const recentActivities = [
    { type: 'tender_published', title: 'IT Equipment Supply Tender Published', time: '2 hours ago' },
    { type: 'bid_submitted', title: '5 New Bids Received for Construction Project', time: '4 hours ago' },
    { type: 'contract_awarded', title: 'Maintenance Contract Awarded to ABC Corp', time: '6 hours ago' },
    { type: 'vendor_registered', title: '3 New Vendors Registered', time: '1 day ago' },
    { type: 'tender_closed', title: 'Catering Services Tender Closed', time: '2 days ago' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = () => {
    console.log('Exporting analytics data...');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
                startAdornment={<DateRangeIcon sx={{ mr: 1, ml: -0.5 }} />}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        {metric.title}
                      </Typography>
                      <Typography variant="h4">{metric.value}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {metric.trend === 'up' ? (
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: metric.trend === 'up' ? 'success.main' : 'error.main',
                            ml: 0.5,
                          }}
                        >
                          {metric.change}
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: metric.color, width: 56, height: 56 }}>
                      {metric.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Tender Analytics" />
            <Tab label="Vendor Analytics" />
            <Tab label="Financial Analytics" />
            <Tab label="Performance Metrics" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Tender Status Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tender Status Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={tenderStatusData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Tender Trend */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tender Trend
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={tenderTrendData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Department-wise Tenders */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department-wise Tenders
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={departmentData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Vendors */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performing Vendors
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vendor Name</TableCell>
                          <TableCell align="center">Contracts</TableCell>
                          <TableCell align="center">Value</TableCell>
                          <TableCell align="center">Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topVendors.map((vendor, index) => (
                          <TableRow key={index}>
                            <TableCell>{vendor.name}</TableCell>
                            <TableCell align="center">{vendor.contracts}</TableCell>
                            <TableCell align="center">{vendor.value}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={vendor.rating}
                                size="small"
                                color={vendor.rating >= 4.5 ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <Box>
                    {recentActivities.map((activity, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1.5,
                          borderBottom: index < recentActivities.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="body1">{activity.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tender Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tender Categories
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie data={tenderStatusData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Tender Creation
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={departmentData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tender Processing Time Analysis
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={tenderTrendData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Vendor Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vendor Performance Metrics
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={vendorPerformanceData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vendor Registration Trend
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={tenderTrendData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vendor Category Distribution
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="center">Active Vendors</TableCell>
                          <TableCell align="center">Total Contracts</TableCell>
                          <TableCell align="center">Success Rate</TableCell>
                          <TableCell align="center">Avg. Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { category: 'IT Services', vendors: 156, contracts: 342, success: 78, rating: 4.5 },
                          { category: 'Construction', vendors: 89, contracts: 198, success: 82, rating: 4.3 },
                          { category: 'Consultancy', vendors: 134, contracts: 276, success: 85, rating: 4.6 },
                          { category: 'Supply', vendors: 201, contracts: 456, success: 75, rating: 4.2 },
                          { category: 'Maintenance', vendors: 67, contracts: 145, success: 80, rating: 4.4 },
                        ].map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="center">{item.vendors}</TableCell>
                            <TableCell align="center">{item.contracts}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={item.success}
                                  sx={{ flexGrow: 1, mr: 1 }}
                                />
                                <Typography variant="body2">{item.success}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.rating}
                                size="small"
                                color={item.rating >= 4.5 ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Financial Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Overview
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">₹45.2M</Typography>
                        <Typography variant="body2" color="text.secondary">Total Contract Value</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">₹38.7M</Typography>
                        <Typography variant="body2" color="text.secondary">Awarded Value</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">₹6.5M</Typography>
                        <Typography variant="body2" color="text.secondary">In Progress</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">₹2.8M</Typography>
                        <Typography variant="body2" color="text.secondary">Savings Achieved</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ height: 300 }}>
                    <Line data={tenderTrendData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Metrics Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Performance Indicators
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { metric: 'Average Tender Processing Time', value: '18.5 days', target: '15 days', achievement: 77 },
                      { metric: 'Vendor Participation Rate', value: '68%', target: '75%', achievement: 91 },
                      { metric: 'Contract Award Efficiency', value: '82%', target: '85%', achievement: 96 },
                      { metric: 'Cost Savings', value: '12.4%', target: '10%', achievement: 124 },
                      { metric: 'Vendor Satisfaction Score', value: '4.3/5', target: '4.5/5', achievement: 86 },
                      { metric: 'Compliance Rate', value: '94%', target: '95%', achievement: 99 },
                    ].map((kpi, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1">{kpi.metric}</Typography>
                            <Tooltip title={`Target: ${kpi.target}`}>
                              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </Tooltip>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" sx={{ mr: 2 }}>{kpi.value}</Typography>
                            <Chip
                              label={`${kpi.achievement}%`}
                              size="small"
                              color={kpi.achievement >= 100 ? 'success' : kpi.achievement >= 80 ? 'warning' : 'error'}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(kpi.achievement, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: kpi.achievement >= 100 ? 'success.main' : kpi.achievement >= 80 ? 'warning.main' : 'error.main',
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;
