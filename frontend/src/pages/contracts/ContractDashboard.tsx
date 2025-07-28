import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Description as ContractIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
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
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContractDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Mock data
  const contracts = [
    {
      id: '1',
      contractNumber: 'CTR-2024-001',
      title: 'IT Infrastructure Setup',
      vendor: 'ABC Corporation',
      tender: 'TND-2024-101',
      value: 5000000,
      currency: 'INR',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      completionPercentage: 65,
      paymentStatus: 'partial',
      deliverables: 5,
      completedDeliverables: 3,
    },
    {
      id: '2',
      contractNumber: 'CTR-2024-002',
      title: 'Annual Maintenance Contract',
      vendor: 'XYZ Industries',
      tender: 'TND-2024-102',
      value: 2000000,
      currency: 'INR',
      status: 'active',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      completionPercentage: 45,
      paymentStatus: 'pending',
      deliverables: 12,
      completedDeliverables: 5,
    },
    {
      id: '3',
      contractNumber: 'CTR-2023-098',
      title: 'Software Development Project',
      vendor: 'Tech Solutions Ltd',
      tender: 'TND-2023-450',
      value: 8000000,
      currency: 'INR',
      status: 'completed',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      completionPercentage: 100,
      paymentStatus: 'completed',
      deliverables: 8,
      completedDeliverables: 8,
    },
    {
      id: '4',
      contractNumber: 'CTR-2024-003',
      title: 'Consulting Services',
      vendor: 'Global Consultants',
      tender: 'TND-2024-103',
      value: 3500000,
      currency: 'INR',
      status: 'draft',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      completionPercentage: 0,
      paymentStatus: 'pending',
      deliverables: 6,
      completedDeliverables: 0,
    },
  ];

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0),
    completedContracts: contracts.filter(c => c.status === 'completed').length,
    avgCompletion: Math.round(contracts.reduce((sum, c) => sum + c.completionPercentage, 0) / contracts.length),
    expiringContracts: contracts.filter(c => {
      const today = new Date();
      const endDate = new Date(c.endDate);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
  };

  const columns: GridColDef[] = [
    {
      field: 'contractNumber',
      headerName: 'Contract Number',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ContractIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 250,
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      width: 180,
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 150,
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
          draft: 'default',
          active: 'primary',
          completed: 'success',
          terminated: 'error',
          suspended: 'warning',
        };
        return (
          <Chip
            label={params.value.toUpperCase()}
            color={statusColors[params.value]}
            size="small"
          />
        );
      },
    },
    {
      field: 'completionPercentage',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={params.value} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {params.value}%
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      renderCell: (params) => format(new Date(params.value), 'dd/MM/yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, contract: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleMenuAction = (action: string) => {
    handleCloseMenu();
    if (selectedContract) {
      switch (action) {
        case 'view':
          navigate(`/contracts/${selectedContract.id}`);
          break;
        case 'edit':
          navigate(`/contracts/${selectedContract.id}/edit`);
          break;
        case 'terminate':
          // Handle termination
          break;
      }
    }
  };

  const getFilteredContracts = () => {
    let filtered = contracts;

    // Filter by tab
    switch (tabValue) {
      case 1: // Active
        filtered = filtered.filter(c => c.status === 'active');
        break;
      case 2: // Draft
        filtered = filtered.filter(c => c.status === 'draft');
        break;
      case 3: // Completed
        filtered = filtered.filter(c => c.status === 'completed');
        break;
      case 4: // Expiring Soon
        filtered = filtered.filter(c => {
          const today = new Date();
          const endDate = new Date(c.endDate);
          const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        });
        break;
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(c =>
        c.contractNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        c.vendor.toLowerCase().includes(searchText.toLowerCase())
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
            Contract Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mr: 2 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/contracts/create')}
            >
              Create Contract
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ContractIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Contracts
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.totalContracts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Active
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.activeContracts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MoneyIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h5">
                  ₹{(stats.totalValue / 1000000).toFixed(1)}M
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CompleteIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.completedContracts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Avg Progress
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.avgCompletion}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Expiring Soon
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.expiringContracts}</Typography>
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
            <Tab label={`All (${contracts.length})`} />
            <Tab label={`Active (${stats.activeContracts})`} />
            <Tab label="Draft" />
            <Tab label="Completed" />
            <Tab label="Expiring Soon" />
          </Tabs>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search contracts..."
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
        </Box>

        {/* Data Table */}
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={getFilteredContracts()}
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
        <MenuItem onClick={() => handleMenuAction('edit')}>Edit Contract</MenuItem>
        {selectedContract?.status === 'active' && (
          <MenuItem onClick={() => handleMenuAction('terminate')}>
            Terminate Contract
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ContractDashboard;
