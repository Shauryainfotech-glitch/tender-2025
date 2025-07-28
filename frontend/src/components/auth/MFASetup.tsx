import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  Grid,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Smartphone as SmartphoneIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { authService } from '../../services/authService';

interface MFASetupProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const MFASetup: React.FC<MFASetupProps> = ({
  open,
  onClose,
  onComplete,
  userId,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // TOTP State
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  
  // SMS State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  
  // Email State
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (open && tabValue === 0 && activeStep === 0) {
      generateTOTPSecret();
    }
  }, [open, tabValue]);

  const generateTOTPSecret = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.generateMFASecret(userId);
      const { secret, qrCode, backupCodes } = response.data;
      
      setSecretKey(secret);
      setBackupCodes(backupCodes);
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrCode);
      setQrCodeUrl(qrDataUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate MFA secret');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyMFASetup(userId, {
        method: 'totp',
        code: verificationCode,
        secret: secretKey,
      });
      
      setSuccess('TOTP authentication enabled successfully!');
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const sendSMSCode = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.sendMFASMS(userId, phoneNumber);
      setSmsSent(true);
      setSuccess('SMS code sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyMFASetup(userId, {
        method: 'sms',
        code: smsCode,
        phoneNumber,
      });
      
      setSuccess('SMS authentication enabled successfully!');
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailCode = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.sendMFAEmail(userId);
      setEmailSent(true);
      setSuccess('Email code sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!emailCode || emailCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyMFASetup(userId, {
        method: 'email',
        code: emailCode,
      });
      
      setSuccess('Email authentication enabled successfully!');
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('Backup codes downloaded!');
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Setup Two-Factor Authentication</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setActiveStep(0);
            setError('');
            setSuccess('');
          }}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab
            label="Authenticator App"
            icon={<SmartphoneIcon />}
            iconPosition="start"
          />
          <Tab
            label="SMS"
            icon={<SmartphoneIcon />}
            iconPosition="start"
          />
          <Tab
            label="Email"
            icon={<EmailIcon />}
            iconPosition="start"
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Authenticator App Setup */}
        <TabPanel value={tabValue} index={0}>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Scan QR Code</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : qrCodeUrl ? (
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <img
                      src={qrCodeUrl}
                      alt="MFA QR Code"
                      style={{ maxWidth: 256, border: '1px solid #e0e0e0' }}
                    />
                    
                    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Can't scan? Enter this key manually:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                        >
                          {secretKey}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(secretKey)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={generateTOTPSecret}
                  >
                    Generate QR Code
                  </Button>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!qrCodeUrl}
                  >
                    Continue
                  </Button>
                </Box>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Verify Code</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Enter the 6-digit code from your authenticator app
                </Typography>
                
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  sx={{ mt: 2, mb: 2 }}
                  inputProps={{
                    maxLength: 6,
                    style: { fontSize: 24, letterSpacing: 8, textAlign: 'center' }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={verifyTOTP}
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Save Backup Codes</StepLabel>
              <StepContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </Alert>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Backup Codes</Typography>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={downloadBackupCodes}
                    >
                      Download
                    </Button>
                  </Box>
                  
                  <Grid container spacing={1}>
                    {backupCodes.map((code, index) => (
                      <Grid item xs={6} key={index}>
                        <Chip
                          label={code}
                          variant="outlined"
                          size="small"
                          sx={{ fontFamily: 'monospace', width: '100%' }}
                          onClick={() => copyToClipboard(code)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={onComplete}
                  >
                    Complete Setup
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </TabPanel>

        {/* SMS Setup */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your phone number to receive authentication codes via SMS
            </Typography>
            
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              sx={{ mt: 2, mb: 2 }}
              disabled={smsSent}
            />
            
            {!smsSent ? (
              <Button
                variant="contained"
                onClick={sendSMSCode}
                disabled={loading || !phoneNumber}
                fullWidth
              >
                {loading ? <CircularProgress size={20} /> : 'Send Code'}
              </Button>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  sx={{ mb: 2 }}
                  inputProps={{
                    maxLength: 6,
                    style: { fontSize: 24, letterSpacing: 8, textAlign: 'center' }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSmsSent(false);
                      setSmsCode('');
                    }}
                  >
                    Change Number
                  </Button>
                  <Button
                    variant="contained"
                    onClick={verifySMS}
                    disabled={loading || smsCode.length !== 6}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Email Setup */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              We'll send authentication codes to your registered email address
            </Typography>
            
            {!emailSent ? (
              <Button
                variant="contained"
                onClick={sendEmailCode}
                disabled={loading}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Send Code to Email'}
              </Button>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  sx={{ mt: 2, mb: 2 }}
                  inputProps={{
                    maxLength: 6,
                    style: { fontSize: 24, letterSpacing: 8, textAlign: 'center' }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      sendEmailCode();
                    }}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    variant="contained"
                    onClick={verifyEmail}
                    disabled={loading || emailCode.length !== 6}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MFASetup;
