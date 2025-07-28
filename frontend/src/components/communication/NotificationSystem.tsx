import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  Badge,
  Tooltip,
  InputAdornment,
  Autocomplete,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsActive as ActiveNotificationIcon,
  NotificationsOff as MutedIcon,
  Sms as SmsIcon,
  PhoneAndroid as PhoneIcon,
  Campaign as AnnouncementIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Timer as TimerIcon,
  Devices as DevicesIcon,
  Language as LanguageIcon,
  MoreVert as MoreIcon,
  Preview as PreviewIcon,
  ContentCopy as CopyIcon,
  Archive as ArchiveIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { communicationService } from '../../services/communicationService';

interface NotificationChannel {
  id: string;
  type: 'sms' | 'push' | 'in-app';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'sms' | 'push' | 'in-app' | 'announcement';
  title?: string;
  content: string;
  variables: TemplateVariable[];
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
  defaultValue?: string;
}

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  deviceTokens?: string[];
  preferences: {
    sms: boolean;
    push: boolean;
    inApp: boolean;
    email: boolean;
  };
}

interface RecipientGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  criteria?: any;
  isStatic: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  targetAudience: 'all' | 'vendors' | 'staff' | 'custom';
  targetGroups?: string[];
  publishedAt?: Date;
  expiresAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'expired' | 'archived';
  viewCount: number;
  attachments?: any[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface NotificationLog {
  id: string;
  channel: string;
  recipient: string;
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  error?: string;
}

const NotificationSystem: React.FC = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'push' | 'in-app' | 'announcement'>('push');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [notificationForm, setNotificationForm] = useState({
    channel: 'push' as 'sms' | 'push' | 'in-app',
    recipients: [] as string[],
    recipientGroups: [] as string[],
    title: '',
    content: '',
    templateId: '',
    variables: {} as Record<string, any>,
    scheduledAt: null as Date | null,
    priority: 'normal',
    attachments: [] as File[],
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as Announcement['priority'],
    category: '',
    targetAudience: 'all' as Announcement['targetAudience'],
    targetGroups: [] as string[],
    publishedAt: null as Date | null,
    expiresAt: null as Date | null,
    attachments: [] as File[],
  });

  const categories = [
    'General',
    'Tender Updates',
    'System Maintenance',
    'Policy Changes',
    'Training',
    'Events',
    'Urgent',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        channelsRes,
        templatesRes,
        recipientsRes,
        groupsRes,
        announcementsRes,
        logsRes,
      ] = await Promise.all([
        communicationService.getNotificationChannels(),
        communicationService.getNotificationTemplates(),
        communicationService.getRecipients(),
        communicationService.getRecipientGroups(),
        communicationService.getAnnouncements(),
        communicationService.getNotificationLogs(),
      ]);

      setChannels(channelsRes.data);
      setTemplates(templatesRes.data);
      setRecipients(recipientsRes.data);
      setRecipientGroups(groupsRes.data);
      setAnnouncements(announcementsRes.data);
      setNotificationLogs(logsRes.data);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (notificationForm.recipients.length === 0 && notificationForm.recipientGroups.length === 0) {
      setError('Please select recipients or recipient groups');
      return;
    }

    if (!notificationForm.content.trim()) {
      setError('Please enter notification content');
      return;
    }

    try {
      const data = {
        ...notificationForm,
        content: notificationForm.templateId
          ? processTemplateVariables(notificationForm.content, notificationForm.variables)
          : notificationForm.content,
      };

      await communicationService.sendNotification(data);
      setSuccess('Notification sent successfully');
      setShowComposeDialog(false);
      resetNotificationForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send notification');
    }
  };

  const handlePublishAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (selectedAnnouncement) {
        await communicationService.updateAnnouncement(selectedAnnouncement.id, announcementForm);
        setSuccess('Announcement updated successfully');
      } else {
        await communicationService.createAnnouncement(announcementForm);
        setSuccess('Announcement published successfully');
      }
      setShowAnnouncementDialog(false);
      resetAnnouncementForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await communicationService.deleteAnnouncement(id);
      setSuccess('Announcement deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleArchiveAnnouncement = async (id: string) => {
    try {
      await communicationService.archiveAnnouncement(id);
      setSuccess('Announcement archived successfully');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive announcement');
    }
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    setNotificationForm(prev => ({
      ...prev,
      channel: template.channel as any,
      title: template.title || '',
      content: template.content,
      templateId: template.id,
      variables: template.variables.reduce((acc, variable) => ({
        ...acc,
        [variable.key]: variable.defaultValue || '',
      }), {}),
    }));
  };

  const processTemplateVariables = (text: string, variables: Record<string, any>) => {
    let processedText = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedText = processedText.replace(regex, value);
    });
    return processedText;
  };

  const resetNotificationForm = () => {
    setNotificationForm({
      channel: 'push',
      recipients: [],
      recipientGroups: [],
      title: '',
      content: '',
      templateId: '',
      variables: {},
      scheduledAt: null,
      priority: 'normal',
      attachments: [],
    });
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      priority: 'normal',
      category: '',
      targetAudience: 'all',
      targetGroups: [],
      publishedAt: null,
      expiresAt: null,
      attachments: [],
    });
    setSelectedAnnouncement(null);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <SmsIcon />;
      case 'push':
        return <PhoneIcon />;
      case 'in-app':
        return <NotificationIcon />;
      case 'announcement':
        return <AnnouncementIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'published':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
      case 'scheduled':
        return <ScheduleIcon color="warning" />;
      case 'draft':
        return <EditIcon color="action" />;
      case 'expired':
      case 'archived':
        return <ArchiveIcon color="disabled" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Notification System</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettingsDialog(true)}
              sx={{ mr: 1 }}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setShowComposeDialog(true)}
            >
              Send Notification
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<NotificationIcon />} />
          <Tab label="SMS" icon={<SmsIcon />} />
          <Tab label="Push Notifications" icon={<PhoneIcon />} />
          <Tab label="Announcements" icon={<AnnouncementIcon />} />
          <Tab label="Templates" icon={<ContentCopy />} />
          <Tab label="Logs" icon={<InfoIcon />} />
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Grid container spacing={3}>
              {/* Channel Statistics */}
              {channels.map((channel) => (
                <Grid item xs={12} md={4} key={channel.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getChannelIcon(channel.type)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {channel.name}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <Switch
                            checked={channel.enabled}
                            onChange={async (e) => {
                              try {
                                await communicationService.updateChannelStatus(
                                  channel.id,
                                  e.target.checked
                                );
                                loadData();
                              } catch (err) {
                                setError('Failed to update channel status');
                              }
                            }}
                          />
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Sent
                          </Typography>
                          <Typography variant="h4">
                            {channel.stats.sent.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Delivered
                          </Typography>
                          <Typography variant="h4">
                            {channel.stats.delivered.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Failed
                          </Typography>
                          <Typography variant="h4" color="error">
                            {channel.stats.failed.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Success Rate
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {channel.stats.sent > 0
                              ? `${((channel.stats.delivered / channel.stats.sent) * 100).toFixed(1)}%`
                              : '0%'}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Delivery Rate
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={
                            channel.stats.sent > 0
                              ? (channel.stats.delivered / channel.stats.sent) * 100
                              : 0
                          }
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Recent Notifications */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Notifications
                    </Typography>
                    <List>
                      {notificationLogs.slice(0, 5).map((log) => (
                        <ListItem key={log.id} divider>
                          <ListItemIcon>
                            {getChannelIcon(log.channel)}
                          </ListItemIcon>
                          <ListItemText
                            primary={log.subject || log.content.substring(0, 50) + '...'}
                            secondary={
                              <Box>
                                <Typography variant="caption" component="span">
                                  To: {log.recipient}
                                </Typography>
                                {log.sentAt && (
                                  <Typography variant="caption" component="span" sx={{ ml: 2 }}>
                                    {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            {getStatusIcon(log.status)}
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* SMS Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      SMS Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SMS Provider"
                          value="Twilio"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Sender ID"
                          value="TENDER-MGT"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Default SMS Template"
                          placeholder="Hi {{name}}, {{message}}"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained">Save Configuration</Button>
                    <Button variant="outlined">Test SMS</Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      SMS Statistics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Daily Limit"
                          secondary="1,000 SMS"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Sent Today"
                          secondary="234 SMS"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Average Delivery Time"
                          secondary="2.3 seconds"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Push Notifications Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Push Notification Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormGroup>
                          <FormControlLabel
                            control={<Switch defaultChecked />}
                            label="Enable push notifications"
                          />
                          <FormControlLabel
                            control={<Switch defaultChecked />}
                            label="Send to offline users"
                          />
                          <FormControlLabel
                            control={<Switch />}
                            label="Include image attachments"
                          />
                          <FormControlLabel
                            control={<Switch defaultChecked />}
                            label="Show notification badge"
                          />
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Default Sound"
                          select
                          value="default"
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="notification1">Notification 1</MenuItem>
                          <MenuItem value="notification2">Notification 2</MenuItem>
                          <MenuItem value="silent">Silent</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained">Save Settings</Button>
                    <Button variant="outlined">Send Test Push</Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Device Statistics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <DevicesIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Devices"
                          secondary="1,234"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="iOS Devices"
                          secondary="567 (46%)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Android Devices"
                          secondary="667 (54%)"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Announcements Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">System Announcements</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetAnnouncementForm();
                  setShowAnnouncementDialog(true);
                }}
              >
                New Announcement
              </Button>
            </Box>

            <Grid container spacing={3}>
              {announcements.map((announcement) => (
                <Grid item xs={12} key={announcement.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6">
                              {announcement.title}
                            </Typography>
                            <Chip
                              label={announcement.priority}
                              size="small"
                              color={getPriorityColor(announcement.priority)}
                            />
                            <Chip
                              label={announcement.category}
                              size="small"
                              variant="outlined"
                            />
                            {getStatusIcon(announcement.status)}
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {announcement.content}
                          </Typography>

                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Avatar
                                src={announcement.author.avatar}
                                sx={{ width: 24, height: 24 }}
                              >
                                {announcement.author.name[0]}
                              </Avatar>
                              <Typography variant="caption">
                                {announcement.author.name}
                              </Typography>
                            </Box>

                            {announcement.publishedAt && (
                              <Typography variant="caption" color="text.secondary">
                                Published {formatDistanceToNow(new Date(announcement.publishedAt), {
                                  addSuffix: true,
                                })}
                              </Typography>
                            )}

                            <Typography variant="caption" color="text.secondary">
                              {announcement.viewCount} views
                            </Typography>

                            <Chip
                              label={`Target: ${announcement.targetAudience}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <IconButton
                          onClick={(e) => {
                            setSelectedAnnouncement(announcement);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Templates Tab */}
        {activeTab === 4 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Notification Templates</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowTemplateDialog(true)}
              >
                New Template
              </Button>
            </Box>

            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getChannelIcon(template.channel)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {template.name}
                        </Typography>
                      </Box>

                      <Chip
                        label={template.category}
                        size="small"
                        sx={{ mb: 1 }}
                      />

                      {template.title && (
                        <Typography variant="subtitle2" gutterBottom>
                          {template.title}
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {template.content}
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }}>
                        {template.variables.map((variable) => (
                          <Chip
                            key={variable.key}
                            label={variable.label}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Used {template.usageCount} times
                        </Typography>
                        <Chip
                          label={template.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={template.isActive ? 'success' : 'default'}
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleUseTemplate(template)}>
                        Use
                      </Button>
                      <Button size="small">Edit</Button>
                      <Button size="small">Preview</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Logs Tab */}
        {activeTab === 5 && (
          <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Channel</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sent At</TableCell>
                    <TableCell>Delivered At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notificationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getChannelIcon(log.channel)}</TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {log.content}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusIcon(log.status)}</TableCell>
                      <TableCell>
                        {log.sentAt
                          ? format(new Date(log.sentAt), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {log.deliveredAt
                          ? format(new Date(log.deliveredAt), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Send Notification Dialog */}
      <Dialog
        open={showComposeDialog}
        onClose={() => setShowComposeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={notificationForm.channel}
                  onChange={(e) => setNotificationForm(prev => ({
                    ...prev,
                    channel: e.target.value as any,
                  }))}
                >
                  <FormControlLabel value="sms" control={<Radio />} label="SMS" />
                  <FormControlLabel value="push" control={<Radio />} label="Push Notification" />
                  <FormControlLabel value="in-app" control={<Radio />} label="In-App" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={recipients}
                getOptionLabel={(option) => option.name}
                value={recipients.filter(r => notificationForm.recipients.includes(r.id))}
                onChange={(_, value) => setNotificationForm(prev => ({
                  ...prev,
                  recipients: value.map(v => v.id),
                }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recipients"
                    placeholder="Select recipients"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Recipient Groups</InputLabel>
                <Select
                  multiple
                  value={notificationForm.recipientGroups}
                  onChange={(e) => setNotificationForm(prev => ({
                    ...prev,
                    recipientGroups: e.target.value as string[],
                  }))}
                  label="Recipient Groups"
                >
                  {recipientGroups.map(group => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name} ({group.memberCount} members)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {notificationForm.channel === 'push' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={notificationForm.content}
                onChange={(e) => setNotificationForm(prev => ({
                  ...prev,
                  content: e.target.value,
                }))}
                helperText={
                  notificationForm.channel === 'sms'
                    ? `${notificationForm.content.length}/160 characters`
                    : ''
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={notificationForm.priority}
                    label="Priority"
                    onChange={(e) => setNotificationForm(prev => ({
                      ...prev,
                      priority: e.target.value,
                    }))}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  type="datetime-local"
                  label="Schedule"
                  InputLabelProps={{ shrink: true }}
                  value={
                    notificationForm.scheduledAt
                      ? format(notificationForm.scheduledAt, "yyyy-MM-dd'T'HH:mm")
                      : ''
                  }
                  onChange={(e) => setNotificationForm(prev => ({
                    ...prev,
                    scheduledAt: e.target.value ? new Date(e.target.value) : null,
                  }))}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComposeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendNotification}>
            {notificationForm.scheduledAt ? 'Schedule' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog
        open={showAnnouncementDialog}
        onClose={() => setShowAnnouncementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({
                  ...prev,
                  title: e.target.value,
                }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({
                  ...prev,
                  content: e.target.value,
                }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={announcementForm.priority}
                  label="Priority"
                  onChange={(e) => setAnnouncementForm(prev => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={announcementForm.category}
                  label="Category"
                  onChange={(e) => setAnnouncementForm(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={announcementForm.targetAudience}
                  label="Target Audience"
                  onChange={(e) => setAnnouncementForm(prev => ({
                    ...prev,
                    targetAudience: e.target.value as any,
                  }))}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="vendors">Vendors Only</MenuItem>
                  <MenuItem value="staff">Staff Only</MenuItem>
                  <MenuItem value="custom">Custom Groups</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {announcementForm.targetAudience === 'custom' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Groups</InputLabel>
                  <Select
                    multiple
                    value={announcementForm.targetGroups}
                    onChange={(e) => setAnnouncementForm(prev => ({
                      ...prev,
                      targetGroups: e.target.value as string[],
                    }))}
                    label="Target Groups"
                  >
                    {recipientGroups.map(group => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Publish At"
                InputLabelProps={{ shrink: true }}
                value={
                  announcementForm.publishedAt
                    ? format(announcementForm.publishedAt, "yyyy-MM-dd'T'HH:mm")
                    : ''
                }
                onChange={(e) => setAnnouncementForm(prev => ({
                  ...prev,
                  publishedAt: e.target.value ? new Date(e.target.value) : null,
                }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expires At"
                InputLabelProps={{ shrink: true }}
                value={
                  announcementForm.expiresAt
                    ? format(announcementForm.expiresAt, "yyyy-MM-dd'T'HH:mm")
                    : ''
                }
                onChange={(e) => setAnnouncementForm(prev => ({
                  ...prev,
                  expiresAt: e.target.value ? new Date(e.target.value) : null,
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnnouncementDialog(false)}>Cancel</Button>
          <Button variant="outlined">Save as Draft</Button>
          <Button variant="contained" onClick={handlePublishAnnouncement}>
            {announcementForm.publishedAt ? 'Schedule' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Tabs value={0}>
            <Tab label="General" />
            <Tab label="Channels" />
            <Tab label="Preferences" />
          </Tabs>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable notification system"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Send notification emails to admins"
              />
              <FormControlLabel
                control={<Switch />}
                label="Enable quiet hours (10 PM - 8 AM)"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Group similar notifications"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Announcement Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedAnnouncement) {
              setAnnouncementForm({
                title: selectedAnnouncement.title,
                content: selectedAnnouncement.content,
                priority: selectedAnnouncement.priority,
                category: selectedAnnouncement.category,
                targetAudience: selectedAnnouncement.targetAudience,
                targetGroups: selectedAnnouncement.targetGroups || [],
                publishedAt: selectedAnnouncement.publishedAt
                  ? new Date(selectedAnnouncement.publishedAt)
                  : null,
                expiresAt: selectedAnnouncement.expiresAt
                  ? new Date(selectedAnnouncement.expiresAt)
                  : null,
                attachments: [],
              });
              setShowAnnouncementDialog(true);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedAnnouncement) {
              handleArchiveAnnouncement(selectedAnnouncement.id);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ArchiveIcon />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedAnnouncement) {
              handleDeleteAnnouncement(selectedAnnouncement.id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Error/Success Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default NotificationSystem;
