import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Mock data - replace with actual data source
  const vendors = [
    {
      id: '1',
      name: 'ABC Corporation',
      email: 'contact@abccorp.com',
      phone: '+91 9876543210',
      status: 'verified',
      rating: 4.5,
      contracts: 45,
      totalValue: '₹1,250,000',
      lastActive: new Date('2025-07-20'),
    },
    {
      id: '2',
      name: 'XYZ Industries',
      email: 'info@xyzind.com',
      phone: '+91 8989898989',
      status: 'active',
      rating: 4.3,
      contracts: 32,
      totalValue: '₹980,000',
      lastActive: new Date('2025-07-18'),
    },
    {
      id: '3',
      name: 'Global Services',
      email: 'support@globalservices.com',
      phone: '+91 9797979797',
      status: 'blocked',
      rating: 3.8,
      contracts: 28,
      totalValue: '₹750,000',
      lastActive: new Date('2025-07-15'),
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Vendor Name',
      width: 200,
      renderCell: (params) => 
        (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AccountCircleIcon />
            </Avatar>
            <Typography>{params.value}</Typography>
          </Box>
        ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusColors: any = {
          verified: 'success',
          active: 'default',
          blocked: 'error',
        };
        const statusLabels: any = {
          verified: 'Verified',
          active: 'Active',
          blocked: 'Blocked',
        };
        return (
          <Chip
            icon={params.value === 'verified' ? <VerifiedUserIcon /> : params.value === 'blocked' ? <BlockIcon /> : <CheckCircleIcon />}
            label={statusLabels[params.value]}
            color={statusColors[params.value]}
            size="small"
          />
        );
      },
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />
          <Typography>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'contracts',
      headerName: 'Contracts',
      width: 120,
    },
    {
      field: 'totalValue',
      headerName: 'Total Value',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, vendor: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedVendor(null);
  };

  const handleMenuAction = (action: string) => {
    handleCloseMenu();
    console.log(action, selectedVendor);
    switch (action) {
      case 'view':
        navigate(`/vendor/${selectedVendor.id}`);
        break;
      case 'block':
        // Block vendor logic
        break;
      case 'approve':
        // Approve vendor logic
        break;
      case 'delete':
        // Delete vendor logic
        break;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Vendor Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vendor/create')}
          >
            Add Vendor
          </Button>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All Vendors" />
          <Tab label="Verified" />
          <Tab label="Active" />
          <Tab label="Blocked" />
        </Tabs>

        <TextField
          placeholder="Search vendors..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper>
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={vendors.filter((vendor) =>
              activeTab === 0
                ? true
                : vendor.status ===
                  (activeTab === 1
                    ? 'verified'
                    : activeTab === 2
                    ? 'active'
                    : 'blocked')
                  && (
                    vendor.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    vendor.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    vendor.phone.includes(searchText)
                  )
            )}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 30]}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          View Profile
        </MenuItem>
        {selectedVendor?.status === 'active' &&
          <MenuItem onClick={() => handleMenuAction('block')}>
            Block Vendor
          </MenuItem>}
        {selectedVendor?.status === 'blocked' &&
          <MenuItem onClick={() => handleMenuAction('approve')}>
            Approve Vendor
          </MenuItem>}
        <MenuItem onClick={() => handleMenuAction('delete')}>
          Delete Vendor
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VendorDashboard;

