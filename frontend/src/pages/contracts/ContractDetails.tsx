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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AttachFile as AttachFileIcon,
  Description as DocumentIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Gavel as GavelIcon,
  Visibility as VisibilityIcon,
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
      id={`contract-detail-tabpanel-${index}`}
      aria-labelledby={`contract-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContractDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');

  // Mock contract data
  const contract = {
    id: '1',
    contractNumber: 'CTR-2024-001',
    title: 'IT Infrastructure Setup',
    description: 'Complete IT infrastructure setup including servers, networking equipment, and software licenses for the new office branch.',
    vendor: {
      id: '101',
      name: 'ABC Corporation',
      contact: 'John Doe',
      email: 'john@abccorp.com',
      phone: '+91 98765 43210',
    },
    tender: {
      id: 'TND-2024-101',
      title: 'IT Infrastructure for New Branch',
    },
    value: 5000000,
    currency: 'INR',
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    signedDate: new Date('2024-01-10'),
    paymentTerms: '30% advance, 50% on delivery, 20% after acceptance',
    performanceGuarantee: {
      type: 'Bank Guarantee',
      amount: 500000,
      validity: new Date('2025-03-31'),
    },
    deliverables: [
      { id: 1, name: 'Server Setup', dueDate: new Date('2024-03-31'), status: 'completed' },
      { id: 2, name: 'Network Infrastructure', dueDate: new Date('2024-06-30'), status: 'completed' },
      { id: 3, name: 'Software Installation', dueDate: new Date('2024-09-30'), status: 'in-progress' },
      { id: 4, name: 'Security Configuration', dueDate: new Date('2024-10-31'), status: 'pending' },
      { id: 5, name: 'Final Handover', dueDate: new Date('2024-12-31'), status: 'pending' },
    ],
    payments: [
      { id: 1, amount: 1500000, description: 'Advance Payment', date: new Date('2024-01-20'), status: 'completed' },
      { id: 2, amount: 1000000, description: 'First Milestone', date: new Date('2024-04-15'), status: 'completed' },
      { id: 3, amount: 1500000, description: 'Second Milestone', date: new Date('2024-07-15'), status: 'pending' },
      { id: 4, amount: 1000000, description: 'Final Payment', date: new Date('2025-01-15'), status: 'pending' },
    ],
    documents: [
      { id: 1, name: 'Contract Agreement', type: 'PDF', size: '2.5 MB', uploadDate: new Date('2024-01-10') },
      { id: 2, name: 'Technical Specifications', type: 'PDF', size: '1.8 MB', uploadDate: new Date('2024-01-10') },
      { id: 3, name: 'Bank Guarantee', type: 'PDF', size: '500 KB', uploadDate: new Date('2024-01-15') },
      { id: 4, name: 'Progress Report Q1', type: 'PDF', size: '1.2 MB', uploadDate: new Date('2024-04-01') },
    ],
    timeline: [
      { date: new Date('2024-01-10'), event: 'Contract Signed', type: 'success' },
      { date: new Date('2024-01-15'), event: 'Contract Started', type: 'info' },
      { date: new Date('2024-01-20'), event: 'Advance Payment Received', type: 'success' },
      { date: new Date('2024-03-31'), event: 'Server Setup Completed', type: 'success' },
      { date: new Date('2024-04-15'), event: 'First Milestone Payment', type: 'success' },
      { date: new Date('2024-06-30'), event: 'Network Infrastructure Completed', type: 'success' },
      { date: new Date('2024-09-01'), event: 'Software Installation Started', type: 'info' },
    ],
  };

  const completionPercentage = Math.round(
    (contract.deliverables.filter(d => d.status === 'completed').length / contract.deliverables.length) * 100
  );

  const paidAmount = contract.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTerminate = () => {
    // Handle contract termination
    console.log('Terminating contract with reason:', terminationReason);
    setTerminateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'draft': return 'default';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'default';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/contracts')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1">
              Contract Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contract.contractNumber}
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<PrintIcon />} sx={{ mr: 1 }}>
              Print
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/contracts/${id}/edit`)}>
              Edit
            </Button>
          </Box>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5">{contract.title}</Typography>
                  <Chip 
                    label={contract.status.toUpperCase()} 
                    color={getStatusColor(contract.status)}
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {contract.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Contract Value</Typography>
                    <Typography variant="h6">
                      {contract.currency} {contract.value.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="h6">
                      {format(contract.startDate, 'dd MMM yyyy')} - {format(contract.endDate, 'dd MMM yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Completion</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={completionPercentage} 
                        sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">{completionPercentage}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                    <Typography variant="h6">
                      ₹{paidAmount.toLocaleString()} / ₹{contract.value.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Vendor Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={contract.vendor.name}
                      secondary="Company Name"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={contract.vendor.contact}
                      secondary="Contact Person"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={contract.vendor.email}
                      secondary="Email"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={contract.vendor.phone}
                      secondary="Phone"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Deliverables" />
          <Tab label="Payments" />
          <Tab label="Documents" />
          <Tab label="Timeline" />
          <Tab label="Terms & Conditions" />
        </Tabs>

        {/* Deliverables Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Deliverable</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contract.deliverables.map((deliverable) => (
                  <TableRow key={deliverable.id}>
                    <TableCell>{deliverable.name}</TableCell>
                    <TableCell>{format(deliverable.dueDate, 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={deliverable.status.replace('-', ' ').toUpperCase()}
                        color={getDeliverableStatusColor(deliverable.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contract.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(payment.date, 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status.toUpperCase()}
                        color={payment.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <Button size="small" variant="outlined" startIcon={<PaymentIcon />}>
                          Record Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Payment Terms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contract.paymentTerms}
            </Typography>
          </Box>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AttachFileIcon />}>
              Upload Document
            </Button>
          </Box>
          <List>
            {contract.documents.map((doc) => (
              <ListItem key={doc.id}>
                <ListItemAvatar>
                  <Avatar>
                    <DocumentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={doc.name}
                  secondary={`${doc.type} • ${doc.size} • Uploaded on ${format(doc.uploadDate, 'dd MMM yyyy')}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="download">
                    <DownloadIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={tabValue} index={3}>
          <Timeline>
            {contract.timeline.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent>
                  <Typography color="text.secondary">
                    {format(event.date, 'dd MMM yyyy')}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={event.type === 'success' ? 'success' : 'primary'}>
                    {event.type === 'success' ? <CheckCircleIcon /> : <ScheduleIcon />}
                  </TimelineDot>
                  {index < contract.timeline.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography>{event.event}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>

        {/* Terms & Conditions Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Performance Guarantee: {contract.performanceGuarantee.type} of ₹{contract.performanceGuarantee.amount.toLocaleString()} valid until {format(contract.performanceGuarantee.validity, 'dd MMM yyyy')}
            </Alert>
            <Typography variant="h6" gutterBottom>
              Key Terms
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Tender Reference"
                  secondary={contract.tender.title}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Contract Period"
                  secondary={`${format(contract.startDate, 'dd MMM yyyy')} to ${format(contract.endDate, 'dd MMM yyyy')}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Signed Date"
                  secondary={format(contract.signedDate, 'dd MMM yyyy')}
                />
              </ListItem>
            </List>
            {contract.status === 'active' && (
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<WarningIcon />}
                  onClick={() => setTerminateDialogOpen(true)}
                >
                  Terminate Contract
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Terminate Dialog */}
      <Dialog open={terminateDialogOpen} onClose={() => setTerminateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Terminate Contract</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The contract will be permanently terminated.
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Termination"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleTerminate} 
            color="error" 
            variant="contained"
            disabled={!terminationReason.trim()}
          >
            Terminate Contract
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractDetails;
