import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as SubmitIcon,
  Cancel as WithdrawIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  Description as DocumentIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  PictureAsPdf as PdfIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchBidById, submitBid, withdrawBid } from '../../store/slices/bidSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import { BidStatus } from '../../types/bid.types';
import { hasPermission } from '../../utils/permissions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bid-tabpanel-${index}`}
      aria-labelledby={`bid-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const BidDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBid: bid, loading, error } = useAppSelector(state => state.bid);
  const { user } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchBidById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    navigate(`/bids/${id}/edit`);
  };

  const handleSubmit = async () => {
    if (id) {
      await dispatch(submitBid(parseInt(id)));
      setSubmitDialogOpen(false);
      dispatch(fetchBidById(parseInt(id)));
    }
  };

  const handleWithdraw = async () => {
    if (id && withdrawReason) {
      await dispatch(withdrawBid({ bidId: parseInt(id), reason: withdrawReason }));
      setWithdrawDialogOpen(false);
      setWithdrawReason('');
      dispatch(fetchBidById(parseInt(id)));
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

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!bid) return <Alert severity="error">Bid not found</Alert>;

  const canEdit = bid.status === BidStatus.DRAFT && hasPermission(user, 'bid:edit');
  const canSubmit = bid.status === BidStatus.DRAFT && hasPermission(user, 'bid:submit');
  const canWithdraw = bid.status === BidStatus.SUBMITTED && hasPermission(user, 'bid:withdraw');

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/bids')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1">
              Bid Details: {bid.bidNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tender: {bid.tender?.title}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
            {canSubmit && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SubmitIcon />}
                onClick={() => setSubmitDialogOpen(true)}
              >
                Submit Bid
              </Button>
            )}
            {canWithdraw && (
              <Button
                variant="contained"
                color="error"
                startIcon={<WithdrawIcon />}
                onClick={() => setWithdrawDialogOpen(true)}
              >
                Withdraw
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => console.log('Download PDF')}
            >
              Download PDF
            </Button>
          </Stack>
        </Box>

        {/* Status and Key Info */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={bid.status}
                  color={getStatusColor(bid.status)}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {formatCurrency(bid.totalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Validity Date
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {formatDate(bid.validityDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted Date
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {bid.submittedAt ? formatDate(bid.submittedAt) : 'Not submitted'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Price Schedule" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="Documents" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="EMD Details" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Comments" icon={<CommentIcon />} iconPosition="start" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Bid Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><BusinessIcon /></ListItemIcon>
                      <ListItemText
                        primary="Organization"
                        secondary={bid.organization?.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText
                        primary="Contact Person"
                        secondary={`${bid.contactPerson?.name} (${bid.contactPerson?.email})`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText
                        primary="Preparation Time"
                        secondary={`${bid.preparationTime} days`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Technical Details
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Technical Proposal:</strong> {bid.technicalScore ? `Score: ${bid.technicalScore}` : 'Pending evaluation'}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Deviations:</strong> {bid.deviations || 'None'}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Remarks:</strong> {bid.remarks || 'No remarks'}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Price Schedule Tab */}
            <TabPanel value={activeTab} index={1}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bid.priceSchedule?.items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemCode}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>Subtotal</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(bid.subtotal || 0)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        Taxes ({bid.taxRate || 0}%)
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(bid.taxes || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>Total Amount</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(bid.totalAmount)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={activeTab} index={2}>
              <List>
                {bid.documents?.map((doc: any) => (
                  <ListItem
                    key={doc.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="download"
                        onClick={() => console.log('Download', doc.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.fileName}
                      secondary={`${doc.fileType} - ${doc.fileSize} - Uploaded ${formatDate(doc.uploadedAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
              {(!bid.documents || bid.documents.length === 0) && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No documents uploaded
                </Typography>
              )}
            </TabPanel>

            {/* EMD Details Tab */}
            <TabPanel value={activeTab} index={3}>
              {bid.emd ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      EMD Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {bid.emd.emdNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatCurrency(bid.emd.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {bid.emd.paymentMethod}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={bid.emd.status}
                      size="small"
                      color={bid.emd.status === 'VERIFIED' ? 'success' : 'default'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bank Details
                    </Typography>
                    <Typography variant="body1">
                      {bid.emd.issuingBank} - {bid.emd.instrumentNumber}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  No EMD submitted for this bid
                </Alert>
              )}
            </TabPanel>

            {/* History Tab */}
            <TabPanel value={activeTab} index={4}>
              <List>
                {bid.history?.map((event: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={event.action}
                      secondary={`${event.user} - ${formatDateTime(event.timestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            {/* Comments Tab */}
            <TabPanel value={activeTab} index={5}>
              <List>
                {bid.comments?.map((comment: any) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemText
                      primary={comment.user}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {comment.text}
                          </Typography>
                          {formatDateTime(comment.createdAt)}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                variant="outlined"
              />
              <Button variant="contained" sx={{ mt: 2 }}>
                Add Comment
              </Button>
            </TabPanel>
          </Box>
        </Card>

        {/* Submit Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit Bid</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Once submitted, you cannot edit this bid. Please ensure all information is correct.
            </Alert>
            <Typography variant="body2">
              Are you sure you want to submit this bid?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Submit Bid
            </Button>
          </DialogActions>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog
          open={withdrawDialogOpen}
          onClose={() => setWithdrawDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Withdraw Bid</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone. Your EMD may be forfeited.
            </Alert>
            <TextField
              label="Reason for Withdrawal"
              fullWidth
              multiline
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              required
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
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
