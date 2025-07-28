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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as SubmitIcon,
  Cancel as WithdrawIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchBids, withdrawBid } from '../../store/slices/bidSlice';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/format';
import { BidStatus } from '../../types/bid.types';
import { hasPermission } from '../../utils/permissions';

export const BidsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { bids, loading, error } = useAppSelector(state => state.bid);
  const { user } = useAppSelector(state => state.auth);
  
  const [filters, setFilters] = useState({
    status: '',
    tenderId: '',
    search: '',
  });
  
  const [selectedBids, setSelectedBids] = useState<number[]>([]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  useEffect(() => {
    dispatch(fetchBids({
      page: 1,
      limit: 10,
      ...filters,
    }));
  }, [dispatch, filters]);

  const handleCreateBid = () => {
    navigate('/bids/create');
  };

  const handleViewBid = (bidId: number) => {
    navigate(`/bids/${bidId}`);
  };

  const handleEditBid = (bidId: number) => {
    navigate(`/bids/${bidId}/edit`);
  };

  const handleWithdrawBid = (bidId: number) => {
    setSelectedBidId(bidId);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdraw = async () => {
    if (selectedBidId && withdrawReason) {
      await dispatch(withdrawBid({ 
        bidId: selectedBidId, 
        reason: withdrawReason 
      }));
      setWithdrawDialogOpen(false);
      setSelectedBidId(null);
      setWithdrawReason('');
      // Refresh bids
      dispatch(fetchBids({
        page: 1,
        limit: 10,
        ...filters,
      }));
    }
  };

  const getStatusColor = (status: BidStatus) => {
    const statusColors: Record<BidStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
      [BidStatus.DRAFT]: 'default',
      [BidStatus.SUBMITTED]: 'info',
      [BidStatus.UNDER_EVALUATION]: 'warning',
      [BidStatus.SHORTLISTED]: 'success',
      [BidStatus.REJECTED]: 'error',
      [BidStatus.WITHDRAWN]: 'error',
      [BidStatus.AWARDED]: 'success',
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      key: 'bidNumber',
      label: 'Bid Number',
      sortable: true,
    },
    {
      key: 'tenderTitle',
      label: 'Tender',
      sortable: true,
      render: (row: any) => (
        <Tooltip title={row.tender?.title || ''}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {row.tender?.title || 'N/A'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Bid Amount',
      sortable: true,
      render: (row: any) => formatCurrency(row.totalAmount),
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
      key: 'submittedAt',
      label: 'Submitted Date',
      sortable: true,
      render: (row: any) => row.submittedAt ? formatDate(row.submittedAt) : 'Not submitted',
    },
    {
      key: 'validityDate',
      label: 'Valid Until',
      sortable: true,
      render: (row: any) => formatDate(row.validityDate),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => handleViewBid(row.id)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {row.status === BidStatus.DRAFT && hasPermission(user, 'bid:edit') && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditBid(row.id)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {row.status === BidStatus.DRAFT && hasPermission(user, 'bid:submit') && (
            <Tooltip title="Submit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => console.log('Submit bid', row.id)}
              >
                <SubmitIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {row.status === BidStatus.SUBMITTED && hasPermission(user, 'bid:withdraw') && (
            <Tooltip title="Withdraw">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleWithdrawBid(row.id)}
              >
                <WithdrawIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Download PDF">
            <IconButton
              size="small"
              onClick={() => console.log('Download PDF', row.id)}
            >
              <PdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading && !bids.data.length) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Bids
          </Typography>
          {hasPermission(user, 'bid:create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBid}
            >
              Create New Bid
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                sx={{ minWidth: 300 }}
                placeholder="Search by bid number, tender title..."
              />
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(BidStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <DataTable
              columns={columns}
              data={bids.data}
              total={bids.total}
              page={bids.page}
              rowsPerPage={bids.limit}
              loading={loading}
              selectable={hasPermission(user, 'bid:bulk-actions')}
              selectedRows={selectedBids}
              onSelectionChange={setSelectedBids}
              onPageChange={(page) => dispatch(fetchBids({ 
                ...filters, 
                page, 
                limit: bids.limit 
              }))}
              onRowsPerPageChange={(limit) => dispatch(fetchBids({ 
                ...filters, 
                page: 1, 
                limit 
              }))}
              onSort={(field, order) => dispatch(fetchBids({ 
                ...filters, 
                sortBy: field, 
                sortOrder: order,
                page: 1,
                limit: bids.limit,
              }))}
            />
          </Box>
        </Card>

        {/* Withdraw Dialog */}
        <Dialog
          open={withdrawDialogOpen}
          onClose={() => setWithdrawDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Withdraw Bid</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to withdraw this bid? This action cannot be undone.
            </Alert>
            <TextField
              label="Reason for Withdrawal"
              fullWidth
              multiline
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmWithdraw}
              variant="contained"
              color="error"
              disabled={!withdrawReason}
            >
              Withdraw Bid
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};
