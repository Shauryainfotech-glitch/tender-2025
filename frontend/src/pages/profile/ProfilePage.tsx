import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Tab,
  Tabs,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await authService.getUserSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onProfileSubmit = async (data: any) => {
    try {
      // TODO: Implement profile update API
      toast.success('Profile updated successfully');
      setIsEditMode(false);
      // TODO: Refresh user data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      await authService.changePassword(data);
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId);
      toast.success('Session revoked successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await authService.revokeAllSessions();
      toast.success('All sessions revoked successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<PersonIcon />} label="Profile" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<HistoryIcon />} label="Activity" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} textAlign="center">
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '3rem',
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                size="small"
              >
                Change Photo
              </Button>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditMode && (
                  <IconButton onClick={() => setIsEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>

              {isEditMode ? (
                <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        {...registerProfile('firstName')}
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        {...registerProfile('lastName')}
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...registerProfile('email')}
                        error={!!profileErrors.email}
                        helperText={profileErrors.email?.message}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        {...registerProfile('phoneNumber')}
                        error={!!profileErrors.phoneNumber}
                        helperText={profileErrors.phoneNumber?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" gap={1}>
                        <Button type="submit" variant="contained">
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsEditMode(false);
                            resetProfileForm();
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${user?.firstName} ${user?.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user?.email}
                    />
                    {user?.emailVerified && (
                      <Chip label="Verified" color="success" size="small" />
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={user?.phoneNumber || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Organization"
                      secondary={user?.organization?.name || 'Not associated'}
                    />
                  </ListItem>
                </List>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Role"
                    secondary={user?.role}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={user?.status}
                        color={user?.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt || '').toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Ensure your account is using a long, random password to stay secure.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add an extra layer of security to your account.
                  </Typography>
                  <Button variant="outlined">Enable 2FA</Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">Active Sessions</Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleRevokeAllSessions}
                    >
                      Revoke All
                    </Button>
                  </Box>
                  <List>
                    {sessions.map((session) => (
                      <ListItem
                        key={session.id}
                        secondaryAction={
                          !session.isCurrentSession && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              Revoke
                            </Button>
                          )
                        }
                      >
                        <ListItemText
                          primary={session.userAgent}
                          secondary={
                            <>
                              IP: {session.ipAddress} • Last active:{' '}
                              {new Date(session.lastActivity).toLocaleString()}
                              {session.isCurrentSession && (
                                <Chip
                                  label="Current"
                                  color="primary"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Activity Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your recent account activity will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Manage your email notification preferences"
              />
              <Button variant="outlined" size="small">
                Manage
              </Button>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Privacy Settings"
                secondary="Control who can see your profile information"
              />
              <Button variant="outlined" size="small">
                Manage
              </Button>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Data Export"
                secondary="Download a copy of your data"
              />
              <Button variant="outlined" size="small">
                Export
              </Button>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Delete Account"
                secondary="Permanently delete your account and all data"
              />
              <Button variant="outlined" color="error" size="small">
                Delete
              </Button>
            </ListItem>
          </List>
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                margin="normal"
                {...registerPassword('currentPassword')}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                margin="normal"
                {...registerPassword('newPassword')}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                margin="normal"
                {...registerPassword('confirmNewPassword')}
                error={!!passwordErrors.confirmNewPassword}
                helperText={passwordErrors.confirmNewPassword?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsChangingPassword(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};