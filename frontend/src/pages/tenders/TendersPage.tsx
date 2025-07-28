import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Badge,
  Skeleton,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  Schedule,
  AttachMoney,
  Business,
  LocationOn,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { tenderService } from '../../services/tenderService';
import { Tender, TenderStatus, TenderType } from '../../types/tender';
import { DateUtil } from '../../common/utils/date.util';

export const TendersPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenderStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TenderType | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, [page, statusFilter, typeFilter]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await tenderService.getTenders({
        page,
        limit: 12,
        search: searchQuery,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setTenders(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTenders();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tender?')) {
      try {
        await tenderService.deleteTender(id);
        fetchTenders();
      } catch (error) {
        console.error('Error deleting tender:', error);
      }
    }
  };

  const getStatusColor = (status: TenderStatus) => {
    const statusColors: Record<TenderStatus, any> = {
      [TenderStatus.DRAFT]: 'default',
      [TenderStatus.PUBLISHED]: 'info',
      [TenderStatus.ACTIVE]: 'success',
      [TenderStatus.CLOSED]: 'warning',
      [TenderStatus.CANCELLED]: 'error',
      [TenderStatus.AWARDED]: 'primary',
    };
    return statusColors[status] || 'default';
  };

  const getTypeLabel = (type: TenderType) => {
    const typeLabels: Record<TenderType, string> = {
      [TenderType.OPEN]: 'Open Tender',
      [TenderType.LIMITED]: 'Limited Tender',
      [TenderType.SINGLE]: 'Single Source',
      [TenderType.EOI]: 'Expression of Interest',
      [TenderType.RFQ]: 'Request for Quotation',
      [TenderType.RFP]: 'Request for Proposal',
    };
    return typeLabels[type] || type;
  };

  const isUserAllowedToEdit = (tender: Tender) => {
    return user?.role === 'admin' || user?.role === 'tender_manager' || tender.createdBy === user?.id;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Tenders</Typography>
        {(user?.role === 'admin' || user?.role === 'tender_manager') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tenders/create')}
          >
            Create Tender
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as TenderStatus | '')}
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(TenderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value as TenderType | '')}
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(TenderType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tenders Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={20} sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={20} width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : tenders.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No tenders found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search criteria
              </Typography>
            </Paper>
          </Grid>
        ) : (
          tenders.map((tender) => (
            <Grid item xs={12} md={6} lg={4} key={tender.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={tender.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(tender.status)}
                      size="small"
                    />
                    <Chip
                      label={getTypeLabel(tender.type)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {tender.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ref: {tender.referenceNumber}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }} noWrap>
                    {tender.description}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        ₹{(tender.estimatedValue / 100000).toFixed(2)}L
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {tender.organization?.name || tender.department}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {tender.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Deadline: {DateUtil.formatDate(tender.deadline)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {tender.bids && (
                      <Badge badgeContent={tender.bids.length} color="primary">
                        <Typography variant="body2" color="text.secondary">
                          Bids
                        </Typography>
                      </Badge>
                    )}
                  </Box>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tenders/${tender.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {isUserAllowedToEdit(tender) && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tenders/${tender.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(tender.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};
