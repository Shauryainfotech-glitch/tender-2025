import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Business,
  AttachMoney,
  Refresh,
  ArrowForward,
  Schedule,
  CheckCircle,
  Cancel,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  submittedBids: number;
  organizations: number;
  totalValue: number;
}

interface RecentActivity {
  id: string;
  type: 'tender' | 'bid' | 'notification';
  title: string;
  description: string;
  timestamp: Date;
  status: string;
}

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTenders: 0,
    activeTenders: 0,
    totalBids: 0,
    submittedBids: 0,
    organizations: 0,
    totalValue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalTenders: 124,
        activeTenders: 42,
        totalBids: 356,
        submittedBids: 89,
        organizations: 67,
        totalValue: 45678900,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'tender',
          title: 'New Tender Published',
          description: 'IT Infrastructure Upgrade Project',
          timestamp: new Date(),
          status: 'active',
        },
        {
          id: '2',
          type: 'bid',
          title: 'Bid Submitted',
          description: 'Office Supplies Procurement',
          timestamp: new Date(Date.now() - 3600000),
          status: 'submitted',
        },
        {
          id: '3',
          type: 'notification',
          title: 'Tender Closing Soon',
          description: 'Marketing Services RFP closes in 2 days',
          timestamp: new Date(Date.now() - 7200000),
          status: 'warning',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Tenders',
      value: stats.totalTenders,
      icon: <Assignment />,
      color: theme.palette.primary.main,
      subValue: `${stats.activeTenders} Active`,
    },
    {
      title: 'Total Bids',
      value: stats.totalBids,
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      subValue: `${stats.submittedBids} Submitted`,
    },
    {
      title: 'Organizations',
      value: stats.organizations,
      icon: <Business />,
      color: theme.palette.warning.main,
      subValue: 'Verified',
    },
    {
      title: 'Total Value',
      value: `₹${(stats.totalValue / 100000).toFixed(2)}L`,
      icon: <AttachMoney />,
      color: theme.palette.error.main,
      subValue: 'This Month',
    },
  ];

  // Chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tenders',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
      },
      {
        label: 'Bids',
        data: [25, 35, 30, 45, 40, 55],
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
        tension: 0.4,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Open', 'Closed', 'Awarded', 'Cancelled'],
    datasets: [
      {
        data: [42, 35, 20, 3],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <Assignment color="primary" />;
      case 'bid':
        return <TrendingUp color="secondary" />;
      case 'notification':
        return <Info color="warning" />;
      default:
        return <Info />;
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: any = {
      active: { label: 'Active', color: 'success' },
      submitted: { label: 'Submitted', color: 'primary' },
      warning: { label: 'Attention', color: 'warning' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your tenders today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.subValue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activities */}
      <Grid container spacing={3}>
        {/* Tender Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Tender & Bid Trends</Typography>
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tender Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tender Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Recent Activities</Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate('/activities')}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <Box sx={{ mr: 2 }}>{getActivityIcon(activity.type)}</Box>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <>
                        {activity.description}
                        <Typography variant="caption" display="block">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                  {getStatusChip(activity.status)}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/tenders/create')}
                >
                  Create Tender
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/tenders')}
                >
                  View Tenders
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => navigate('/organizations')}
                >
                  Organizations
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/bids')}
                >
                  My Bids
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
