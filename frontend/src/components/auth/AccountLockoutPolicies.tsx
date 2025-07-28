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
  Slider,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormGroup,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface LockoutPolicy {
  enabled: boolean;
  attemptsBeforeLockout: number;
  lockoutDurationMinutes: number;
  observationWindowMinutes: number;
  alertThreshold: number;
}

const defaultLockoutPolicy: LockoutPolicy = {
  enabled: true,
  attemptsBeforeLockout: 5,
  lockoutDurationMinutes: 30,
  observationWindowMinutes: 15,
  alertThreshold: 3,
};

const AccountLockoutPolicies: React.FC = () => {
  const [policy, setPolicy] = useState<LockoutPolicy>(defaultLockoutPolicy);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    setLoading(true);
    try {
      const response = await authService.getLockoutPolicy();
      setPolicy(response.data);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lockout policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    setError('');

    try {
      await authService.updateLockoutPolicy(policy);
      setSuccess('Lockout policy updated successfully!');
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lockout policy');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setPolicy(defaultLockoutPolicy);
      setHasChanges(true);
    }
  };

  const updatePolicy = (field: keyof LockoutPolicy, value: any) => {
    setPolicy({ ...policy, [field]: value });
    setHasChanges(true);
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
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Account Lockout Policies
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
              startIcon={saving ? <CircularProgress size={20} /> : <CheckIcon />}
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

        {/* Lockout Settings */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon />
                  Lockout Settings
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.enabled}
                        onChange={(e) => updatePolicy('enabled', e.target.checked)}
                      />
                    }
                    label="Enable Account Lockout"
                  />
                </FormGroup>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Failed attempts before lockout"
                    value={policy.attemptsBeforeLockout}
                    onChange={(e) => updatePolicy('attemptsBeforeLockout', parseInt(e.target.value) || 0)}
                    size="small"
                    InputProps={{
                      inputProps: { min: 1, max: 10 },
                      endAdornment: <InputAdornment position="end">attempts</InputAdornment>,
                    }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Lockout duration"
                    value={policy.lockoutDurationMinutes}
                    onChange={(e) => updatePolicy('lockoutDurationMinutes', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ mt: 2 }}
                    InputProps={{
                      inputProps: { min: 1, max: 1440 },
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Observation window"
                    value={policy.observationWindowMinutes}
                    onChange={(e) => updatePolicy('observationWindowMinutes', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ mt: 2 }}
                    InputProps={{
                      inputProps: { min: 1, max: 60 },
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts and Warnings */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon />
                  Alerts and Warnings
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Alert threshold"
                    value={policy.alertThreshold}
                    onChange={(e) => updatePolicy('alertThreshold', parseInt(e.target.value) || 0)}
                    size="small"
                    InputProps={{
                      inputProps: { min: 1, max: 10 },
                      endAdornment: <InputAdornment position="end">attempts</InputAdornment>,
                    }}
                  />

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Administrators will be alerted after {policy.alertThreshold} failed login attempts.
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AccountLockoutPolicies;

