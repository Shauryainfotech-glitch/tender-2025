import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

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
      id={`emd-tabpanel-${index}`}
      aria-labelledby={`emd-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EMDDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEMD, setSelectedEMD] = useState<any>(null);

  // Mock data - replace with Redux state
  const [emds, setEmds] = useState([
    {
      id: '1',
      emdNumber: 'EMD-2024-001',
      tenderNumber: 'TND-2024-101',
      amount: 50000,
      currency: 'INR',
      status: 'active',
      submittedBy: 'ABC Corporation',
      submittedDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-04-15'),
      bankName: 'State Bank of India',
      guaranteeNumber: 'BG-12345',
    },
    {
      id: '2',
      emdNumber: 'EMD-2024-002',
      tenderNumber: 'TND-2024-102',
      amount: 100000,
      currency: 'INR',
      status: 'expired',
      submittedBy: 'XYZ Industries',
      submittedDate: new Date('2024-01-10'),
      expiryDate: new Date('2024-03-10'),
      bankName: 'HDFC Bank',
      guaranteeNumber: 'BG-12346',
    },
    {
      id: '3',
      emdNumber: 'EMD-2024-003',
      tenderNumber: 'TND-2024-103',
      amount: 75000,
      currency: 'INR',
      status: 'refunded',
      submittedBy: 'PQR Solutions',
      submittedDate: new Date('2024-01-20'),
      expiryDate: new Date('2024-04-20'),
      refundDate: new Date('2024-02-25'),
      bankName: 'ICICI Bank',
      guaranteeNumber: 'BG-12347',
    },
  ]);

  const stats = {
    totalEMDs: emds.length,
    activeEMDs: emds.filter(e => e.status === 'active').length,
    totalValue: emds.reduce((sum, e) => sum + e.amount, 0),
    pendingRefunds: emds.filter(e => e.status === 'pending_refund').length,
    expiringThisMonth: emds.filter(e => {
      const today = new Date();
      const expiry = new Date(e.expiryDate);
      return expiry.getMonth() === today.getMonth() && 
             expiry.getFullYear() === today.getFullYear() &&
             e.status === 'active';
    }).length,
  };

  const columns: GridColDef[] = [
    { field: 'emdNumber', headerName: 'EMD Number', width: 130 },
    { field: 'tenderNumber', headerName: 'Tender Number', width: 130 },
    {
      field: 'submittedBy',
      headerName: 'Submitted By',
      width: 180,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {params.row.currency} {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusColors: any = {
          active: 'success',
          expired: 'error',
          refunded: 'info',
          pending_refund: 'warning',
          forfeited: 'error',
        };
        return (
          <Chip
            label={params.value.toUpperCase()}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'submittedDate',
      headerName: 'Submitted Date',
      width: 130,
      renderCell: (params) => format(new Date(params.value), 'dd/MM/yyyy'),
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry Date',
      width: 130,
      renderCell: (params) => format(new Date(params.value), 'dd/MM/yyyy'),
    },
    {
      field: 'bankName',
      headerName: 'Bank',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleActionClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, emd: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedEMD(emd);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    handleCloseMenu();
    if (selectedEMD) {
      switch (action) {
        case 'view':
          navigate(`/emd/${selectedEMD.id}`);
          break;
        case 'refund':
          navigate(`/emd/${selectedEMD.id}/refund`);
          break;
        case 'extend':
          navigate(`/emd/${selectedEMD.id}/extend`);
          break;
        case 'forfeit':
          // Handle forfeit action
          break;
      }
    }
  };

  const getFilteredEMDs = () => {
    let filtered = emds;

    // Filter by tab
    switch (tabValue) {
      case 1: // Active
        filtered = filtered.filter(e => e.status === 'active');
        break;
      case 2: // Expired
        filtered = filtered.filter(e => e.status === 'expired');
        break;
      case 3: // Refunded
        filtered = filtered.filter(e => e.status === 'refunded');
        break;
      case 4: // Forfeited
        filtered = filtered.filter(e => e.status === 'forfeited');
        break;
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(e =>
        e.emdNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        e.tenderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        e.submittedBy.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            EMD Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              sx={{ mr: 2 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/emd/create')}
            >
              Create EMD
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BankIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total EMDs
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.totalEMDs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Active EMDs
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.activeEMDs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BankIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h5">
                  ₹{stats.totalValue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Pending Refunds
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.pendingRefunds}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Expiring Soon
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.expiringThisMonth}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Paper>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`All (${emds.length})`} />
            <Tab label={`Active (${stats.activeEMDs})`} />
            <Tab label="Expired" />
            <Tab label="Refunded" />
            <Tab label="Forfeited" />
          </Tabs>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search by EMD number, tender number, or vendor..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filters
          </Button>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Data Table */}
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={getFilteredEMDs()}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>View Details</MenuItem>
        {selectedEMD?.status === 'active' && (
          <>
            <MenuItem onClick={() => handleMenuAction('refund')}>Process Refund</MenuItem>
            <MenuItem onClick={() => handleMenuAction('extend')}>Extend Validity</MenuItem>
            <MenuItem onClick={() => handleMenuAction('forfeit')}>Forfeit EMD</MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default EMDDashboard;
