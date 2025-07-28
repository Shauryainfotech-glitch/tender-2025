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
  Alert,
  CircularProgress,
  Link,
  Divider,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface MFAVerificationProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  userId: string;
  mfaMethod: 'totp' | 'sms' | 'email';
  tempToken: string;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  open,
  onClose,
  onSuccess,
  userId,
  mfaMethod,
  tempToken,
}) => {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Auto-focus on code input when dialog opens
    if (open) {
      setCode('');
      setBackupCode('');
      setError('');
      setAttempts(0);
    }
  }, [open]);

  const handleVerify = async () => {
    const verificationCode = useBackupCode ? backupCode : code;
    
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyMFA({
        userId,
        code: verificationCode,
        method: useBackupCode ? 'backup' : mfaMethod,
        tempToken,
      });

      onSuccess(response.data.token);
    } catch (err: any) {
      setAttempts(attempts + 1);
      
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else if (attempts >= 2) {
        setError('Invalid code. One more attempt before account lockout.');
      } else {
        setError(err.response?.data?.message || 'Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (mfaMethod === 'totp') {
      setError('Please use your authenticator app to generate a new code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mfaMethod === 'sms') {
        await authService.resendMFASMS(userId);
      } else if (mfaMethod === 'email') {
        await authService.resendMFAEmail(userId);
      }
      
      setResendTimer(60); // 60 second cooldown
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = () => {
    switch (mfaMethod) {
      case 'totp':
        return <PhoneIcon />;
      case 'sms':
        return <PhoneIcon />;
      case 'email':
        return <EmailIcon />;
      default:
        return <SecurityIcon />;
    }
  };

  const getMethodText = () => {
    switch (mfaMethod) {
      case 'totp':
        return 'Enter the 6-digit code from your authenticator app';
      case 'sms':
        return 'Enter the 6-digit code sent to your phone';
      case 'email':
        return 'Enter the 6-digit code sent to your email';
      default:
        return 'Enter your verification code';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getMethodIcon()}
          <Typography variant="h6">Two-Factor Authentication</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {!useBackupCode ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {getMethodText()}
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              sx={{ mt: 3, mb: 2 }}
              autoFocus
              onKeyPress={handleKeyPress}
              inputProps={{
                maxLength: 6,
                style: { 
                  fontSize: 28, 
                  letterSpacing: 10, 
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }
              }}
              InputProps={{
                endAdornment: code.length === 6 && (
                  <InputAdornment position="end">
                    <SecurityIcon color="success" />
                  </InputAdornment>
                ),
              }}
            />

            {mfaMethod !== 'totp' && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleResend}
                  disabled={loading || resendTimer > 0}
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s` 
                    : 'Resend code'
                  }
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Having trouble?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setUseBackupCode(true)}
                underline="hover"
              >
                Use a backup code instead
              </Link>
            </Box>
          </Box>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Backup codes can only be used once. Make sure to generate new ones after using.
            </Alert>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter one of your backup codes
            </Typography>
            
            <TextField
              fullWidth
              label="Backup Code"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="XXXXXXXX"
              sx={{ mt: 2, mb: 2 }}
              autoFocus
              onKeyPress={handleKeyPress}
              inputProps={{
                style: { 
                  fontSize: 20, 
                  letterSpacing: 4, 
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }
              }}
            />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => setUseBackupCode(false)}
              >
                Back to verification code
              </Button>
            </Box>
          </Box>
        )}

        {attempts >= 3 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Too many failed attempts. Your account may be locked for security reasons.
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading || (!useBackupCode ? code.length !== 6 : backupCode.length < 6)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MFAVerification;
