import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Divider,
  InputAdornment,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Api as ApiIcon,
  Webhook as WebhookIcon,
  Cloud as CloudIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  History as HistoryIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  AutoFixHigh as AutoFixHighIcon,
  ElectricBolt as ElectricBoltIcon,
} from '@mui/icons-material';
import { integrationService } from '../../services/integrationService';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

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
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Integration {
  id: string;
  type: 'cloud' | 'email' | 'sms' | 'payment' | 'automation';
  provider: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: any;
  createdAt: string;
  lastSync?: string;
  usage?: {
    calls: number;
    limit: number;
    period: string;
  };
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
  createdAt: string;
  lastTriggered?: string;
  successRate?: number;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  request: any;
  response?: any;
  error?: string;
  timestamp: string;
  duration?: number;
}

const IntegrationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [apiSpec, setApiSpec] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Form states
  const [integrationForm, setIntegrationForm] = useState({
    type: 'cloud',
    provider: '',
    name: '',
    config: {},
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    headers: {} as Record<string, string>,
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 60,
    },
  });

  const integrationProviders = {
    cloud: ['AWS S3', 'Google Drive', 'Dropbox', 'Azure Blob Storage'],
    email: ['SendGrid', 'AWS SES', 'Mailgun', 'SMTP'],
    sms: ['Twilio', 'Nexmo', 'TextLocal', 'AWS SNS'],
    payment: ['Razorpay', 'PayPal', 'Stripe', 'Square'],
    automation: ['Make', 'Zapier', 'IFTTT', 'n8n'],
  };

  const webhookEvents = [
    'tender.created',
    'tender.updated',
    'tender.deleted',
    'tender.published',
    'bid.submitted',
    'bid.accepted',
    'bid.rejected',
    'vendor.registered',
    'vendor.approved',
    'payment.completed',
    'document.uploaded',
    'notification.sent',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [integrationsRes, webhooksRes, apiSpecRes] = await Promise.all([
        integrationService.getIntegrations(),
        integrationService.getWebhooks(),
        integrationService.getApiSpec(),
      ]);
      setIntegrations(integrationsRes.data);
      setWebhooks(webhooksRes.data);
      setApiSpec(apiSpecRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading integrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddIntegration = () => {
    setSelectedItem(null);
    setIntegrationForm({
      type: 'cloud',
      provider: '',
      name: '',
      config: {},
    });
    setOpenDialog('integration');
  };

  const handleEditIntegration = (integration: Integration) => {
    setSelectedItem(integration);
    setIntegrationForm({
      type: integration.type,
      provider: integration.provider,
      name: integration.name,
      config: integration.config,
    });
    setOpenDialog('integration');
  };

  const handleDeleteIntegration = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      try {
        await integrationService.deleteIntegration(id);
        await loadData();
        showSnackbar('Integration deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting integration:', error);
        showSnackbar('Error deleting integration', 'error');
      }
    }
  };

  const handleSaveIntegration = async () => {
    try {
      if (selectedItem) {
        await integrationService.updateIntegration(selectedItem.id, integrationForm);
      } else {
        await integrationService.createIntegration(integrationForm);
      }
      await loadData();
      setOpenDialog(null);
      showSnackbar('Integration saved successfully', 'success');
    } catch (error) {
      console.error('Error saving integration:', error);
      showSnackbar('Error saving integration', 'error');
    }
  };

  const handleTestIntegration = async (integration: Integration) => {
    setLoading(true);
    try {
      const response = await integrationService.testIntegration(integration.id);
      setTestResult(response.data);
      setOpenDialog('test-result');
    } catch (error) {
      console.error('Error testing integration:', error);
      showSnackbar('Integration test failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = () => {
    setSelectedItem(null);
    setWebhookForm({
      name: '',
      url: '',
      events: [],
      secret: '',
      headers: {},
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 60,
      },
    });
    setOpenDialog('webhook');
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedItem(webhook);
    setWebhookForm({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || '',
      headers: webhook.headers || {},
      retryPolicy: webhook.retryPolicy || {
        maxRetries: 3,
        retryDelay: 60,
      },
    });
    setOpenDialog('webhook');
  };

  const handleDeleteWebhook = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await integrationService.deleteWebhook(id);
        await loadData();
        showSnackbar('Webhook deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting webhook:', error);
        showSnackbar('Error deleting webhook', 'error');
      }
    }
  };

  const handleSaveWebhook = async () => {
    try {
      if (selectedItem) {
        await integrationService.updateWebhook(selectedItem.id, webhookForm);
      } else {
        await integrationService.createWebhook(webhookForm);
      }
      await loadData();
      setOpenDialog(null);
      showSnackbar('Webhook saved successfully', 'success');
    } catch (error) {
      console.error('Error saving webhook:', error);
      showSnackbar('Error saving webhook', 'error');
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    setLoading(true);
    try {
      await integrationService.testWebhook(webhook.id);
      showSnackbar('Test webhook sent successfully', 'success');
    } catch (error) {
      console.error('Error testing webhook:', error);
      showSnackbar('Error testing webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWebhookLogs = async (webhookId: string) => {
    setLoading(true);
    try {
      const response = await integrationService.getWebhookLogs(webhookId);
      setWebhookLogs(response.data);
      setOpenDialog('webhook-logs');
    } catch (error) {
      console.error('Error loading webhook logs:', error);
      showSnackbar('Error loading webhook logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      await integrationService.updateIntegration(integration.id, { status: newStatus });
      await loadData();
      showSnackbar(`Integration ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling integration:', error);
      showSnackbar('Error updating integration status', 'error');
    }
  };

  const handleToggleWebhook = async (webhook: Webhook) => {
    try {
      const newStatus = webhook.status === 'active' ? 'inactive' : 'active';
      await integrationService.updateWebhook(webhook.id, { status: newStatus });
      await loadData();
      showSnackbar(`Webhook ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling webhook:', error);
      showSnackbar('Error updating webhook status', 'error');
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'cloud':
        return <CloudIcon />;
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'automation':
        return <AutoFixHighIcon />;
      default:
        return <ApiIcon />;
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderIntegrationConfig = () => {
    const { type, provider } = integrationForm;

    switch (type) {
      case 'cloud':
        if (provider === 'AWS S3') {
          return (
            <>
              <TextField
                fullWidth
                label="Access Key ID"
                margin="normal"
                value={integrationForm.config.accessKeyId || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, accessKeyId: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Secret Access Key"
                type="password"
                margin="normal"
                value={integrationForm.config.secretAccessKey || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, secretAccessKey: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Bucket Name"
                margin="normal"
                value={integrationForm.config.bucketName || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, bucketName: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Region"
                margin="normal"
                value={integrationForm.config.region || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, region: e.target.value }
                })}
              />
            </>
          );
        } else if (provider === 'Google Drive') {
          return (
            <>
              <TextField
                fullWidth
                label="Client ID"
                margin="normal"
                value={integrationForm.config.clientId || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, clientId: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Client Secret"
                type="password"
                margin="normal"
                value={integrationForm.config.clientSecret || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, clientSecret: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Refresh Token"
                margin="normal"
                value={integrationForm.config.refreshToken || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, refreshToken: e.target.value }
                })}
              />
            </>
          );
        }
        break;

      case 'email':
        if (provider === 'SendGrid') {
          return (
            <>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                margin="normal"
                value={integrationForm.config.apiKey || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, apiKey: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="From Email"
                margin="normal"
                value={integrationForm.config.fromEmail || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, fromEmail: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="From Name"
                margin="normal"
                value={integrationForm.config.fromName || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, fromName: e.target.value }
                })}
              />
            </>
          );
        } else if (provider === 'AWS SES') {
          return (
            <>
              <TextField
                fullWidth
                label="Access Key ID"
                margin="normal"
                value={integrationForm.config.accessKeyId || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, accessKeyId: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Secret Access Key"
                type="password"
                margin="normal"
                value={integrationForm.config.secretAccessKey || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, secretAccessKey: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Region"
                margin="normal"
                value={integrationForm.config.region || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, region: e.target.value }
                })}
              />
            </>
          );
        }
        break;

      case 'sms':
        if (provider === 'Twilio') {
          return (
            <>
              <TextField
                fullWidth
                label="Account SID"
                margin="normal"
                value={integrationForm.config.accountSid || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, accountSid: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Auth Token"
                type="password"
                margin="normal"
                value={integrationForm.config.authToken || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, authToken: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="From Number"
                margin="normal"
                value={integrationForm.config.fromNumber || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, fromNumber: e.target.value }
                })}
              />
            </>
          );
        }
        break;

      case 'automation':
        if (provider === 'Make' || provider === 'Zapier') {
          return (
            <>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                margin="normal"
                value={integrationForm.config.apiKey || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, apiKey: e.target.value }
                })}
              />
              <TextField
                fullWidth
                label="Webhook URL"
                margin="normal"
                value={integrationForm.config.webhookUrl || ''}
                onChange={(e) => setIntegrationForm({
                  ...integrationForm,
                  config: { ...integrationForm.config, webhookUrl: e.target.value }
                })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={integrationForm.config.autoSync || false}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, autoSync: e.target.checked }
                    })}
                  />
                }
                label="Auto Sync"
              />
            </>
          );
        }
        break;
    }

    return null;
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="API Documentation" icon={<DescriptionIcon />} />
          <Tab label="Integrations" icon={<ApiIcon />} />
          <Tab label="Webhooks" icon={<WebhookIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {apiSpec ? (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">API Documentation</Typography>
                <Button
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open('/api-docs', '_blank')}
                >
                  Open in New Tab
                </Button>
              </Box>
              <Box sx={{ height: '70vh', overflow: 'auto' }}>
                <SwaggerUI spec={apiSpec} />
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading API documentation...</Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Third-party Integrations</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddIntegration}
          >
            Add Integration
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(integrationProviders).map(([type, providers]) => (
              <Grid item xs={12} key={type}>
                <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                  {type} Integrations
                </Typography>
                <Grid container spacing={2}>
                  {integrations
                    .filter((integration) => integration.type === type)
                    .map((integration) => (
                      <Grid item xs={12} md={6} lg={4} key={integration.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {getIntegrationIcon(integration.type)}
                              <Box sx={{ ml: 2, flex: 1 }}>
                                <Typography variant="h6">{integration.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {integration.provider}
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={integration.status}
                                color={
                                  integration.status === 'active'
                                    ? 'success'
                                    : integration.status === 'error'
                                    ? 'error'
                                    : 'default'
                                }
                              />
                            </Box>

                            {integration.usage && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Usage: {integration.usage.calls} / {integration.usage.limit}{' '}
                                  {integration.usage.period}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={(integration.usage.calls / integration.usage.limit) * 100}
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditIntegration(integration)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleTestIntegration(integration)}
                                >
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteIntegration(integration.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Switch
                                checked={integration.status === 'active'}
                                onChange={() => handleToggleIntegration(integration)}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Webhook Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddWebhook}
          >
            Add Webhook
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>{webhook.name}</TableCell>
                    <TableCell>
                      <Tooltip title={webhook.url}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>
                          {webhook.url}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {webhook.events.slice(0, 2).map((event) => (
                          <Chip key={event} label={event} size="small" />
                        ))}
                        {webhook.events.length > 2 && (
                          <Chip label={`+${webhook.events.length - 2}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={webhook.status}
                        color={webhook.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {webhook.successRate !== undefined && (
                        <Typography
                          color={webhook.successRate > 90 ? 'success.main' : 'warning.main'}
                        >
                          {webhook.successRate.toFixed(1)}%
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {webhook.lastTriggered && new Date(webhook.lastTriggered).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditWebhook(webhook)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleTestWebhook(webhook)}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleViewWebhookLogs(webhook.id)}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Switch
                        checked={webhook.status === 'active'}
                        onChange={() => handleToggleWebhook(webhook)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Integration Dialog */}
      <Dialog open={openDialog === 'integration'} onClose={() => setOpenDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Integration' : 'Add Integration'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={integrationForm.type}
              onChange={(e) => setIntegrationForm({ ...integrationForm, type: e.target.value as any })}
            >
              {Object.keys(integrationProviders).map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getIntegrationIcon(type)}
                    <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>{type}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Provider</InputLabel>
            <Select
              value={integrationForm.provider}
              onChange={(e) => setIntegrationForm({ ...integrationForm, provider: e.target.value })}
            >
              {integrationProviders[integrationForm.type as keyof typeof integrationProviders]?.map(
                (provider) => (
                  <MenuItem key={provider} value={provider}>
                    {provider}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Integration Name"
            margin="normal"
            value={integrationForm.name}
            onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
          />

          {renderIntegrationConfig()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button onClick={handleSaveIntegration} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={openDialog === 'webhook'} onClose={() => setOpenDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Webhook' : 'Add Webhook'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Webhook Name"
            margin="normal"
            value={webhookForm.name}
            onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Webhook URL"
            margin="normal"
            value={webhookForm.url}
            onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Events</InputLabel>
            <Select
              multiple
              value={webhookForm.events}
              onChange={(e) => setWebhookForm({ ...webhookForm, events: e.target.value as string[] })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {webhookEvents.map((event) => (
                <MenuItem key={event} value={event}>
                  {event}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Secret (optional)"
            margin="normal"
            type="password"
            value={webhookForm.secret}
            onChange={(e) => setWebhookForm({ ...webhookForm, secret: e.target.value })}
            helperText="Used to sign webhook payloads"
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Retry Policy
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Retries"
                type="number"
                value={webhookForm.retryPolicy.maxRetries}
                onChange={(e) => setWebhookForm({
                  ...webhookForm,
                  retryPolicy: { ...webhookForm.retryPolicy, maxRetries: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Retry Delay (seconds)"
                type="number"
                value={webhookForm.retryPolicy.retryDelay}
                onChange={(e) => setWebhookForm({
                  ...webhookForm,
                  retryPolicy: { ...webhookForm.retryPolicy, retryDelay: parseInt(e.target.value) }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button onClick={handleSaveWebhook} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Logs Dialog */}
      <Dialog open={openDialog === 'webhook-logs'} onClose={() => setOpenDialog(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Webhook Logs</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Status Code</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhookLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.event}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={log.status}
                        color={
                          log.status === 'success'
                            ? 'success'
                            : log.status === 'failed'
                            ? 'error'
                            : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>{log.statusCode}</TableCell>
                    <TableCell>{log.duration ? `${log.duration}ms` : '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(log);
                          setOpenDialog('log-details');
                        }}
                      >
                        <CodeIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Result Dialog */}
      <Dialog open={openDialog === 'test-result'} onClose={() => setOpenDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Integration Test Result</DialogTitle>
        <DialogContent>
          {testResult && (
            <Box>
              <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                {testResult.message}
              </Alert>
              {testResult.details && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Test Details:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IntegrationManagement;
