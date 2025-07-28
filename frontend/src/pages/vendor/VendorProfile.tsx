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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Rating,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as VerifiedUserIcon,
  Star as StarIcon,
  AttachFile as FileIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
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
      id={`vendor-tabpanel-${index}`}
      aria-labelledby={`vendor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VendorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Mock vendor data - replace with actual data
  const vendor = {
    id: '1',
    name: 'ABC Corporation',
    email: 'contact@abccorp.com',
    phone: '+91 9876543210',
    website: 'www.abccorp.com',
    status: 'verified',
    verificationDate: new Date('2024-01-15'),
    registrationDate: new Date('2023-12-01'),
    rating: 4.5,
    address: {
      street: '123 Business Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    businessInfo: {
      type: 'Private Limited',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      incorporationDate: new Date('2010-05-15'),
      annualTurnover: '₹10 Crores',
      employees: '50-100',
    },
    bankDetails: {
      accountName: 'ABC Corporation',
      accountNumber: '****1234',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0001234',
    },
    categories: ['IT Services', 'Software Development', 'Consulting'],
    certifications: [
      { name: 'ISO 9001:2015', validTill: new Date('2025-12-31') },
      { name: 'ISO 27001:2013', validTill: new Date('2025-06-30') },
      { name: 'CMMI Level 3', validTill: new Date('2026-03-31') },
    ],
    documents: [
      { id: '1', name: 'GST Certificate', type: 'pdf', uploadDate: new Date('2024-01-10') },
      { id: '2', name: 'PAN Card', type: 'pdf', uploadDate: new Date('2024-01-10') },
      { id: '3', name: 'Company Registration', type: 'pdf', uploadDate: new Date('2024-01-10') },
      { id: '4', name: 'ISO Certificates', type: 'pdf', uploadDate: new Date('2024-01-15') },
    ],
    performance: {
      totalContracts: 45,
      completedContracts: 42,
      activeContracts: 3,
      avgDeliveryTime: 95,
      qualityScore: 4.5,
      complianceScore: 4.8,
    },
    contracts: [
      { id: '1', title: 'IT Infrastructure Setup', value: '₹5,00,000', status: 'completed', date: new Date('2024-06-15') },
      { id: '2', title: 'Software Development Project', value: '₹8,00,000', status: 'active', date: new Date('2024-11-01') },
      { id: '3', title: 'Annual Maintenance Contract', value: '₹2,00,000', status: 'active', date: new Date('2024-12-01') },
    ],
    timeline: [
      { event: 'Vendor Registered', date: new Date('2023-12-01'), type: 'registration' },
      { event: 'Documents Submitted', date: new Date('2024-01-10'), type: 'document' },
      { event: 'Verification Completed', date: new Date('2024-01-15'), type: 'verification' },
      { event: 'First Contract Awarded', date: new Date('2024-02-01'), type: 'contract' },
      { event: 'ISO Certification Updated', date: new Date('2024-06-15'), type: 'update' },
    ],
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBlockVendor = () => {
    console.log('Blocking vendor:', blockReason);
    setOpenBlockDialog(false);
    // Add block logic here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'active':
        return 'info';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <VerifiedUserIcon />;
      case 'active':
        return <CheckCircleIcon />;
      case 'blocked':
        return <BlockIcon />;
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
            <IconButton onClick={() => navigate('/vendors')} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {vendor.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  icon={getStatusIcon(vendor.status)}
                  label={vendor.status.toUpperCase()}
                  color={getStatusColor(vendor.status)}
                  size="small"
                />
                <Rating value={vendor.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({vendor.rating})
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ mr: 1 }}>
              Edit Profile
            </Button>
            {vendor.status !== 'blocked' ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => setOpenBlockDialog(true)}
              >
                Block Vendor
              </Button>
            ) : (
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                Unblock Vendor
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Documents" />
            <Tab label="Contracts" />
            <Tab label="Performance" />
            <Tab label="Timeline" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary="Email" secondary={vendor.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary="Phone" secondary={vendor.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText primary="Website" secondary={vendor.website} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={`${vendor.address.street}, ${vendor.address.city}, ${vendor.address.state} - ${vendor.address.pincode}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Business Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Business Type" secondary={vendor.businessInfo.type} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="GSTIN" secondary={vendor.businessInfo.gstin} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="PAN" secondary={vendor.businessInfo.pan} />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Incorporation Date"
                        secondary={format(vendor.businessInfo.incorporationDate, 'dd/MM/yyyy')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Annual Turnover" secondary={vendor.businessInfo.annualTurnover} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Employees" secondary={vendor.businessInfo.employees} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Categories & Certifications */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Categories & Certifications
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Business Categories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {vendor.categories.map((category, index) => (
                        <Chip key={index} label={category} />
                      ))}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Certifications
                    </Typography>
                    <Grid container spacing={2}>
                      {vendor.certifications.map((cert, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="body1" gutterBottom>
                              {cert.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Valid till: {format(cert.validTill, 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Documents</Typography>
                <Button variant="outlined" startIcon={<FileIcon />}>
                  Upload Document
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendor.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DocumentIcon sx={{ mr: 1 }} />
                            {doc.name}
                          </Box>
                        </TableCell>
                        <TableCell>{doc.type.toUpperCase()}</TableCell>
                        <TableCell>{format(doc.uploadDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <DownloadIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Contracts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contracts History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract Title</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendor.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.title}</TableCell>
                        <TableCell>{contract.value}</TableCell>
                        <TableCell>
                          <Chip
                            label={contract.status.toUpperCase()}
                            color={contract.status === 'completed' ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{format(contract.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Button size="small">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contract Performance
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Contracts</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {vendor.performance.totalContracts}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Completed</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {vendor.performance.completedContracts}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Active</Typography>
                      <Typography variant="body2" fontWeight="bold" color="info.main">
                        {vendor.performance.activeContracts}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Completion Rate
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(vendor.performance.completedContracts / vendor.performance.totalContracts) * 100}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Average Delivery Time</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={vendor.performance.avgDeliveryTime}
                          sx={{ width: 100, mr: 1 }}
                        />
                        <Typography variant="body2">{vendor.performance.avgDeliveryTime}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Quality Score</Typography>
                      <Rating value={vendor.performance.qualityScore} readOnly size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Compliance Score</Typography>
                      <Rating value={vendor.performance.complianceScore} readOnly size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Timeline
              </Typography>
              <Timeline>
                {vendor.timeline.map((item, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot
                        color={
                          item.type === 'registration'
                            ? 'primary'
                            : item.type === 'verification'
                            ? 'success'
                            : item.type === 'contract'
                            ? 'info'
                            : 'grey'
                        }
                      />
                      {index < vendor.timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1">{item.event}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(item.date, 'dd/MM/yyyy')}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Block Vendor Dialog */}
      <Dialog open={openBlockDialog} onClose={() => setOpenBlockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Block Vendor</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Blocking this vendor will prevent them from participating in any tenders.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Blocking"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleBlockVendor} disabled={!blockReason}>
            Block Vendor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorProfile;
