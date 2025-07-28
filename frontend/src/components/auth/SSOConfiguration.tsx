import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  enabled: boolean;
  icon?: React.ReactNode;
  config: any;
  metadata?: any;
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SSOConfiguration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // SAML Configuration State
  const [samlConfig, setSamlConfig] = useState({
    entityId: '',
    ssoUrl: '',
    certificate: '',
    signatureAlgorithm: 'sha256',
    assertionConsumerServiceUrl: '',
    attributeMapping: {
      email: 'email',
      name: 'name',
      groups: 'groups',
    },
  });

  // OAuth Configuration State
  const [oauthConfig, setOauthConfig] = useState({
    clientId: '',
    clientSecret: '',
    authorizationUrl: '',
    tokenUrl: '',
    userInfoUrl: '',
    scope: 'openid profile email',
    redirectUri: '',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await authService.getSSOProviders();
      setProviders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load SSO providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!selectedProvider) return;

    setSaving(true);
    setError('');

    try {
      const config = selectedProvider.type === 'saml' ? samlConfig : oauthConfig;
      
      await authService.saveSSOProvider({
        ...selectedProvider,
        config,
      });

      setSuccess('SSO provider saved successfully!');
      setDialogOpen(false);
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save SSO provider');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!window.confirm('Are you sure you want to delete this SSO provider?')) {
      return;
    }

    try {
      await authService.deleteSSOProvider(providerId);
      setSuccess('SSO provider deleted successfully!');
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete SSO provider');
    }
  };

  const handleToggleProvider = async (provider: SSOProvider) => {
    try {
      await authService.toggleSSOProvider(provider.id, !provider.enabled);
      setSuccess(`SSO provider ${!provider.enabled ? 'enabled' : 'disabled'} successfully!`);
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle SSO provider');
    }
  };

  const handleTestConnection = async (provider: SSOProvider) => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await authService.testSSOConnection(provider.id);
      setTestResult({
        success: true,
        message: 'Connection successful!',
        details: response.data,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        error: err.response?.data?.message || 'Unknown error',
      });
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

  const downloadSAMLMetadata = () => {
    const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${window.location.origin}/saml/metadata">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true"
                   protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                              Location="${window.location.origin}/api/auth/saml/callback"
                              index="0" />
  </SPSSODescriptor>
</EntityDescriptor>`;

    const blob = new Blob([metadata], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sp-metadata.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSamlConfig({ ...samlConfig, certificate: content });
      setSuccess('Certificate uploaded successfully!');
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Single Sign-On (SSO) Configuration
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProvider({
                id: '',
                name: '',
                type: 'saml',
                enabled: false,
                config: {},
              });
              setDialogOpen(true);
            }}
          >
            Add Provider
          </Button>
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

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="SAML Providers" />
          <Tab label="OAuth / OIDC Providers" />
          <Tab label="Configuration" />
        </Tabs>

        {/* SAML Providers Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {providers
                .filter(p => p.type === 'saml')
                .map((provider) => (
                  <Grid item xs={12} md={6} key={provider.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {provider.name}
                            </Typography>
                            <Chip
                              label={provider.enabled ? 'Enabled' : 'Disabled'}
                              color={provider.enabled ? 'success' : 'default'}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          </Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={provider.enabled}
                                onChange={() => handleToggleProvider(provider)}
                              />
                            }
                            label=""
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Entity ID: {provider.config.entityId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SSO URL: {provider.config.ssoUrl}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setSamlConfig(provider.config);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleTestConnection(provider)}
                        >
                          Test
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </TabPanel>

        {/* OAuth/OIDC Providers Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Predefined OAuth Providers */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GoogleIcon />
                    <Typography variant="h6">Google</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sign in with Google accounts
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedProvider({
                        id: 'google',
                        name: 'Google',
                        type: 'oauth2',
                        enabled: false,
                        icon: <GoogleIcon />,
                        config: {
                          ...oauthConfig,
                          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                          tokenUrl: 'https://oauth2.googleapis.com/token',
                          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
                        },
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Configure
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GitHubIcon />
                    <Typography variant="h6">GitHub</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sign in with GitHub accounts
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedProvider({
                        id: 'github',
                        name: 'GitHub',
                        type: 'oauth2',
                        enabled: false,
                        icon: <GitHubIcon />,
                        config: {
                          ...oauthConfig,
                          authorizationUrl: 'https://github.com/login/oauth/authorize',
                          tokenUrl: 'https://github.com/login/oauth/access_token',
                          userInfoUrl: 'https://api.github.com/user',
                        },
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Configure
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon />
                    <Typography variant="h6">Microsoft</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sign in with Microsoft accounts
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedProvider({
                        id: 'microsoft',
                        name: 'Microsoft',
                        type: 'oidc',
                        enabled: false,
                        icon: <BusinessIcon />,
                        config: {
                          ...oauthConfig,
                          authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                          userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
                        },
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Configure
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Custom OAuth Providers */}
            {providers
              .filter(p => p.type === 'oauth2' || p.type === 'oidc')
              .map((provider) => (
                <Grid item xs={12} md={4} key={provider.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {provider.name}
                          </Typography>
                          <Chip
                            label={provider.enabled ? 'Enabled' : 'Disabled'}
                            color={provider.enabled ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={provider.enabled}
                              onChange={() => handleToggleProvider(provider)}
                            />
                          }
                          label=""
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setOauthConfig(provider.config);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleTestConnection(provider)}
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Service Provider Information
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Share these URLs with your Identity Provider
                </Alert>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Entity ID / Issuer"
                      secondary={`${window.location.origin}/saml/metadata`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => copyToClipboard(`${window.location.origin}/saml/metadata`)}>
                        <CopyIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Assertion Consumer Service URL"
                      secondary={`${window.location.origin}/api/auth/saml/callback`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => copyToClipboard(`${window.location.origin}/api/auth/saml/callback`)}>
                        <CopyIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Single Logout URL"
                      secondary={`${window.location.origin}/api/auth/saml/logout`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => copyToClipboard(`${window.location.origin}/api/auth/saml/logout`)}>
                        <CopyIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSAMLMetadata}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Download SAML Metadata
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  OAuth Redirect URIs
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Add these redirect URIs to your OAuth provider
                </Alert>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Authorization Callback"
                      secondary={`${window.location.origin}/api/auth/oauth/callback`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => copyToClipboard(`${window.location.origin}/api/auth/oauth/callback`)}>
                        <CopyIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Mobile App Callback"
                      secondary={`${window.location.origin}/api/auth/oauth/mobile`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => copyToClipboard(`${window.location.origin}/api/auth/oauth/mobile`)}>
                        <CopyIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Configuration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProvider?.id ? 'Edit' : 'Add'} {selectedProvider?.type?.toUpperCase()} Provider
        </DialogTitle>
        <DialogContent>
          {selectedProvider?.type === 'saml' ? (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Provider Name"
                value={selectedProvider.name}
                onChange={(e) => setSelectedProvider({ ...selectedProvider, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Entity ID"
                value={samlConfig.entityId}
                onChange={(e) => setSamlConfig({ ...samlConfig, entityId: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="SSO URL"
                value={samlConfig.ssoUrl}
                onChange={(e) => setSamlConfig({ ...samlConfig, ssoUrl: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  X.509 Certificate
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={samlConfig.certificate}
                  onChange={(e) => setSamlConfig({ ...samlConfig, certificate: e.target.value })}
                  placeholder="Paste certificate here or upload file"
                />
                <input
                  type="file"
                  accept=".pem,.crt,.cer"
                  style={{ display: 'none' }}
                  id="cert-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="cert-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload Certificate
                  </Button>
                </label>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Signature Algorithm</InputLabel>
                <Select
                  value={samlConfig.signatureAlgorithm}
                  label="Signature Algorithm"
                  onChange={(e) => setSamlConfig({ ...samlConfig, signatureAlgorithm: e.target.value })}
                >
                  <MenuItem value="sha256">SHA-256</MenuItem>
                  <MenuItem value="sha512">SHA-512</MenuItem>
                </Select>
              </FormControl>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Attribute Mapping</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Email Attribute"
                        value={samlConfig.attributeMapping.email}
                        onChange={(e) => setSamlConfig({
                          ...samlConfig,
                          attributeMapping: { ...samlConfig.attributeMapping, email: e.target.value }
                        })}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Name Attribute"
                        value={samlConfig.attributeMapping.name}
                        onChange={(e) => setSamlConfig({
                          ...samlConfig,
                          attributeMapping: { ...samlConfig.attributeMapping, name: e.target.value }
                        })}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Groups Attribute"
                        value={samlConfig.attributeMapping.groups}
                        onChange={(e) => setSamlConfig({
                          ...samlConfig,
                          attributeMapping: { ...samlConfig.attributeMapping, groups: e.target.value }
                        })}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Provider Name"
                value={selectedProvider?.name || ''}
                onChange={(e) => setSelectedProvider({ ...selectedProvider!, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Client ID"
                value={oauthConfig.clientId}
                onChange={(e) => setOauthConfig({ ...oauthConfig, clientId: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Client Secret"
                type="password"
                value={oauthConfig.clientSecret}
                onChange={(e) => setOauthConfig({ ...oauthConfig, clientSecret: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Authorization URL"
                value={oauthConfig.authorizationUrl}
                onChange={(e) => setOauthConfig({ ...oauthConfig, authorizationUrl: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Token URL"
                value={oauthConfig.tokenUrl}
                onChange={(e) => setOauthConfig({ ...oauthConfig, tokenUrl: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="User Info URL"
                value={oauthConfig.userInfoUrl}
                onChange={(e) => setOauthConfig({ ...oauthConfig, userInfoUrl: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Scope"
                value={oauthConfig.scope}
                onChange={(e) => setOauthConfig({ ...oauthConfig, scope: e.target.value })}
                sx={{ mb: 2 }}
                helperText="Space-separated list of scopes"
              />
            </Box>
          )}

          {testResult && (
            <Alert
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
              onClose={() => setTestResult(null)}
            >
              {testResult.message}
              {testResult.error && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {testResult.error}
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveProvider}
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SSOConfiguration;
