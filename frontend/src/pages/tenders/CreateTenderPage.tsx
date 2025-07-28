import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Publish,
  AttachFile,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { tenderService } from '../../services/tenderService';
import { fileService } from '../../services/fileService';
import { CreateTenderDto, TenderType, UpdateTenderDto } from '../../types/tender';

const steps = ['Basic Information', 'Details & Requirements', 'Financial Information', 'Documents'];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(10, 'Title must be at least 10 characters'),
  description: Yup.string().required('Description is required').min(50, 'Description must be at least 50 characters'),
  category: Yup.string().required('Category is required'),
  type: Yup.string().required('Type is required'),
  estimatedValue: Yup.number().required('Estimated value is required').min(0, 'Value must be positive'),
  currency: Yup.string().required('Currency is required'),
  deadline: Yup.date().required('Deadline is required').min(new Date(), 'Deadline must be in the future'),
  department: Yup.string().required('Department is required'),
  location: Yup.string().required('Location is required'),
  eligibilityCriteria: Yup.string().required('Eligibility criteria is required'),
  scopeOfWork: Yup.string().required('Scope of work is required'),
  termsAndConditions: Yup.string().required('Terms and conditions are required'),
  emdAmount: Yup.number().when('emdExempted', {
    is: false,
    then: Yup.number().required('EMD amount is required').min(0, 'EMD must be positive'),
  }),
  tenderFee: Yup.number().required('Tender fee is required').min(0, 'Fee must be positive'),
});

const categories = [
  'IT & Software',
  'Construction',
  'Consultancy',
  'Supply & Services',
  'Maintenance',
  'Transportation',
  'Healthcare',
  'Education',
  'Other',
];

const currencies = ['INR', 'USD', 'EUR', 'GBP'];

export const CreateTenderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchTenderDetails();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      setLoading(true);
      const tender = await tenderService.getTenderById(parseInt(id!));
      formik.setValues({
        title: tender.title,
        description: tender.description,
        category: tender.category,
        type: tender.type,
        estimatedValue: tender.estimatedValue,
        currency: tender.currency,
        deadline: new Date(tender.deadline),
        openingDate: tender.openingDate ? new Date(tender.openingDate) : null,
        department: tender.department,
        location: tender.location,
        eligibilityCriteria: tender.eligibilityCriteria,
        scopeOfWork: tender.scopeOfWork,
        termsAndConditions: tender.termsAndConditions,
        emdAmount: tender.emdAmount,
        emdExempted: tender.emdExempted,
        tenderFee: tender.tenderFee,
      });
      
      const documents = await tenderService.getTenderDocuments(parseInt(id!));
      setExistingDocuments(documents);
    } catch (error) {
      console.error('Error fetching tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      type: TenderType.OPEN,
      estimatedValue: 0,
      currency: 'INR',
      deadline: null as Date | null,
      openingDate: null as Date | null,
      department: '',
      location: '',
      eligibilityCriteria: '',
      scopeOfWork: '',
      termsAndConditions: '',
      emdAmount: 0,
      emdExempted: false,
      tenderFee: 0,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let tenderId: number;
        
        if (isEditMode) {
          await tenderService.updateTender(parseInt(id!), values as UpdateTenderDto);
          tenderId = parseInt(id!);
        } else {
          const response = await tenderService.createTender(values as CreateTenderDto);
          tenderId = response.id;
        }

        // Upload documents
        for (const file of uploadedFiles) {
          await tenderService.uploadTenderDocument(tenderId, file, 'tender_document');
        }

        navigate(`/tenders/${tenderId}`);
      } catch (error) {
        console.error('Error saving tender:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleNext = () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const errors = fieldsToValidate.filter(field => formik.errors[field as keyof typeof formik.errors]);
    
    if (errors.length === 0) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      fieldsToValidate.forEach(field => {
        formik.setFieldTouched(field, true);
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['title', 'description', 'category', 'type'];
      case 1:
        return ['department', 'location', 'eligibilityCriteria', 'scopeOfWork', 'termsAndConditions'];
      case 2:
        return ['estimatedValue', 'currency', 'deadline', 'emdAmount', 'tenderFee'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tender Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tender Type"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              >
                {Object.values(TenderType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Eligibility Criteria"
                name="eligibilityCriteria"
                value={formik.values.eligibilityCriteria}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.eligibilityCriteria && Boolean(formik.errors.eligibilityCriteria)}
                helperText={formik.touched.eligibilityCriteria && formik.errors.eligibilityCriteria}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Scope of Work"
                name="scopeOfWork"
                value={formik.values.scopeOfWork}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.scopeOfWork && Boolean(formik.errors.scopeOfWork)}
                helperText={formik.touched.scopeOfWork && formik.errors.scopeOfWork}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Terms and Conditions"
                name="termsAndConditions"
                value={formik.values.termsAndConditions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.termsAndConditions && Boolean(formik.errors.termsAndConditions)}
                helperText={formik.touched.termsAndConditions && formik.errors.termsAndConditions}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Value"
                name="estimatedValue"
                value={formik.values.estimatedValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.estimatedValue && Boolean(formik.errors.estimatedValue)}
                helperText={formik.touched.estimatedValue && formik.errors.estimatedValue}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Currency"
                name="currency"
                value={formik.values.currency}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currency && Boolean(formik.errors.currency)}
                helperText={formik.touched.currency && formik.errors.currency}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Submission Deadline"
                  value={formik.values.deadline}
                  onChange={(value) => formik.setFieldValue('deadline', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.deadline && Boolean(formik.errors.deadline)}
                      helperText={formik.touched.deadline && formik.errors.deadline}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Opening Date (Optional)"
                  value={formik.values.openingDate}
                  onChange={(value) => formik.setFieldValue('openingDate', value)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.emdExempted}
                    onChange={(e) => formik.setFieldValue('emdExempted', e.target.checked)}
                    name="emdExempted"
                  />
                }
                label="EMD Exempted"
              />
            </Grid>
            {!formik.values.emdExempted && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="EMD Amount"
                  name="emdAmount"
                  value={formik.values.emdAmount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.emdAmount && Boolean(formik.errors.emdAmount)}
                  helperText={formik.touched.emdAmount && formik.errors.emdAmount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Tender Fee"
                name="tenderFee"
                value={formik.values.tenderFee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tenderFee && Boolean(formik.errors.tenderFee)}
                helperText={formik.touched.tenderFee && formik.errors.tenderFee}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload tender documents, specifications, drawings, etc.
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Upload Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </Button>

            {existingDocuments.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Existing Documents
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {existingDocuments.map((doc) => (
                    <Chip
                      key={doc.id}
                      label={doc.fileName}
                      icon={<AttachFile />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}

            {uploadedFiles.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  New Documents
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {uploadedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      icon={<AttachFile />}
                      onDelete={() => handleRemoveFile(index)}
                      color="primary"
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tenders')}
          sx={{ mb: 2 }}
        >
          Back to Tenders
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Tender' : 'Create New Tender'}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Publish />}
                    onClick={() => {
                      formik.setFieldValue('publish', true);
                      formik.handleSubmit();
                    }}
                    disabled={formik.isSubmitting}
                  >
                    {isEditMode ? 'Update & Publish' : 'Create & Publish'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
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
