import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AttachFile as AttachFileIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const steps = ['Basic Information', 'Bank Details', 'Documents', 'Review & Submit'];

const validationSchema = Yup.object({
  tenderNumber: Yup.string().required('Tender number is required'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  currency: Yup.string().required('Currency is required'),
  validityPeriod: Yup.number()
    .required('Validity period is required')
    .positive('Validity period must be positive'),
  bankName: Yup.string().required('Bank name is required'),
  branchName: Yup.string().required('Branch name is required'),
  guaranteeNumber: Yup.string().required('Bank guarantee number is required'),
  issueDate: Yup.date().required('Issue date is required'),
  expiryDate: Yup.date()
    .required('Expiry date is required')
    .min(Yup.ref('issueDate'), 'Expiry date must be after issue date'),
});

const EMDSubmission: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock tender data - replace with actual data fetch
  const [tenders] = useState([
    { id: '1', number: 'TND-2024-101', title: 'Supply of IT Equipment' },
    { id: '2', number: 'TND-2024-102', title: 'Construction of Office Building' },
    { id: '3', number: 'TND-2024-103', title: 'Annual Maintenance Contract' },
  ]);

  const formik = useFormik({
    initialValues: {
      tenderNumber: '',
      amount: '',
      currency: 'INR',
      validityPeriod: 90,
      purpose: 'tender_participation',
      bankName: '',
      branchName: '',
      branchAddress: '',
      guaranteeNumber: '',
      issueDate: null,
      expiryDate: null,
      beneficiaryName: '',
      beneficiaryAccount: '',
      ifscCode: '',
      swiftCode: '',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Submit EMD logic here
        console.log('Submitting EMD:', values);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        navigate('/emd');
      } catch (error) {
        console.error('Error submitting EMD:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      formik.handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={tenders}
                getOptionLabel={(option) => `${option.number} - ${option.title}`}
                value={tenders.find((t) => t.number === formik.values.tenderNumber) || null}
                onChange={(_, value) => {
                  formik.setFieldValue('tenderNumber', value?.number || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Tender"
                    required
                    error={formik.touched.tenderNumber && Boolean(formik.errors.tenderNumber)}
                    helperText={formik.touched.tenderNumber && formik.errors.tenderNumber}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="EMD Amount"
                name="amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  label="Currency"
                >
                  <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Validity Period (Days)"
                name="validityPeriod"
                type="number"
                value={formik.values.validityPeriod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.validityPeriod && Boolean(formik.errors.validityPeriod)}
                helperText={formik.touched.validityPeriod && formik.errors.validityPeriod}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Purpose</InputLabel>
                <Select
                  name="purpose"
                  value={formik.values.purpose}
                  onChange={formik.handleChange}
                  label="Purpose"
                >
                  <MenuItem value="tender_participation">Tender Participation</MenuItem>
                  <MenuItem value="performance_security">Performance Security</MenuItem>
                  <MenuItem value="advance_payment">Advance Payment</MenuItem>
                  <MenuItem value="retention_money">Retention Money</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                multiline
                rows={3}
                value={formik.values.remarks}
                onChange={formik.handleChange}
                placeholder="Any additional information..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formik.values.bankName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                helperText={formik.touched.bankName && formik.errors.bankName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Name"
                name="branchName"
                value={formik.values.branchName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                helperText={formik.touched.branchName && formik.errors.branchName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Branch Address"
                name="branchAddress"
                multiline
                rows={2}
                value={formik.values.branchAddress}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Guarantee Number"
                name="guaranteeNumber"
                value={formik.values.guaranteeNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.guaranteeNumber && Boolean(formik.errors.guaranteeNumber)}
                helperText={formik.touched.guaranteeNumber && formik.errors.guaranteeNumber}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date"
                  value={formik.values.issueDate}
                  onChange={(value) => formik.setFieldValue('issueDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
                      helperText={formik.touched.issueDate && formik.errors.issueDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={formik.values.expiryDate}
                  onChange={(value) => formik.setFieldValue('expiryDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                      helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Beneficiary Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Beneficiary Name"
                name="beneficiaryName"
                value={formik.values.beneficiaryName}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Beneficiary Account Number"
                name="beneficiaryAccount"
                value={formik.values.beneficiaryAccount}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifscCode"
                value={formik.values.ifscCode}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SWIFT Code"
                name="swiftCode"
                value={formik.values.swiftCode}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please upload the following documents:
                <ul>
                  <li>Bank Guarantee Document</li>
                  <li>Letter from Bank</li>
                  <li>Proof of Payment (if applicable)</li>
                  <li>Authorization Letter</li>
                </ul>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Click to upload documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </Typography>
              </Box>
            </Grid>
            {uploadedFiles.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Uploaded Documents
                </Typography>
                {uploadedFiles.map((file, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body1">{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        color="error"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Please review the information before submitting
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tender Number
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.tenderNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        EMD Amount
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.currency} {formik.values.amount}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Validity Period
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.validityPeriod} days
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Purpose
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.purpose.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bank Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bank Name
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.bankName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Branch Name
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.branchName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Guarantee Number
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.guaranteeNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Validity Period
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.issueDate && formik.values.expiryDate && 
                          `${new Date(formik.values.issueDate).toLocaleDateString()} - ${new Date(formik.values.expiryDate).toLocaleDateString()}`
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents
                  </Typography>
                  {uploadedFiles.length === 0 ? (
                    <Typography color="text.secondary">No documents uploaded</Typography>
                  ) : (
                    <Box>
                      {uploadedFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          icon={<AttachFileIcon />}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/emd')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Submit EMD
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !formik.isValid}
                  startIcon={isSubmitting ? null : <SendIcon />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit EMD'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EMDSubmission;
