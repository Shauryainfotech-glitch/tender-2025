import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  InputAdornment,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormHelperText,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
  AttachFile as FileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createBid, updateBid, fetchBidById } from '../../store/slices/bidSlice';
import { fetchTenderById } from '../../store/slices/tenderSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { BidFormData, PriceScheduleItem } from '../../types/bid.types';

const steps = ['Basic Information', 'Price Schedule', 'Documents', 'Review & Submit'];

export const CreateBidPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tenderId, bidId } = useParams<{ tenderId?: string; bidId?: string }>();
  const { currentTender } = useAppSelector(state => state.tender);
  const { currentBid, loading: bidLoading } = useAppSelector(state => state.bid);
  const { user } = useAppSelector(state => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BidFormData>({
    tenderId: tenderId ? parseInt(tenderId) : 0,
    organizationId: user?.organizationId || 0,
    preparationTime: 1,
    validityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    priceSchedule: {
      items: [],
      currency: 'INR',
    },
    subtotal: 0,
    taxRate: 18,
    taxes: 0,
    totalAmount: 0,
    deviations: '',
    remarks: '',
    documents: [],
  });

  const isEditMode = !!bidId;

  useEffect(() => {
    if (tenderId) {
      dispatch(fetchTenderById(parseInt(tenderId)));
    }
    if (bidId) {
      dispatch(fetchBidById(parseInt(bidId)));
    }
  }, [dispatch, tenderId, bidId]);

  useEffect(() => {
    if (isEditMode && currentBid) {
      setFormData({
        ...currentBid,
        validityDate: new Date(currentBid.validityDate),
      });
    }
  }, [isEditMode, currentBid]);

  useEffect(() => {
    // Calculate totals when price schedule changes
    const subtotal = formData.priceSchedule.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    const taxes = (subtotal * formData.taxRate) / 100;
    const totalAmount = subtotal + taxes;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxes,
      totalAmount,
    }));
  }, [formData.priceSchedule.items, formData.taxRate]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.preparationTime || formData.preparationTime < 1) {
          newErrors.preparationTime = 'Preparation time must be at least 1 day';
        }
        if (!formData.validityDate) {
          newErrors.validityDate = 'Validity date is required';
        }
        break;
      case 1: // Price Schedule
        if (formData.priceSchedule.items.length === 0) {
          newErrors.priceSchedule = 'At least one price item is required';
        }
        break;
      case 2: // Documents
        // Optional validation for documents
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddPriceItem = () => {
    const newItem: PriceScheduleItem = {
      itemCode: '',
      description: '',
      quantity: 1,
      unit: 'NOS',
      unitPrice: 0,
      totalPrice: 0,
    };

    setFormData(prev => ({
      ...prev,
      priceSchedule: {
        ...prev.priceSchedule,
        items: [...prev.priceSchedule.items, newItem],
      },
    }));
  };

  const handleUpdatePriceItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.priceSchedule.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total price for the item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = 
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setFormData(prev => ({
      ...prev,
      priceSchedule: {
        ...prev.priceSchedule,
        items: updatedItems,
      },
    }));
  };

  const handleRemovePriceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priceSchedule: {
        ...prev.priceSchedule,
        items: prev.priceSchedule.items.filter((_, i) => i !== index),
      },
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle file upload logic here
      console.log('Files to upload:', files);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(activeStep)) {
      try {
        if (isEditMode) {
          await dispatch(updateBid({ id: parseInt(bidId!), data: formData }));
        } else {
          await dispatch(createBid(formData));
        }
        navigate('/bids');
      } catch (error) {
        console.error('Error saving bid:', error);
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = { ...formData, status: 'DRAFT' };
      if (isEditMode) {
        await dispatch(updateBid({ id: parseInt(bidId!), data: draftData }));
      } else {
        await dispatch(createBid(draftData));
      }
      navigate('/bids');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  if (bidLoading) return <LoadingSpinner />;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tender Information
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Tender: {currentTender?.title || 'Loading...'}
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preparation Time (Days)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value))}
                error={!!errors.preparationTime}
                helperText={errors.preparationTime}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Bid Validity Date"
                  value={formData.validityDate}
                  onChange={(newValue) => handleInputChange('validityDate', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.validityDate}
                      helperText={errors.validityDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deviations (if any)"
                multiline
                rows={3}
                value={formData.deviations}
                onChange={(e) => handleInputChange('deviations', e.target.value)}
                placeholder="Mention any deviations from tender requirements"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={3}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Additional remarks or comments"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Price Schedule
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPriceItem}
              >
                Add Item
              </Button>
            </Box>

            {errors.priceSchedule && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.priceSchedule}
              </Alert>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.priceSchedule.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.itemCode}
                          onChange={(e) => handleUpdatePriceItem(index, 'itemCode', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.description}
                          onChange={(e) => handleUpdatePriceItem(index, 'description', e.target.value)}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdatePriceItem(index, 'quantity', parseFloat(e.target.value))}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={item.unit}
                          onChange={(e) => handleUpdatePriceItem(index, 'unit', e.target.value)}
                          sx={{ width: 100 }}
                        >
                          <MenuItem value="NOS">NOS</MenuItem>
                          <MenuItem value="KG">KG</MenuItem>
                          <MenuItem value="MT">MT</MenuItem>
                          <MenuItem value="LTR">LTR</MenuItem>
                          <MenuItem value="SET">SET</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdatePriceItem(index, 'unitPrice', parseFloat(e.target.value))}
                          sx={{ width: 120 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemovePriceItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Subtotal:</Typography>
                          <Typography>{formatCurrency(formData.subtotal)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Taxes ({formData.taxRate}%):</Typography>
                          <Typography>{formatCurrency(formData.taxes)}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total Amount:</Typography>
                          <Typography variant="h6">{formatCurrency(formData.totalAmount)}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Documents
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload all required documents as per tender requirements
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Documents
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </Button>

            {formData.documents.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Documents:
                </Typography>
                {/* Display uploaded documents */}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Bid
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Basic Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Preparation Time
                        </Typography>
                        <Typography>{formData.preparationTime} days</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Validity Date
                        </Typography>
                        <Typography>
                          {formData.validityDate.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Financial Summary
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Items
                        </Typography>
                        <Typography>{formData.priceSchedule.items.length}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(formData.totalAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning">
                  Please review all information carefully before submitting. 
                  Once submitted, the bid cannot be edited.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Bid' : 'Create New Bid'}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
          </Box>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                {isEditMode ? 'Update Bid' : 'Submit Bid'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
