import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Password as PasswordIcon,
  Timer as TimerIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialCharsSet: string;
  preventCommonPasswords: boolean;
  preventUserInfo: boolean;
  preventRepeatingChars: number;
  preventSequentialChars: number;
  passwordHistory: number;
  expirationDays: number;
  expirationWarningDays: number;
  minPasswordAge: number;
  accountLockoutThreshold: number;
  accountLockoutDuration: number;
  resetTokenExpiration: number;
  requireMFAForReset: boolean;
  allowPasswordHints: boolean;
  enforcePasswordStrength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

const defaultPolicy: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialCharsSet: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  preventCommonPasswords: true,
  preventUserInfo: true,
  preventRepeatingChars: 3,
  preventSequentialChars: 3,
  passwordHistory: 5,
  expirationDays: 90,
  expirationWarningDays: 14,
  minPasswordAge: 1,
  accountLockoutThreshold: 5,
  accountLockoutDuration: 30,
  resetTokenExpiration: 60,
  requireMFAForReset: false,
  allowPasswordHints: false,
  enforcePasswordStrength: 'strong',
};

const PasswordPolicies: React.FC = () => {
  const [policy, setPolicy] = useState<PasswordPolicy>(defaultPolicy);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    setLoading(true);
    try {
      const response = await authService.getPasswordPolicy();
      setPolicy(response.data);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load password policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    setError('');

    try {
      await authService.updatePasswordPolicy(policy);
      setSuccess('Password policy updated successfully!');
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password policy');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setPolicy(defaultPolicy);
      setHasChanges(true);
    }
  };

  const updatePolicy = (field: keyof PasswordPolicy, value: any) => {
    setPolicy({ ...policy, [field]: value });
    setHasChanges(true);
  };

  const testPasswordAgainstPolicy = () => {
    if (!testPassword) {
      setTestResult({ valid: false, errors: ['Please enter a password to test'] });
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let strength = 0;

    // Length checks
    if (testPassword.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (testPassword.length > policy.maxLength) {
      errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(testPassword)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(testPassword)) {
      strength++;
    }

    if (policy.requireLowercase && !/[a-z]/.test(testPassword)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(testPassword)) {
      strength++;
    }

    if (policy.requireNumbers && !/\d/.test(testPassword)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(testPassword)) {
      strength++;
    }

    if (policy.requireSpecialChars) {
      const specialCharsRegex = new RegExp(`[${policy.specialCharsSet.replace(/[\[\]\\]/g, '\\$&')}]`);
      if (!specialCharsRegex.test(testPassword)) {
        errors.push('Password must contain at least one special character');
      } else {
        strength++;
      }
    }

    // Repeating characters
    if (policy.preventRepeatingChars > 0) {
      const repeatingRegex = new RegExp(`(.)\\1{${policy.preventRepeatingChars - 1},}`);
      if (repeatingRegex.test(testPassword)) {
        errors.push(`Password must not contain ${policy.preventRepeatingChars} or more repeating characters`);
      }
    }

    // Sequential characters
    if (policy.preventSequentialChars > 0) {
      for (let i = 0; i <= testPassword.length - policy.preventSequentialChars; i++) {
        const substring = testPassword.substring(i, i + policy.preventSequentialChars);
        let isSequential = true;
        for (let j = 1; j < substring.length; j++) {
          if (substring.charCodeAt(j) !== substring.charCodeAt(j - 1) + 1) {
            isSequential = false;
            break;
          }
        }
        if (isSequential) {
          errors.push(`Password must not contain ${policy.preventSequentialChars} or more sequential characters`);
          break;
        }
      }
    }

    // Length bonus
    if (testPassword.length >= 12) strength++;
    if (testPassword.length >= 16) strength++;

    // Common patterns warnings
    if (/^[A-Z][a-z]+\d+$/.test(testPassword)) {
      warnings.push('Password follows a common pattern (Capital + lowercase + numbers)');
    }

    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthLevel = strengthLevels[Math.min(strength, strengthLevels.length - 1)];

    setTestResult({
      valid: errors.length === 0,
      errors,
      warnings,
      strength: strengthLevel,
      score: strength,
    });
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
      case 'Strong':
        return 'success';
      case 'Good':
      case 'Fair':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Password Policies
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleResetToDefault}
              disabled={saving}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSavePolicy}
              disabled={saving || !hasChanges}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

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

        {hasChanges && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have unsaved changes
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Password Requirements */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PasswordIcon />
                  Password Requirements
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Password Length: {policy.minLength} - {policy.maxLength} characters
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Typography variant="body2" color="text.secondary">Minimum</Typography>
                    <Slider
                      value={policy.minLength}
                      onChange={(e, value) => updatePolicy('minLength', value)}
                      min={4}
                      max={32}
                      marks
                      valueLabelDisplay="auto"
                    />
                    
                    <Typography variant="body2" color="text.secondary">Maximum</Typography>
                    <Slider
                      value={policy.maxLength}
                      onChange={(e, value) => updatePolicy('maxLength', value)}
                      min={32}
                      max={256}
                      step={8}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireUppercase}
                        onChange={(e) => updatePolicy('requireUppercase', e.target.checked)}
                      />
                    }
                    label="Require uppercase letters (A-Z)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireLowercase}
                        onChange={(e) => updatePolicy('requireLowercase', e.target.checked)}
                      />
                    }
                    label="Require lowercase letters (a-z)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireNumbers}
                        onChange={(e) => updatePolicy('requireNumbers', e.target.checked)}
                      />
                    }
                    label="Require numbers (0-9)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireSpecialChars}
                        onChange={(e) => updatePolicy('requireSpecialChars', e.target.checked)}
                      />
                    }
                    label="Require special characters"
                  />
                </FormGroup>

                {policy.requireSpecialChars && (
                  <TextField
                    fullWidth
                    label="Allowed Special Characters"
                    value={policy.specialCharsSet}
                    onChange={(e) => updatePolicy('specialCharsSet', e.target.value)}
                    sx={{ mt: 2 }}
                    size="small"
                    helperText="Characters that count as special characters"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Security Rules */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlockIcon />
                  Security Rules
                </Typography>
                
                <FormGroup sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.preventCommonPasswords}
                        onChange={(e) => updatePolicy('preventCommonPasswords', e.target.checked)}
                      />
                    }
                    label="Prevent common passwords"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.preventUserInfo}
                        onChange={(e) => updatePolicy('preventUserInfo', e.target.checked)}
                      />
                    }
                    label="Prevent passwords containing user info"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.allowPasswordHints}
                        onChange={(e) => updatePolicy('allowPasswordHints', e.target.checked)}
                      />
                    }
                    label="Allow password hints"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireMFAForReset}
                        onChange={(e) => updatePolicy('requireMFAForReset', e.target.checked)}
                      />
                    }
                    label="Require MFA for password reset"
                  />
                </FormGroup>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prevent repeating characters"
                    value={policy.preventRepeatingChars}
                    onChange={(e) => updatePolicy('preventRepeatingChars', parseInt(e.target.value) || 0)}
                    size="small"
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                      endAdornment: <InputAdornment position="end">characters</InputAdornment>,
                    }}
                    helperText="0 to disable"
                  />
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Prevent sequential characters"
                    value={policy.preventSequentialChars}
                    onChange={(e) => updatePolicy('preventSequentialChars', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ mt: 2 }}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                      endAdornment: <InputAdornment position="end">characters</InputAdornment>,
                    }}
                    helperText="0 to disable"
                  />
                </Box>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Minimum Password Strength</InputLabel>
                  <Select
                    value={policy.enforcePasswordStrength}
                    label="Minimum Password Strength"
                    onChange={(e) => updatePolicy('enforcePasswordStrength', e.target.value)}
                    size="small"
                  >
                    <MenuItem value="weak">Weak</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="strong">Strong</MenuItem>
                    <MenuItem value="very-strong">Very Strong</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Lifecycle */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerIcon />
                  Password Lifecycle
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Password expiration"
                      value={policy.expirationDays}
                      onChange={(e) => updatePolicy('expirationDays', parseInt(e.target.value) || 0)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 365 },
                        endAdornment: <InputAdornment position="end">days</InputAdornment>,
                      }}
                      helperText="0 to disable"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Expiration warning"
                      value={policy.expirationWarningDays}
                      onChange={(e) => updatePolicy('expirationWarningDays', parseInt(e.target.value) || 0)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 30 },
                        endAdornment: <InputAdornment position="end">days</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum password age"
                      value={policy.minPasswordAge}
                      onChange={(e) => updatePolicy('minPasswordAge', parseInt(e.target.value) || 0)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 30 },
                        endAdornment: <InputAdornment position="end">days</InputAdornment>,
                      }}
                      helperText="Prevent immediate changes"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Password history"
                      value={policy.passwordHistory}
                      onChange={(e) => updatePolicy('passwordHistory', parseInt(e.target.value) || 0)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 24 },
                        endAdornment: <InputAdornment position="end">passwords</InputAdornment>,
                      }}
                      helperText="Prevent reuse"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Reset token expiration"
                      value={policy.resetTokenExpiration}
                      onChange={(e) => updatePolicy('resetTokenExpiration', parseInt(e.target.value) || 60)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 5, max: 1440 },
                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Lockout */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlockIcon />
                  Account Lockout
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Failed attempts threshold"
                      value={policy.accountLockoutThreshold}
                      onChange={(e) => updatePolicy('accountLockoutThreshold', parseInt(e.target.value) || 0)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 10 },
                        endAdornment: <InputAdornment position="end">attempts</InputAdornment>,
                      }}
                      helperText="0 to disable"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Lockout duration"
                      value={policy.accountLockoutDuration}
                      onChange={(e) => updatePolicy('accountLockoutDuration', parseInt(e.target.value) || 30)}
                      size="small"
                      InputProps={{
                        inputProps: { min: 1, max: 1440 },
                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Accounts will be locked after {policy.accountLockoutThreshold} failed login attempts
                    and will remain locked for {policy.accountLockoutDuration} minutes.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Password Tester */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Password Against Policy
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="Test Password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Enter a password to test"
          />
          <Button
            variant="contained"
            onClick={testPasswordAgainstPolicy}
            disabled={!testPassword}
          >
            Test
          </Button>
        </Box>

        {testResult && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={testResult.valid ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testResult.valid ? 'Password meets all requirements!' : 'Password does not meet requirements'}
            </Alert>

            {testResult.strength && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Password Strength
                </Typography>
                <Chip
                  label={testResult.strength}
                  color={getStrengthColor(testResult.strength) as any}
                  size="small"
                />
              </Box>
            )}

            {testResult.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="error" gutterBottom>
                  Requirements not met:
                </Typography>
                <List dense>
                  {testResult.errors.map((error: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CloseIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {testResult.warnings?.length > 0 && (
              <Box>
                <Typography variant="body2" color="warning.main" gutterBottom>
                  Warnings:
                </Typography>
                <List dense>
                  {testResult.warnings.map((warning: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PasswordPolicies;
