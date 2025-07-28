import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tooltip,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  DevicesOther as DevicesIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { authService } from '../../services/authService';

interface Session {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    ip: string;
  };
  location?: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  status: 'active' | 'idle' | 'expired';
  mfaVerified: boolean;
  suspicious?: boolean;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  suspiciousSessions: number;
  devicesBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSessions();
        loadStats();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await authService.getActiveSessions();
      setSessions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authService.getSessionStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to load session stats:', err);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await authService.terminateSession(sessionId);
      setSuccess('Session terminated successfully');
      loadSessions();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async (userId: string) => {
    if (!window.confirm('Are you sure you want to terminate all sessions for this user?')) {
      return;
    }

    try {
      await authService.terminateAllUserSessions(userId);
      setSuccess('All user sessions terminated successfully');
      loadSessions();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to terminate sessions');
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to block this user?')) {
      return;
    }

    try {
      await authService.blockUser(userId);
      setSuccess('User blocked successfully');
      loadSessions();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block user');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'tablet':
        return <TabletIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'idle':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.device.ip.includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' || 
      session.status === filterStatus ||
      (filterStatus === 'suspicious' && session.suspicious);

    return matchesSearch && matchesFilter;
  });

  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DevicesIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Sessions
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.totalSessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Active Sessions
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.activeSessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Suspicious
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.suspiciousSessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Device Breakdown
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<ComputerIcon />}
                    label={stats.devicesBreakdown.desktop}
                    size="small"
                  />
                  <Chip
                    icon={<SmartphoneIcon />}
                    label={stats.devicesBreakdown.mobile}
                    size="small"
                  />
                  <Chip
                    icon={<TabletIcon />}
                    label={stats.devicesBreakdown.tablet}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Active Sessions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto-refresh"
            />
            
            {autoRefresh && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Interval</InputLabel>
                <Select
                  value={refreshInterval}
                  label="Interval"
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                >
                  <MenuItem value={10}>10s</MenuItem>
                  <MenuItem value={30}>30s</MenuItem>
                  <MenuItem value={60}>1m</MenuItem>
                  <MenuItem value={300}>5m</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadSessions();
                loadStats();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by user name, email, or IP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter by Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="idle">Idle</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="suspicious">Suspicious</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No sessions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    sx={{
                      backgroundColor: session.suspicious ? 'error.light' : undefined,
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{session.userName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.userEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getDeviceIcon(session.device.type)}
                        <Box>
                          <Typography variant="body2">{session.device.browser}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.device.os} • {session.device.ip}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {session.location ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {session.location.city}, {session.location.country}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unknown
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={format(new Date(session.createdAt), 'PPpp')}>
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={format(new Date(session.lastActivity), 'PPpp')}>
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={session.status}
                          size="small"
                          color={getStatusColor(session.status) as any}
                        />
                        {session.mfaVerified && (
                          <Chip
                            label="MFA"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {session.suspicious && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Suspicious"
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedSession(session);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredSessions.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedSession(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setDetailsOpen(true);
            setAnchorEl(null);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleTerminateSession(selectedSession.id);
            }
            setAnchorEl(null);
          }}
        >
          Terminate Session
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleTerminateAllSessions(selectedSession.userId);
            }
            setAnchorEl(null);
          }}
        >
          Terminate All User Sessions
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSession) {
              handleBlockUser(selectedSession.userId);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          Block User
        </MenuItem>
      </Menu>

      {/* Session Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedSession(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Details</DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Information
                  </Typography>
                  <Typography>{selectedSession.userName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSession.userEmail}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedSession.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Device Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getDeviceIcon(selectedSession.device.type)}
                    <Box>
                      <Typography>{selectedSession.device.browser}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSession.device.os}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IP Address
                  </Typography>
                  <Typography>{selectedSession.device.ip}</Typography>
                </Grid>
                
                {selectedSession.location && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography>
                      {selectedSession.location.city}, {selectedSession.location.country}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session Timeline
                  </Typography>
                  <Typography variant="body2">
                    Created: {format(new Date(selectedSession.createdAt), 'PPpp')}
                  </Typography>
                  <Typography variant="body2">
                    Last Activity: {format(new Date(selectedSession.lastActivity), 'PPpp')}
                  </Typography>
                  <Typography variant="body2">
                    Expires: {format(new Date(selectedSession.expiresAt), 'PPpp')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Security Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={selectedSession.status}
                      color={getStatusColor(selectedSession.status) as any}
                    />
                    {selectedSession.mfaVerified && (
                      <Chip label="MFA Verified" color="primary" />
                    )}
                    {selectedSession.suspicious && (
                      <Chip
                        icon={<WarningIcon />}
                        label="Suspicious Activity"
                        color="warning"
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            color="error"
            onClick={() => {
              if (selectedSession) {
                handleTerminateSession(selectedSession.id);
                setDetailsOpen(false);
              }
            }}
          >
            Terminate Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionManagement;
