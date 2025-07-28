import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Avatar,
  Grid,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  VerifiedUser as VerifiedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchOrganizations } from '../../store/slices/organizationSlice';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/format';
import { OrganizationType, OrganizationStatus } from '../../types/organization.types';
import { hasPermission } from '../../utils/permissions';

export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organizations, loading, error } = useAppSelector(state => state.organization);
  const { user } = useAppSelector(state => state.auth);
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    isVerified: '',
  });
  
  const [selectedOrganizations, setSelectedOrganizations] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchOrganizations({
      page: 1,
      limit: 10,
      ...filters,
    }));
  }, [dispatch, filters]);

  const handleCreateOrganization = () => {
    navigate('/organizations/create');
  };

  const handleViewOrganization = (orgId: number) => {
    navigate(`/organizations/${orgId}`);
  };

  const handleEditOrganization = (orgId: number) => {
    navigate(`/organizations/${orgId}/edit`);
  };

  const handleDeleteOrganization = (orgId: number) => {
    setSelectedOrgId(orgId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedOrgId) {
      // Delete organization logic
      console.log('Delete organization:', selectedOrgId);
      setDeleteDialogOpen(false);
      setSelectedOrgId(null);
    }
  };

  const getStatusColor = (status: OrganizationStatus) => {
    const statusColors: Record<OrganizationStatus, 'success' | 'error' | 'warning' | 'default'> = {
      [OrganizationStatus.ACTIVE]: 'success',
      [OrganizationStatus.INACTIVE]: 'error',
      [OrganizationStatus.SUSPENDED]: 'warning',
      [OrganizationStatus.PENDING_VERIFICATION]: 'default',
    };
    return statusColors[status] || 'default';
  };

  const getTypeIcon = (type: OrganizationType) => {
    // Return appropriate icon based on organization type
    return <BusinessIcon />;
  };

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      sortable: true,
      render: (row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.registrationNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row: any) => (
        <Chip
          label={row.type}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: any) => (
        <Chip
          label={row.status}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
    },
    {
      key: 'isVerified',
      label: 'Verification',
      sortable: true,
      render: (row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {row.isVerified ? (
            <>
              <VerifiedIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main">
                Verified
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not Verified
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      render: (row: any) => (
        <Box>
          <Typography variant="body2">
            {row.contactPerson?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.contactPerson?.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (row: any) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => handleViewOrganization(row.id)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {hasPermission(user, 'organization:edit') && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditOrganization(row.id)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {hasPermission(user, 'organization:delete') && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteOrganization(row.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const renderGridView = () => (
    <Grid container spacing={3}>
      {organizations.data.map((org: any) => (
        <Grid item xs={12} sm={6} md={4} key={org.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {org.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {org.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {org.registrationNumber}
                  </Typography>
                </Box>
                {org.isVerified && (
                  <Tooltip title="Verified">
                    <VerifiedIcon color="success" />
                  </Tooltip>
                )}
              </Box>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Type:
                  </Typography>
                  <Chip label={org.type} size="small" variant="outlined" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    label={org.status}
                    size="small"
                    color={getStatusColor(org.status)}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Contact:
                  </Typography>
                  <Typography variant="body2">
                    {org.contactPerson?.name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {org.contactPerson?.email}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            
            <CardActions>
              <Button size="small" onClick={() => handleViewOrganization(org.id)}>
                View
              </Button>
              {hasPermission(user, 'organization:edit') && (
                <Button size="small" onClick={() => handleEditOrganization(org.id)}>
                  Edit
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading && !organizations.data.length) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Organizations
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </Button>
            {hasPermission(user, 'organization:create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateOrganization}
              >
                Add Organization
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                sx={{ minWidth: 300 }}
                placeholder="Search by name, registration number..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(OrganizationType).map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(OrganizationStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Verification</InputLabel>
                <Select
                  value={filters.isVerified}
                  label="Verification"
                  onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Verified</MenuItem>
                  <MenuItem value="false">Not Verified</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Card>

        {viewMode === 'table' ? (
          <Card>
            <DataTable
              columns={columns}
              data={organizations.data}
              total={organizations.total}
              page={organizations.page}
              rowsPerPage={organizations.limit}
              loading={loading}
              selectable={hasPermission(user, 'organization:bulk-actions')}
              selectedRows={selectedOrganizations}
              onSelectionChange={setSelectedOrganizations}
              onPageChange={(page) => dispatch(fetchOrganizations({ 
                ...filters, 
                page, 
                limit: organizations.limit 
              }))}
              onRowsPerPageChange={(limit) => dispatch(fetchOrganizations({ 
                ...filters, 
                page: 1, 
                limit 
              }))}
              onSort={(field, order) => dispatch(fetchOrganizations({ 
                ...filters, 
                sortBy: field, 
                sortOrder: order,
                page: 1,
                limit: organizations.limit,
              }))}
            />
          </Card>
        ) : (
          renderGridView()
        )}

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Organization</DialogTitle>
          <DialogContent>
            <Alert severity="warning">
              Are you sure you want to delete this organization? This action cannot be undone.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};
