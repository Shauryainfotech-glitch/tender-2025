import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Download,
  Share,
  Print,
  AttachFile,
  Schedule,
  LocationOn,
  Business,
  AttachMoney,
  Assignment,
  Gavel,
  Description,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { tenderService } from '../../services/tenderService';
import { fileService } from '../../services/fileService';
import { Tender, TenderStatus, TenderDocument } from '../../types/tender';
import { DataTable, Column } from '../../components/common/DataTable';
import { DateUtil } from '../../common/utils/date.util';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const TenderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      setLoading(true);
      const [tenderData, docsData, bidsData, statsData] = await Promise.all([
        tenderService.getTenderById(parseInt(id!)),
        tenderService.getTenderDocuments(parseInt(id!)),
        tenderService.getTenderBids(parseInt(id!)),
        tenderService.getTenderStatistics(parseInt(id!)),
      ]);
      
      setTender(tenderData);
      setDocuments(docsData);
      setBids(bidsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching tender details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/tenders/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await tenderService.deleteTender(parseInt(id!));
      navigate('/tenders');
    } catch (error) {
      console.error('Error deleting tender:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await tenderService.publishTender(parseInt(id!));
      fetchTenderDetails();
    } catch (error) {
      console.error('Error publishing tender:', error);
    }
  };

  const handleClose = async () => {
    try {
      await tenderService.closeTender(parseInt(id!));
      fetchTenderDetails();
    } catch (error) {
      console.error('Error closing tender:', error);
    }
  };

  const handleDownloadDocument = async (document: TenderDocument) => {
    try {
      await fileService.downloadFile(document.id.toString(), document.fileName);
    } catch (error) {
      console.error('Error downloading document:', error);
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

  const isUserAllowedToEdit = () => {
    return user?.role === 'admin' || user?.role === 'tender_manager' || tender?.createdBy === user?.id;
  };

  const documentColumns: Column[] = [
    {
      id: 'fileName',
      label: 'File Name',
      format: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachFile sx={{ mr: 1 }} />
          {value}
        </Box>
      ),
    },
    {
      id: 'documentType',
      label: 'Type',
    },
    {
      id: 'fileSize',
      label: 'Size',
      format: (value: number) => `${(value / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      id: 'uploadedAt',
      label: 'Uploaded',
      format: (value: Date) => DateUtil.formatDateTime(value),
    },
  ];

  const bidColumns: Column[] = [
    {
      id: 'bidNumber',
      label: 'Bid Number',
    },
    {
      id: 'organization',
      label: 'Organization',
      format: (value: any) => value?.name || 'N/A',
    },
    {
      id: 'amount',
      label: 'Amount',
      format: (value: number) => `₹${(value / 100000).toFixed(2)}L`,
    },
    {
      id: 'status',
      label: 'Status',
      format: (value: string) => (
        <Chip label={value.replace('_', ' ').toUpperCase()} size="small" />
      ),
    },
    {
      id: 'submittedAt',
      label: 'Submitted',
      format: (value: Date) => value ? DateUtil.formatDateTime(value) : 'Draft',
    },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!tender) {
    return (
      <Box>
        <Alert severity="error">Tender not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/tenders')} sx={{ mt: 2 }}>
          Back to Tenders
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tenders')}
            sx={{ mb: 2 }}
          >
            Back to Tenders
          </Button>
          <Typography variant="h4" gutterBottom>
            {tender.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={tender.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(tender.status)}
            />
            <Chip label={tender.type.toUpperCase()} variant="outlined" />
            <Chip label={`Ref: ${tender.referenceNumber}`} variant="outlined" />
          </Box>
        </Box>
        
        {isUserAllowedToEdit() && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton>
                <Print />
              </IconButton>
            </Tooltip>
            <Button startIcon={<Edit />} onClick={handleEdit}>
              Edit
            </Button>
            <Button
              startIcon={<Delete />}
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Overview" />
              <Tab label="Documents" />
              <Tab label="Bids" />
              <Tab label="Terms & Conditions" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Overview Tab */}
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography paragraph>{tender.description}</Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Scope of Work
              </Typography>
              <Typography paragraph>{tender.scopeOfWork}</Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Eligibility Criteria
              </Typography>
              <Typography paragraph>{tender.eligibilityCriteria}</Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography>{tender.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography>{tender.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography>{tender.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography>{tender.currency}</Typography>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Documents Tab */}
              <DataTable
                columns={documentColumns}
                data={documents}
                title="Tender Documents"
                actions={(row) => (
                  <IconButton onClick={() => handleDownloadDocument(row)}>
                    <Download />
                  </IconButton>
                )}
                emptyMessage="No documents uploaded"
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {/* Bids Tab */}
              <DataTable
                columns={bidColumns}
                data={bids}
                title="Submitted Bids"
                onRowClick={(row) => navigate(`/bids/${row.id}`)}
                emptyMessage="No bids submitted yet"
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {/* Terms & Conditions Tab */}
              <Typography variant="h6" gutterBottom>
                Terms and Conditions
              </Typography>
              <Typography paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {tender.termsAndConditions}
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Key Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Estimated Value"
                    secondary={`₹${(tender.estimatedValue / 100000).toFixed(2)}L`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Deadline"
                    secondary={DateUtil.formatDateTime(tender.deadline)}
                  />
                </ListItem>
                {tender.openingDate && (
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Opening Date"
                      secondary={DateUtil.formatDateTime(tender.openingDate)}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Gavel />
                  </ListItemIcon>
                  <ListItemText
                    primary="EMD Amount"
                    secondary={tender.emdExempted ? 'Exempted' : `₹${tender.emdAmount}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tender Fee"
                    secondary={`₹${tender.tenderFee}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Statistics */}
          {statistics && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4">{statistics.totalBids}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bids
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4">{statistics.submittedBids}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4">
                      ₹{(statistics.averageBidAmount / 100000).toFixed(2)}L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Bid Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4">{statistics.participatingOrganizations}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Organizations
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {isUserAllowedToEdit() && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tender.status === TenderStatus.DRAFT && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={handlePublish}
                    >
                      Publish Tender
                    </Button>
                  )}
                  {tender.status === TenderStatus.ACTIVE && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<Cancel />}
                      onClick={handleClose}
                    >
                      Close Tender
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/tenders/${id}/bids`)}
                  >
                    Manage Bids
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this tender? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
