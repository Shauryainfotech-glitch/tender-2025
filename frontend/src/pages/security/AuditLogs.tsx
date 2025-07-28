import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  VpnKey as IpIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  // Mock audit log data
  const auditLogs = [
    {
      id: '1',
      timestamp: new Date('2025-07-25T10:30:00'),
      user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      },
      module: 'Tender',
      action: 'CREATE',
      description: 'Created new tender: IT Equipment Supply',
      entityId: 'TND-2024-101',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Mumbai, India',
      status: 'success',
      changes: {
        title: 'IT Equipment Supply',
        estimatedValue: '₹5,00,000',
        closingDate: '2025-08-15',
      },
    },
    {
      id: '2',
      timestamp: new Date('2025-07-25T09:45:00'),
      user: {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Vendor',
      },
      module: 'Bid',
      action: 'SUBMIT',
      description: 'Submitted bid for tender TND-2024-101',
      entityId: 'BID-2024-501',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Delhi, India',
      status: 'success',
      changes: {
        bidAmount: '₹4,75,000',
        validityDays: 90,
      },
    },
    {
      id: '3',
      timestamp: new Date('2025-07-25T08:30:00'),
      user: {
        id: 'user3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'SuperAdmin',
      },
      module: 'User',
      action: 'UPDATE',
      description: 'Updated user permissions for john.doe@example.com',
      entityId: 'user1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Mumbai, India',
      status: 'success',
      changes: {
        permissions: ['create_tender', 'approve_vendor', 'view_reports'],
      },
    },
    {
      id: '4',
      timestamp: new Date('2025-07-25T07:15:00'),
      user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      },
      module: 'Contract',
      action: 'APPROVE',
      description: 'Approved contract for vendor ABC Corporation',
      entityId: 'CTR-2024-201',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Mumbai, India',
      status: 'success',
    },
    {
      id: '5',
      timestamp: new Date('2025-07-24T16:45:00'),
      user: {
        id: 'user4',
        name: 'Security Admin',
        email: 'security@example.com',
        role: 'SecurityAdmin',
      },
      module: 'Security',
      action: 'LOGIN_FAILED',
      description: 'Failed login attempt',
      entityId: 'unknown@example.com',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      location: 'Unknown',
      status: 'failed',
      error: 'Invalid credentials',
    },
  ];

  const modules = ['All', 'Tender', 'Bid', 'Contract', 'User', 'Security', 'Payment', 'Vendor'];
  const actions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'SUBMIT'];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  const getActionColor = (action: string) => {
    const actionColors: any = {
      CREATE: 'primary',
      UPDATE: 'info',
      DELETE: 'error',
      APPROVE: 'success',
      REJECT: 'warning',
      LOGIN: 'default',
      LOGIN_FAILED: 'error',
      LOGOUT: 'default',
      SUBMIT: 'primary',
    };
    return actionColors[action] || 'default';
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'success' : 'error';
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = searchQuery === '' || 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModule = filterModule === 'all' || log.module.toLowerCase() === filterModule.toLowerCase();
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = filterUser === 'all' || log.user.email === filterUser;
    
    return matchesSearch && matchesModule && matchesAction && matchesUser;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all system activities and user actions
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Module</InputLabel>
              <Select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                label="Module"
              >
                {modules.map((module) => (
                  <MenuItem key={module} value={module.toLowerCase()}>
                    {module}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                label="Action"
              >
                {actions.map((action) => (
                  <MenuItem key={action} value={action === 'All' ? 'all' : action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary">
                <RefreshIcon />
              </IconButton>
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {format(log.timestamp, 'dd/MM/yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(log.timestamp, 'HH:mm:ss')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{log.user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.user.role}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.module} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action)}
                    />
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.ipAddress}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(log.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(log)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Log Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Audit Log Details</Typography>
            <Chip
              label={selectedLog?.status.toUpperCase()}
              color={selectedLog?.status === 'success' ? 'success' : 'error'}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Log ID"
                          secondary={selectedLog.id}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Timestamp"
                          secondary={format(selectedLog.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Module"
                          secondary={selectedLog.module}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Action"
                          secondary={selectedLog.action}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Entity ID"
                          secondary={selectedLog.entityId}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* User Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="User Name"
                          secondary={selectedLog.user.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedLog.user.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Role"
                          secondary={selectedLog.user.role}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="IP Address"
                          secondary={selectedLog.ipAddress}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Location"
                          secondary={selectedLog.location}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Technical Details */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Technical Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        User Agent
                      </Typography>
                      <Typography variant="body2">
                        {selectedLog.userAgent}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedLog.description}
                      </Typography>
                    </Box>
                    {selectedLog.error && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="error">
                          Error Message
                        </Typography>
                        <Typography variant="body2" color="error">
                          {selectedLog.error}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Changes Made */}
              {selectedLog.changes && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Changes Made
                      </Typography>
                      <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                        <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                          {JSON.stringify(selectedLog.changes, null, 2)}
                        </pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;
