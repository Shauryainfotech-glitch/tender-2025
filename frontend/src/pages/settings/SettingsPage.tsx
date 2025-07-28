import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Backup as BackupIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    tenderAlerts: true,
    bidAlerts: true,
    deadlineReminders: true,
    language: 'en',
    theme: 'light',
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleChange = (key: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<PaletteIcon />} label="Preferences" />
            <Tab icon={<SecurityIcon />} label="Privacy & Security" />
            <Tab icon={<StorageIcon />} label="Data & Storage" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SmsIcon />
              </ListItemIcon>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive notifications via SMS"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications in browser"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Alert Preferences
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="New Tender Alerts"
                secondary="Get notified when new tenders matching your criteria are posted"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.tenderAlerts}
                  onChange={() => handleToggle('tenderAlerts')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Bid Status Updates"
                secondary="Get notified about changes to your bid status"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.bidAlerts}
                  onChange={() => handleToggle('bidAlerts')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Deadline Reminders"
                secondary="Receive reminders before tender submission deadlines"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={preferences.deadlineReminders}
                  onChange={() => handleToggle('deadlineReminders')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained">Save Notification Settings</Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Display Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={preferences.language}
                  label="Language"
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={preferences.theme}
                  label="Theme"
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <MenuItem value="light">
                    <Box display="flex" alignItems="center">
                      <LightModeIcon sx={{ mr: 1 }} /> Light
                    </Box>
                  </MenuItem>
                  <MenuItem value="dark">
                    <Box display="flex" alignItems="center">
                      <DarkModeIcon sx={{ mr: 1 }} /> Dark
                    </Box>
                  </MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  value={preferences.timeZone}
                  label="Time Zone"
                  onChange={(e) => handleChange('timeZone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">Eastern Time</MenuItem>
                  <MenuItem value="CST">Central Time</MenuItem>
                  <MenuItem value="PST">Pacific Time</MenuItem>
                  <MenuItem value="IST">India Standard Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={preferences.dateFormat}
                  label="Date Format"
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={preferences.currency}
                  label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained">Save Preferences</Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Privacy Settings
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Profile Visibility"
                secondary="Control who can view your profile"
              />
              <FormControl size="small">
                <Select defaultValue="organization">
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="organization">Organization Only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Show Online Status"
                secondary="Let others see when you're online"
              />
              <Switch defaultChecked />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Show Last Seen"
                secondary="Display when you were last active"
              />
              <Switch defaultChecked />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <Button variant="outlined" size="small">
                Configure
              </Button>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Login Alerts"
                secondary="Get notified of new login attempts"
              />
              <Switch defaultChecked />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Session Timeout"
                secondary="Automatically log out after period of inactivity"
              />
              <FormControl size="small">
                <Select defaultValue="30">
                  <MenuItem value="15">15 minutes</MenuItem>
                  <MenuItem value="30">30 minutes</MenuItem>
                  <MenuItem value="60">1 hour</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained">Save Security Settings</Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CloudUploadIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Export Data</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Download all your data including tenders, bids, and documents.
                  </Typography>
                  <Chip label="Last export: Never" size="small" />
                </CardContent>
                <CardActions>
                  <Button variant="outlined" size="small">
                    Export Data
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BackupIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Backup Settings</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure automatic backups of your account data.
                  </Typography>
                  <Chip label="Auto-backup: Enabled" color="success" size="small" />
                </CardContent>
                <CardActions>
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <StorageIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Storage Usage</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Monitor your storage usage and manage files.
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Used: 2.3 GB / 10 GB
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: 'grey.300',
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: '23%',
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button variant="outlined" size="small">
                    Manage Storage
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <RestartAltIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Reset Settings</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Reset all settings to their default values.
                  </Typography>
                  <Chip label="Use with caution" color="warning" size="small" />
                </CardContent>
                <CardActions>
                  <Button variant="outlined" color="error" size="small">
                    Reset All
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};