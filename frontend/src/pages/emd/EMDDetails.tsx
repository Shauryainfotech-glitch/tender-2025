import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as FileIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  MoneyOff as RefundIcon,
  Extension as ExtendIcon,
  Block as ForfeitIcon,
  Description as DocumentIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
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
      id={`emd-detail-tabpanel-${index}`}
      aria-labelledby={`emd-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EMDDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [openExtendDialog, setOpenExtendDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [extensionDays, setExtensionDays] = useState('30');

  // Mock EMD data - replace with actual data fetch
  const [emd] = useState({
    id: '1',
    emdNumber: 'EMD-2024-001',
    tender: {
      number: 'TND-2024-101',
      title: 'Supply of IT Equipment',
      department: 'Information Technology',
    },
    vendor: {
      name: 'ABC Corporation',
      email: 'contact@abccorp.com',
      phone: '+91 9876543210',
      gstin: '29ABCDE1234F1Z5',
    },
    amount: 50000,
    currency: 'INR',
    status: 'active',
    purpose: 'tender_participation',
    submittedDate: new Date('2024-01-15'),
    validityPeriod: 90,
    expiryDate: new Date('2024-04-15'),
    bank: {
      name: 'State Bank of India',
      branch: 'Main Branch, Mumbai',
      guaranteeNumber: 'BG-12345',
      issueDate: new Date('2024-01-14'),
      beneficiaryName: 'Government Department',
      beneficiaryAccount: '1234567890',
      ifscCode: 'SBIN0001234',
    },
    documents: [
      {
        id: '1',
        name: 'Bank Guarantee Document.pdf',
        type: 'application/pdf',
        size: 1024000,
        uploadDate: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Letter from Bank.pdf',
        type: 'application/pdf',
        size: 512000,
        uploadDate: new Date('2024-01-15'),
      },
      {
        id: '3',
        name: 'Authorization Letter.pdf',
        type: 'application/pdf',
        size: 256000,
        uploadDate: new Date('2024-01-15'),
      },
    ],
    history: [
      {
        action: 'EMD Submitted',
        date: new Date('2024-01-15T10:30:00'),
        user: 'vendor@abccorp.com',
        details: 'EMD submitted with bank guarantee',
      },
      {
        action: 'Document Verified',
        date: new Date('2024-01-16T14:00:00'),
        user: 'admin@gov.in',
        details: 'All documents verified and approved',
      },
      {
        action: 'Status Updated',
        date: new Date('2024-01-16T14:30:00'),
        user: 'system',
        details: 'EMD status changed to Active',
      },
    ],
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefund = () => {
    setOpenRefundDialog(true);
  };

  const handleExtend = () => {
    setOpenExtendDialog(true);
  };

  const handleForfeit = () => {
    // Handle forfeit logic
    console.log('Forfeit EMD');
  };

  const processRefund = () => {
    console.log('Processing refund:', refundReason);
    setOpenRefundDialog(false);
    // Add refund logic here
  };

  const processExtension = () => {
    console.log('Extending validity by:', extensionDays);
    setOpenExtendDialog(false);
    // Add extension logic here
  };

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      active: 'success',
      expired: 'error',
      refunded: 'info',
      pending_refund: 'warning',
      forfeited: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckIcon />;
      case 'expired':
        return <CancelIcon />;
      case 'refunded':
        return <RefundIcon />;
      case 'pending_refund':
        return <ScheduleIcon />;
      case 'forfeited':
        return <ForfeitIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/emd')} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                {emd.emdNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tender: {emd.tender.number} - {emd.tender.title}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              icon={getStatusIcon(emd.status)}
              label={emd.status.toUpperCase()}
              color={getStatusColor(emd.status)}
              sx={{ mr: 2 }}
            />
            <Tooltip title="Download">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Action Buttons */}
        {emd.status === 'active' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<RefundIcon />}
              onClick={handleRefund}
            >
              Process Refund
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExtendIcon />}
              onClick={handleExtend}
            >
              Extend Validity
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ForfeitIcon />}
              onClick={handleForfeit}
            >
              Forfeit EMD
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Documents" />
            <Tab label="History" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
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
                        primary="EMD Amount"
                        secondary={`${emd.currency} ${emd.amount.toLocaleString()}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Purpose"
                        secondary={emd.purpose.replace('_', ' ').toUpperCase()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Submitted Date"
                        secondary={format(emd.submittedDate, 'dd/MM/yyyy')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Validity Period"
                        secondary={`${emd.validityPeriod} days`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Expiry Date"
                        secondary={format(emd.expiryDate, 'dd/MM/yyyy')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Vendor Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vendor Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Vendor Name"
                        secondary={emd.vendor.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={emd.vendor.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={emd.vendor.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="GSTIN"
                        secondary={emd.vendor.gstin}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bank Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Bank Name"
                            secondary={emd.bank.name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Branch"
                            secondary={emd.bank.branch}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Guarantee Number"
                            secondary={emd.bank.guaranteeNumber}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Issue Date"
                            secondary={format(emd.bank.issueDate, 'dd/MM/yyyy')}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Beneficiary Name"
                            secondary={emd.bank.beneficiaryName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Account Number"
                            secondary={emd.bank.beneficiaryAccount}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="IFSC Code"
                            secondary={emd.bank.ifscCode}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {emd.documents.map((doc) => (
              <Grid item xs={12} md={6} key={doc.id}>
                <Card>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <DocumentIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{doc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded on {format(doc.uploadDate, 'dd/MM/yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton color="primary">
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Timeline>
            {emd.history.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < emd.history.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{item.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(item.date, 'dd/MM/yyyy HH:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.details}
                      </Typography>
                      <Typography variant="caption">
                        By: {item.user}
                      </Typography>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>
      </Paper>

      {/* Refund Dialog */}
      <Dialog open={openRefundDialog} onClose={() => setOpenRefundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process EMD Refund</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Processing refund for EMD amount: {emd.currency} {emd.amount.toLocaleString()}
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Refund"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRefundDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={processRefund} disabled={!refundReason}>
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={openExtendDialog} onClose={() => setOpenExtendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Extend EMD Validity</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Current expiry date: {format(emd.expiryDate, 'dd/MM/yyyy')}
          </Alert>
          <TextField
            fullWidth
            type="number"
            label="Extension Period (Days)"
            value={extensionDays}
            onChange={(e) => setExtensionDays(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExtendDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={processExtension} disabled={!extensionDays || parseInt(extensionDays) <= 0}>
            Extend Validity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EMDDetails;
