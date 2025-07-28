import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  InputAdornment,
  Slider,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartIcon,
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
      id={`system-config-tabpanel-${index}`}
      aria-labelledby={`system-config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SystemConfiguration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Configuration states
  const [generalConfig, setGeneralConfig] = useState({
    systemName: 'Tender Management System',
    systemUrl: 'https://tender.example.com',
    supportEmail: 'support@tender.example.com',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'en',
  });

  const [securityConfig, setSecurityConfig] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: true,
    ipWhitelisting: false,
    whitelistedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
  });

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@tender.example.com',
    smtpPassword: '********',
    emailFrom: 'Tender Management <noreply@tender.example.com>',
    enableSSL: true,
  });

  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyTenderCreation: true,
    notifyBidSubmission: true,
    notifyContractApproval: true,
    notifyPaymentDue: true,
  });

  const [storageConfig, setStorageConfig] = useState({
    storageType: 'local',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    s3Bucket: '',
    s3Region: '',
    s3AccessKey: '',
    s3SecretKey: '',
  });

  const [maintenanceConfig, setMaintenanceConfig] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please check back later.',
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    autoUpdateEnabled: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveChanges = () => {
    // Handle save
    setHasChanges(false);
    console.log('Saving configuration changes...');
  };

  const handleResetChanges = () => {
    // Handle reset
    setHasChanges(false);
    console.log('Resetting configuration changes...');
  };

  const handleAddIP = () => {
    // Handle adding IP
    console.log('Adding IP address...');
  };

  const handleRemoveIP = (ip: string) => {
    // Handle removing IP
    console.log('Removing IP:', ip);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              System Configuration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure system-wide settings and preferences
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RestartIcon />}
              onClick={handleResetChanges}
              disabled={!hasChanges}
              sx={{ mr: 2 }}
            >
              Reset Changes
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveChanges}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
        {hasChanges && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You have unsaved changes. Please save or reset before leaving this page.
          </Alert>
        )}
      </Box>

      {/* Configuration Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<EmailIcon />} label="Email" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<StorageIcon />} label="Storage" />
          <Tab icon={<ScheduleIcon />} label="Maintenance" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="System Name"
                        value={generalConfig.systemName}
                        onChange={(e) => {
                          setGeneralConfig({ ...generalConfig, systemName: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="System URL"
                        value={generalConfig.systemUrl}
                        onChange={(e) => {
                          setGeneralConfig({ ...generalConfig, systemUrl: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Support Email"
                        type="email"
                        value={generalConfig.supportEmail}
                        onChange={(e) => {
                          setGeneralConfig({ ...generalConfig, supportEmail: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Localization
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={generalConfig.timezone}
                          label="Timezone"
                          onChange={(e) => {
                            setGeneralConfig({ ...generalConfig, timezone: e.target.value });
                            setHasChanges(true);
                          }}
                        >
                          <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value={generalConfig.dateFormat}
                          label="Date Format"
                          onChange={(e) => {
                            setGeneralConfig({ ...generalConfig, dateFormat: e.target.value });
                            setHasChanges(true);
                          }}
                        >
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={generalConfig.currency}
                          label="Currency"
                          onChange={(e) => {
                            setGeneralConfig({ ...generalConfig, currency: e.target.value });
                            setHasChanges(true);
                          }}
                        >
                          <MenuItem value="INR">INR (₹)</MenuItem>
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Password Policy
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Minimum Password Length: {securityConfig.passwordMinLength}
                      </Typography>
                      <Slider
                        value={securityConfig.passwordMinLength}
                        onChange={(e, value) => {
                          setSecurityConfig({ ...securityConfig, passwordMinLength: value as number });
                          setHasChanges(true);
                        }}
                        min={6}
                        max={20}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securityConfig.passwordRequireUppercase}
                              onChange={(e) => {
                                setSecurityConfig({ ...securityConfig, passwordRequireUppercase: e.target.checked });
                                setHasChanges(true);
                              }}
                            />
                          }
                          label="Require uppercase letters"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securityConfig.passwordRequireNumbers}
                              onChange={(e) => {
                                setSecurityConfig({ ...securityConfig, passwordRequireNumbers: e.target.checked });
                                setHasChanges(true);
                              }}
                            />
                          }
                          label="Require numbers"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securityConfig.passwordRequireSpecialChars}
                              onChange={(e) => {
                                setSecurityConfig({ ...securityConfig, passwordRequireSpecialChars: e.target.checked });
                                setHasChanges(true);
                              }}
                            />
                          }
                          label="Require special characters"
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session & Authentication
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Session Timeout (minutes)"
                        type="number"
                        value={securityConfig.sessionTimeout}
                        onChange={(e) => {
                          setSecurityConfig({ ...securityConfig, sessionTimeout: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        value={securityConfig.maxLoginAttempts}
                        onChange={(e) => {
                          setSecurityConfig({ ...securityConfig, maxLoginAttempts: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securityConfig.twoFactorAuth}
                            onChange={(e) => {
                              setSecurityConfig({ ...securityConfig, twoFactorAuth: e.target.checked });
                              setHasChanges(true);
                            }}
                          />
                        }
                        label="Enable Two-Factor Authentication"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      IP Whitelisting
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securityConfig.ipWhitelisting}
                          onChange={(e) => {
                            setSecurityConfig({ ...securityConfig, ipWhitelisting: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Enable"
                    />
                  </Box>
                  {securityConfig.ipWhitelisting && (
                    <>
                      <List>
                        {securityConfig.whitelistedIPs.map((ip, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={ip} />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => handleRemoveIP(ip)}>
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddIP}
                        fullWidth
                      >
                        Add IP Address
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Email Settings */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SMTP Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        value={emailConfig.smtpHost}
                        onChange={(e) => {
                          setEmailConfig({ ...emailConfig, smtpHost: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) => {
                          setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Username"
                        value={emailConfig.smtpUser}
                        onChange={(e) => {
                          setEmailConfig({ ...emailConfig, smtpUser: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Password"
                        type="password"
                        value={emailConfig.smtpPassword}
                        onChange={(e) => {
                          setEmailConfig({ ...emailConfig, smtpPassword: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="From Email"
                        value={emailConfig.emailFrom}
                        onChange={(e) => {
                          setEmailConfig({ ...emailConfig, emailFrom: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailConfig.enableSSL}
                            onChange={(e) => {
                              setEmailConfig({ ...emailConfig, enableSSL: e.target.checked });
                              setHasChanges(true);
                            }}
                          />
                        }
                        label="Enable SSL/TLS"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" fullWidth>
                        Test Email Configuration
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Channels
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.emailNotifications}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, emailNotifications: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.smsNotifications}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, smsNotifications: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="SMS Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.pushNotifications}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, pushNotifications: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Push Notifications"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Events
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.notifyTenderCreation}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, notifyTenderCreation: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Notify on Tender Creation"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.notifyBidSubmission}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, notifyBidSubmission: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Notify on Bid Submission"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.notifyContractApproval}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, notifyContractApproval: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Notify on Contract Approval"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationConfig.notifyPaymentDue}
                          onChange={(e) => {
                            setNotificationConfig({ ...notificationConfig, notifyPaymentDue: e.target.checked });
                            setHasChanges(true);
                          }}
                        />
                      }
                      label="Notify on Payment Due"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Storage Settings */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Storage Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Storage Type</InputLabel>
                        <Select
                          value={storageConfig.storageType}
                          label="Storage Type"
                          onChange={(e) => {
                            setStorageConfig({ ...storageConfig, storageType: e.target.value });
                            setHasChanges(true);
                          }}
                        >
                          <MenuItem value="local">Local Storage</MenuItem>
                          <MenuItem value="s3">Amazon S3</MenuItem>
                          <MenuItem value="azure">Azure Blob Storage</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Max File Size: {storageConfig.maxFileSize} MB
                      </Typography>
                      <Slider
                        value={storageConfig.maxFileSize}
                        onChange={(e, value) => {
                          setStorageConfig({ ...storageConfig, maxFileSize: value as number });
                          setHasChanges(true);
                        }}
                        min={1}
                        max={100}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Allowed File Types
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {storageConfig.allowedFileTypes.map((type) => (
                          <Chip
                            key={type}
                            label={type.toUpperCase()}
                            onDelete={() => {
                              // Handle delete
                            }}
                          />
                        ))}
                        <Chip
                          label="Add Type"
                          onClick={() => {
                            // Handle add
                          }}
                          icon={<AddIcon />}
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            {storageConfig.storageType === 's3' && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      S3 Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="S3 Bucket"
                          value={storageConfig.s3Bucket}
                          onChange={(e) => {
                            setStorageConfig({ ...storageConfig, s3Bucket: e.target.value });
                            setHasChanges(true);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="S3 Region"
                          value={storageConfig.s3Region}
                          onChange={(e) => {
                            setStorageConfig({ ...storageConfig, s3Region: e.target.value });
                            setHasChanges(true);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Access Key"
                          type="password"
                          value={storageConfig.s3AccessKey}
                          onChange={(e) => {
                            setStorageConfig({ ...storageConfig, s3AccessKey: e.target.value });
                            setHasChanges(true);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Secret Key"
                          type="password"
                          value={storageConfig.s3SecretKey}
                          onChange={(e) => {
                            setStorageConfig({ ...storageConfig, s3SecretKey: e.target.value });
                            setHasChanges(true);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Maintenance Settings */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Maintenance Mode
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenanceConfig.maintenanceMode}
                        onChange={(e) => {
                          setMaintenanceConfig({ ...maintenanceConfig, maintenanceMode: e.target.checked });
                          setHasChanges(true);
                        }}
                      />
                    }
                    label="Enable Maintenance Mode"
                  />
                  {maintenanceConfig.maintenanceMode && (
                    <TextField
                      fullWidth
                      label="Maintenance Message"
                      multiline
                      rows={3}
                      value={maintenanceConfig.maintenanceMessage}
                      onChange={(e) => {
                        setMaintenanceConfig({ ...maintenanceConfig, maintenanceMessage: e.target.value });
                        setHasChanges(true);
                      }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Backup Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={maintenanceConfig.backupEnabled}
                            onChange={(e) => {
                              setMaintenanceConfig({ ...maintenanceConfig, backupEnabled: e.target.checked });
                              setHasChanges(true);
                            }}
                          />
                        }
                        label="Enable Automatic Backups"
                      />
                    </Grid>
                    {maintenanceConfig.backupEnabled && (
                      <>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Backup Frequency</InputLabel>
                            <Select
                              value={maintenanceConfig.backupFrequency}
                              label="Backup Frequency"
                              onChange={(e) => {
                                setMaintenanceConfig({ ...maintenanceConfig, backupFrequency: e.target.value });
                                setHasChanges(true);
                              }}
                            >
                              <MenuItem value="hourly">Hourly</MenuItem>
                              <MenuItem value="daily">Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Backup Retention (days)"
                            type="number"
                            value={maintenanceConfig.backupRetention}
                            onChange={(e) => {
                              setMaintenanceConfig({ ...maintenanceConfig, backupRetention: parseInt(e.target.value) });
                              setHasChanges(true);
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SystemConfiguration;
