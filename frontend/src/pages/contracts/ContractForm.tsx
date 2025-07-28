import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  DatePicker,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Description as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

interface Deliverable {
  id?: string;
  name: string;
  description: string;
  dueDate: Date | null;
  amount: number;
}

interface PaymentTerm {
  id?: string;
  description: string;
  percentage: number;
  dueDate: Date | null;
  milestone: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
}

const ContractForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [deliverableDialogOpen, setDeliverableDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentTerm | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    contractNumber: isEditMode ? 'CTR-2024-001' : '',
    title: '',
    description: '',
    tenderId: '',
    vendorId: '',
    type: 'service',
    
    // Contract Terms
    startDate: null as Date | null,
    endDate: null as Date | null,
    value: 0,
    currency: 'INR',
    paymentTermsText: '',
    performanceGuaranteeRequired: false,
    performanceGuaranteeType: 'bank_guarantee',
    performanceGuaranteeAmount: 0,
    performanceGuaranteeValidity: null as Date | null,
    
    // Deliverables & Milestones
    deliverables: [] as Deliverable[],
    
    // Payment Schedule
    paymentTerms: [] as PaymentTerm[],
    
    // Documents
    documents: [] as Document[],
    
    // Terms & Conditions
    specialTerms: '',
    penalties: '',
    disputeResolution: 'arbitration',
    governingLaw: 'Indian Contract Act',
    confidentialityRequired: true,
    intellectualPropertyTerms: '',
  });

  // Mock data for dropdowns
  const tenders = [
    { id: 'TND-2024-101', title: 'IT Infrastructure for New Branch' },
    { id: 'TND-2024-102', title: 'Annual Maintenance Contract' },
    { id: 'TND-2024-103', title: 'Software Development Project' },
  ];

  const vendors = [
    { id: 'VND-001', name: 'ABC Corporation', email: 'contact@abc.com' },
    { id: 'VND-002', name: 'XYZ Industries', email: 'info@xyz.com' },
    { id: 'VND-003', name: 'Tech Solutions Ltd', email: 'sales@techsol.com' },
  ];

  const contractTypes = [
    { value: 'service', label: 'Service Contract' },
    { value: 'supply', label: 'Supply Contract' },
    { value: 'works', label: 'Works Contract' },
    { value: 'consultancy', label: 'Consultancy Contract' },
  ];

  const steps = [
    'Basic Information',
    'Contract Terms',
    'Deliverables & Milestones',
    'Payment Schedule',
    'Documents',
    'Terms & Conditions',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Submitting contract:', formData);
    navigate('/contracts');
  };

  const handleAddDeliverable = () => {
    setEditingDeliverable(null);
    setDeliverableDialogOpen(true);
  };

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable);
    setDeliverableDialogOpen(true);
  };

  const handleSaveDeliverable = (deliverable: Deliverable) => {
    if (editingDeliverable) {
      // Update existing deliverable
      setFormData({
        ...formData,
        deliverables: formData.deliverables.map((d) =>
          d.id === editingDeliverable.id ? deliverable : d
        ),
      });
    } else {
      // Add new deliverable
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, { ...deliverable, id: Date.now().toString() }],
      });
    }
    setDeliverableDialogOpen(false);
  };

  const handleDeleteDeliverable = (id: string | undefined) => {
    if (id) {
      setFormData({
        ...formData,
        deliverables: formData.deliverables.filter((d) => d.id !== id),
      });
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: PaymentTerm) => {
    setEditingPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleSavePayment = (payment: PaymentTerm) => {
    if (editingPayment) {
      // Update existing payment
      setFormData({
        ...formData,
        paymentTerms: formData.paymentTerms.map((p) =>
          p.id === editingPayment.id ? payment : p
        ),
      });
    } else {
      // Add new payment
      setFormData({
        ...formData,
        paymentTerms: [...formData.paymentTerms, { ...payment, id: Date.now().toString() }],
      });
    }
    setPaymentDialogOpen(false);
  };

  const handleDeletePayment = (id: string | undefined) => {
    if (id) {
      setFormData({
        ...formData,
        paymentTerms: formData.paymentTerms.filter((p) => p.id !== id),
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date(),
      }));
      setFormData({
        ...formData,
        documents: [...formData.documents, ...newDocuments],
      });
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                {isEditMode ? 'Update the contract details below' : 'Fill in the basic contract information'}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Number"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                disabled={isEditMode}
                helperText={!isEditMode ? "Leave blank for auto-generation" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Contract Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {contractTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contract Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={tenders}
                getOptionLabel={(option) => `${option.id} - ${option.title}`}
                value={tenders.find((t) => t.id === formData.tenderId) || null}
                onChange={(_, value) => setFormData({ ...formData, tenderId: value?.id || '' })}
                renderInput={(params) => (
                  <TextField {...params} label="Related Tender" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={vendors}
                getOptionLabel={(option) => option.name}
                value={vendors.find((v) => v.id === formData.vendorId) || null}
                onChange={(_, value) => setFormData({ ...formData, vendorId: value?.id || '' })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vendor"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1: // Contract Terms
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MuiDatePicker
                  label="Contract Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params: any) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MuiDatePicker
                  label="Contract End Date"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params: any) => <TextField {...params} fullWidth required />}
                  minDate={formData.startDate || undefined}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contract Value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    label="Currency"
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <MenuItem value="INR">INR (₹)</MenuItem>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Terms"
                  multiline
                  rows={3}
                  value={formData.paymentTermsText}
                  onChange={(e) => setFormData({ ...formData, paymentTermsText: e.target.value })}
                  placeholder="e.g., 30% advance, 50% on delivery, 20% after acceptance"
                />
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Performance Guarantee
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.performanceGuaranteeRequired}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  performanceGuaranteeRequired: e.target.checked,
                                })
                              }
                            />
                          }
                          label="Performance Guarantee Required"
                        />
                      </Grid>
                      {formData.performanceGuaranteeRequired && (
                        <>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel>Guarantee Type</InputLabel>
                              <Select
                                value={formData.performanceGuaranteeType}
                                label="Guarantee Type"
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    performanceGuaranteeType: e.target.value,
                                  })
                                }
                              >
                                <MenuItem value="bank_guarantee">Bank Guarantee</MenuItem>
                                <MenuItem value="insurance_bond">Insurance Bond</MenuItem>
                                <MenuItem value="security_deposit">Security Deposit</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Guarantee Amount"
                              type="number"
                              value={formData.performanceGuaranteeAmount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  performanceGuaranteeAmount: parseFloat(e.target.value),
                                })
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <MuiDatePicker
                              label="Valid Until"
                              value={formData.performanceGuaranteeValidity}
                              onChange={(date) =>
                                setFormData({
                                  ...formData,
                                  performanceGuaranteeValidity: date,
                                })
                              }
                              renderInput={(params: any) => <TextField {...params} fullWidth />}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2: // Deliverables & Milestones
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Deliverables & Milestones
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddDeliverable}
                >
                  Add Deliverable
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {formData.deliverables.length === 0 ? (
                <Alert severity="info">
                  No deliverables added yet. Click "Add Deliverable" to create one.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.deliverables.map((deliverable) => (
                        <TableRow key={deliverable.id}>
                          <TableCell>{deliverable.name}</TableCell>
                          <TableCell>{deliverable.description}</TableCell>
                          <TableCell>
                            {deliverable.dueDate
                              ? format(deliverable.dueDate, 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            ₹{deliverable.amount.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditDeliverable(deliverable)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDeliverable(deliverable.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Total Deliverables Value: ₹
                {formData.deliverables
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()}
              </Alert>
            </Grid>
          </Grid>
        );

      case 3: // Payment Schedule
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Payment Schedule
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddPayment}
                >
                  Add Payment Term
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {formData.paymentTerms.length === 0 ? (
                <Alert severity="info">
                  No payment terms added yet. Click "Add Payment Term" to create one.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Milestone</TableCell>
                        <TableCell align="center">Percentage</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.paymentTerms.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>{payment.milestone}</TableCell>
                          <TableCell align="center">{payment.percentage}%</TableCell>
                          <TableCell>
                            {payment.dueDate
                              ? format(payment.dueDate, 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            ₹
                            {(
                              (formData.value * payment.percentage) /
                              100
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPayment(payment)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
            <Grid item xs={12}>
              <Alert
                severity={
                  formData.paymentTerms.reduce((sum, p) => sum + p.percentage, 0) === 100
                    ? 'success'
                    : 'warning'
                }
              >
                Total Payment Percentage:{' '}
                {formData.paymentTerms.reduce((sum, p) => sum + p.percentage, 0)}%
                {formData.paymentTerms.reduce((sum, p) => sum + p.percentage, 0) !== 100 &&
                  ' (Should equal 100%)'}
              </Alert>
            </Grid>
          </Grid>
        );

      case 4: // Documents
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Contract Documents
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {formData.documents.length === 0 ? (
                <Alert severity="info">
                  No documents uploaded yet. Click "Upload Documents" to add files.
                </Alert>
              ) : (
                <List>
                  {formData.documents.map((doc) => (
                    <React.Fragment key={doc.id}>
                      <ListItem>
                        <DocumentIcon sx={{ mr: 2 }} />
                        <ListItemText
                          primary={doc.name}
                          secondary={`${doc.type} • ${doc.size} • Uploaded on ${format(
                            doc.uploadDate,
                            'dd MMM yyyy'
                          )}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                documents: formData.documents.filter((d) => d.id !== doc.id),
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                Required documents: Contract Agreement, Technical Specifications, Bank Guarantee (if applicable)
              </Alert>
            </Grid>
          </Grid>
        );

      case 5: // Terms & Conditions
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Terms & Conditions"
                multiline
                rows={4}
                value={formData.specialTerms}
                onChange={(e) => setFormData({ ...formData, specialTerms: e.target.value })}
                helperText="Add any special terms specific to this contract"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Penalties & Liquidated Damages"
                multiline
                rows={3}
                value={formData.penalties}
                onChange={(e) => setFormData({ ...formData, penalties: e.target.value })}
                helperText="Define penalties for delays or non-performance"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dispute Resolution</InputLabel>
                <Select
                  value={formData.disputeResolution}
                  label="Dispute Resolution"
                  onChange={(e) => setFormData({ ...formData, disputeResolution: e.target.value })}
                >
                  <MenuItem value="arbitration">Arbitration</MenuItem>
                  <MenuItem value="mediation">Mediation</MenuItem>
                  <MenuItem value="litigation">Litigation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Governing Law</InputLabel>
                <Select
                  value={formData.governingLaw}
                  label="Governing Law"
                  onChange={(e) => setFormData({ ...formData, governingLaw: e.target.value })}
                >
                  <MenuItem value="Indian Contract Act">Indian Contract Act</MenuItem>
                  <MenuItem value="Common Law">Common Law</MenuItem>
                  <MenuItem value="International Law">International Law</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.confidentialityRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, confidentialityRequired: e.target.checked })
                    }
                  />
                }
                label="Include Confidentiality Clause"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Intellectual Property Terms"
                multiline
                rows={3}
                value={formData.intellectualPropertyTerms}
                onChange={(e) =>
                  setFormData({ ...formData, intellectualPropertyTerms: e.target.value })
                }
                helperText="Define ownership and usage rights for any intellectual property"
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
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
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Contract' : 'Create New Contract'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {getStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/contracts')}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
            >
              {isEditMode ? 'Update Contract' : 'Create Contract'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Deliverable Dialog */}
      <Dialog
        open={deliverableDialogOpen}
        onClose={() => setDeliverableDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDeliverable ? 'Edit Deliverable' : 'Add Deliverable'}
        </DialogTitle>
        <DialogContent>
          <DeliverableForm
            deliverable={editingDeliverable}
            onSave={handleSaveDeliverable}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Term Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPayment ? 'Edit Payment Term' : 'Add Payment Term'}
        </DialogTitle>
        <DialogContent>
          <PaymentTermForm
            paymentTerm={editingPayment}
            onSave={handleSavePayment}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Deliverable Form Component
const DeliverableForm: React.FC<{
  deliverable: Deliverable | null;
  onSave: (deliverable: Deliverable) => void;
}> = ({ deliverable, onSave }) => {
  const [formData, setFormData] = useState<Deliverable>(
    deliverable || {
      name: '',
      description: '',
      dueDate: null,
      amount: 0,
    }
  );

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Deliverable Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MuiDatePicker
            label="Due Date"
            value={formData.dueDate}
            onChange={(date) => setFormData({ ...formData, dueDate: date })}
            renderInput={(params: any) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => onSave(deliverable || formData)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

// Payment Term Form Component
const PaymentTermForm: React.FC<{
  paymentTerm: PaymentTerm | null;
  onSave: (paymentTerm: PaymentTerm) => void;
}> = ({ paymentTerm, onSave }) => {
  const [formData, setFormData] = useState<PaymentTerm>(
    paymentTerm || {
      description: '',
      percentage: 0,
      dueDate: null,
      milestone: '',
    }
  );

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Payment Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Linked Milestone"
            value={formData.milestone}
            onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Percentage"
            type="number"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MuiDatePicker
            label="Due Date"
            value={formData.dueDate}
            onChange={(date) => setFormData({ ...formData, dueDate: date })}
            renderInput={(params: any) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => onSave(paymentTerm || formData)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ContractForm;
