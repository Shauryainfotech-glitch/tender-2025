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
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  AttachFile as AttachIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon,
  Schedule as ScheduleIcon,
  Drafts as DraftIcon,
  Inbox as InboxIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Label as LabelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import RichTextEditor from 'react-rte';
import { format } from 'date-fns';
import { communicationService } from '../../services/communicationService';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: TemplateVariable[];
  attachments?: EmailAttachment[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'list';
  defaultValue?: string;
  required: boolean;
}

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  type: 'to' | 'cc' | 'bcc';
}

interface EmailDraft {
  id?: string;
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  body: string;
  attachments: File[];
  templateId?: string;
  variables?: Record<string, any>;
  scheduledAt?: Date;
  priority: 'low' | 'normal' | 'high';
  trackOpens: boolean;
  trackClicks: boolean;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | 'scheduled';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  error?: string;
  template?: string;
}

const EmailIntegration: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    attachments: [],
    priority: 'normal',
    trackOpens: true,
    trackClicks: true,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: '',
    variables: [] as TemplateVariable[],
  });

  const categories = [
    'Welcome',
    'Tender Invitation',
    'Tender Update',
    'Tender Result',
    'Vendor Registration',
    'Document Request',
    'Payment',
    'General',
  ];

  useEffect(() => {
    loadTemplates();
    loadEmailLogs();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await communicationService.getEmailTemplates();
      setTemplates(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadEmailLogs = async () => {
    try {
      const response = await communicationService.getEmailLogs({
        page,
        limit: rowsPerPage,
      });
      setEmailLogs(response.data.logs);
    } catch (err: any) {
      console.error('Failed to load email logs:', err);
    }
  };

  const handleSendEmail = async () => {
    if (emailDraft.to.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    if (!emailDraft.subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', JSON.stringify(emailDraft.to));
      formData.append('cc', JSON.stringify(emailDraft.cc));
      formData.append('bcc', JSON.stringify(emailDraft.bcc));
      formData.append('subject', emailDraft.subject);
      formData.append('body', emailDraft.body);
      formData.append('priority', emailDraft.priority);
      formData.append('trackOpens', String(emailDraft.trackOpens));
      formData.append('trackClicks', String(emailDraft.trackClicks));
      
      if (emailDraft.templateId) {
        formData.append('templateId', emailDraft.templateId);
        formData.append('variables', JSON.stringify(emailDraft.variables));
      }

      if (emailDraft.scheduledAt) {
        formData.append('scheduledAt', emailDraft.scheduledAt.toISOString());
      }

      emailDraft.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await communicationService.sendEmail(formData);
      setSuccess('Email sent successfully');
      resetEmailDraft();
      loadEmailLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (selectedTemplate) {
        await communicationService.updateEmailTemplate(selectedTemplate.id, templateForm);
        setSuccess('Template updated successfully');
      } else {
        await communicationService.createEmailTemplate(templateForm);
        setSuccess('Template created successfully');
      }
      setShowTemplateDialog(false);
      resetTemplateForm();
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await communicationService.deleteEmailTemplate(templateId);
      setSuccess('Template deleted successfully');
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailDraft(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      templateId: template.id,
      variables: template.variables.reduce((acc, variable) => ({
        ...acc,
        [variable.key]: variable.defaultValue || '',
      }), {}),
    }));
    setEditorState(RichTextEditor.createValueFromString(template.body, 'html'));
    setActiveTab(0);
  };

  const handleAddVariable = () => {
    setTemplateForm(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          key: `var_${Date.now()}`,
          label: '',
          type: 'text',
          required: false,
        },
      ],
    }));
  };

  const handleUpdateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleRemoveVariable = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
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

  const resetEmailDraft = () => {
    setEmailDraft({
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: [],
      priority: 'normal',
      trackOpens: true,
      trackClicks: true,
    });
    setEditorState(RichTextEditor.createEmptyValue());
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      body: '',
      category: '',
      variables: [],
    });
    setSelectedTemplate(null);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: EmailLog['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'scheduled':
        return <CalendarIcon color="info" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Email Integration</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                resetTemplateForm();
                setShowTemplateDialog(true);
              }}
              sx={{ mr: 1 }}
            >
              New Template
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setActiveTab(0)}
            >
              Compose Email
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
          <Tab label="Compose" icon={<EditIcon />} />
          <Tab label="Templates" icon={<DraftIcon />} />
          <Tab label="Email Logs" icon={<InboxIcon />} />
        </Tabs>

        {/* Compose Tab */}
        {activeTab === 0 && (
          <Box sx={{ height: 'calc(100% - 48px)', display: 'flex' }}>
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={[]}
                      freeSolo
                      value={emailDraft.to}
                      onChange={(_, value) => setEmailDraft(prev => ({
                        ...prev,
                        to: value.map(v => ({
                          id: `${Date.now()}`,
                          email: typeof v === 'string' ? v : v.email,
                          name: typeof v === 'string' ? v : v.name,
                          type: 'to',
                        })),
                      }))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.email}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="To"
                          placeholder="Enter email addresses"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={[]}
                      freeSolo
                      value={emailDraft.cc}
                      onChange={(_, value) => setEmailDraft(prev => ({
                        ...prev,
                        cc: value.map(v => ({
                          id: `${Date.now()}`,
                          email: typeof v === 'string' ? v : v.email,
                          name: typeof v === 'string' ? v : v.name,
                          type: 'cc',
                        })),
                      }))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.email}
                            size="small"
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="CC"
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={[]}
                      freeSolo
                      value={emailDraft.bcc}
                      onChange={(_, value) => setEmailDraft(prev => ({
                        ...prev,
                        bcc: value.map(v => ({
                          id: `${Date.now()}`,
                          email: typeof v === 'string' ? v : v.email,
                          name: typeof v === 'string' ? v : v.name,
                          type: 'bcc',
                        })),
                      }))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.email}
                            size="small"
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="BCC"
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={emailDraft.subject}
                      onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                      InputProps={{
                        endAdornment: emailDraft.templateId && (
                          <InputAdornment position="end">
                            <Chip
                              label="Using template"
                              size="small"
                              onDelete={() => setEmailDraft(prev => ({ ...prev, templateId: undefined }))}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {emailDraft.templateId && emailDraft.variables && (
                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Template Variables</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            {Object.entries(emailDraft.variables).map(([key, value]) => {
                              const variable = templates
                                .find(t => t.id === emailDraft.templateId)
                                ?.variables.find(v => v.key === key);
                              
                              return (
                                <Grid item xs={12} sm={6} key={key}>
                                  <TextField
                                    fullWidth
                                    label={variable?.label || key}
                                    value={value}
                                    onChange={(e) => setEmailDraft(prev => ({
                                      ...prev,
                                      variables: {
                                        ...prev.variables,
                                        [key]: e.target.value,
                                      },
                                    }))}
                                    required={variable?.required}
                                  />
                                </Grid>
                              );
                            })}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, minHeight: 400 }}>
                      <RichTextEditor
                        value={editorState}
                        onChange={(value) => {
                          setEditorState(value);
                          setEmailDraft(prev => ({ ...prev, body: value.toString('html') }));
                        }}
                        placeholder="Compose your email..."
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        id="email-attachments"
                        onChange={(e) => {
                          if (e.target.files) {
                            setEmailDraft(prev => ({
                              ...prev,
                              attachments: [...prev.attachments, ...Array.from(e.target.files!)],
                            }));
                          }
                        }}
                      />
                      <label htmlFor="email-attachments">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AttachIcon />}
                        >
                          Attach Files
                        </Button>
                      </label>

                      {emailDraft.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => setEmailDraft(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index),
                          }))}
                          icon={file.type.startsWith('image/') ? <ImageIcon /> : <AttachIcon />}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <FormControl size="small">
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={emailDraft.priority}
                          label="Priority"
                          onChange={(e) => setEmailDraft(prev => ({ 
                            ...prev, 
                            priority: e.target.value as EmailDraft['priority'] 
                          }))}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="normal">Normal</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailDraft.trackOpens}
                            onChange={(e) => setEmailDraft(prev => ({ 
                              ...prev, 
                              trackOpens: e.target.checked 
                            }))}
                          />
                        }
                        label="Track Opens"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailDraft.trackClicks}
                            onChange={(e) => setEmailDraft(prev => ({ 
                              ...prev, 
                              trackClicks: e.target.checked 
                            }))}
                          />
                        }
                        label="Track Clicks"
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSendEmail}
                    disabled={sending}
                  >
                    Send
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setShowPreviewDialog(true)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DraftIcon />}
                  >
                    Save Draft
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Template Sidebar */}
            <Paper sx={{ width: 300, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Templates
                </Typography>
                <List dense>
                  {templates.slice(0, 5).map((template) => (
                    <ListItem
                      key={template.id}
                      button
                      onClick={() => handleUseTemplate(template)}
                    >
                      <ListItemIcon>
                        <DraftIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={template.name}
                        secondary={template.category}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Templates Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredTemplates.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" noWrap>
                            {template.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedTemplate(template);
                              setAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Subject: {template.subject}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          {template.variables.map((variable) => (
                            <Chip
                              key={variable.key}
                              label={variable.label}
                              size="small"
                              variant="outlined"
                              icon={<CodeIcon />}
                            />
                          ))}
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <Button
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateForm({
                              name: template.name,
                              subject: template.subject,
                              body: template.body,
                              category: template.category,
                              variables: template.variables,
                            });
                            setShowTemplateDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                        >
                          Preview
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Email Logs Tab */}
        {activeTab === 2 && (
          <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Template</TableCell>
                    <TableCell>Sent At</TableCell>
                    <TableCell>Opened</TableCell>
                    <TableCell>Clicked</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Tooltip title={log.error || log.status}>
                          {getStatusIcon(log.status)}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell>
                        {log.template ? (
                          <Chip label={log.template} size="small" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {log.sentAt ? format(new Date(log.sentAt), 'dd/MM/yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {log.openedAt ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {log.clickedAt ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          '-'
                        )}
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
              <TablePagination
                component="div"
                count={100} // This should come from the API
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Template Dialog */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={templateForm.category}
                  label="Category"
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Variables</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddVariable}
                  >
                    Add Variable
                  </Button>
                </Box>
                {templateForm.variables.map((variable, index) => (
                  <Box key={variable.key} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      label="Key"
                      value={variable.key}
                      onChange={(e) => handleUpdateVariable(index, 'key', e.target.value)}
                    />
                    <TextField
                      size="small"
                      label="Label"
                      value={variable.label}
                      onChange={(e) => handleUpdateVariable(index, 'label', e.target.value)}
                    />
                    <FormControl size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={variable.type}
                        label="Type"
                        onChange={(e) => handleUpdateVariable(index, 'type', e.target.value)}
                      >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="list">List</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={variable.required}
                          onChange={(e) => handleUpdateVariable(index, 'required', e.target.checked)}
                        />
                      }
                      label="Required"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveVariable(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Body"
                value={templateForm.body}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                helperText="Use {{variable_key}} to insert variables"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              To: {emailDraft.to.map(r => r.email).join(', ')}
            </Typography>
            {emailDraft.cc.length > 0 && (
              <Typography variant="subtitle2" gutterBottom>
                CC: {emailDraft.cc.map(r => r.email).join(', ')}
              </Typography>
            )}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {emailDraft.subject}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              dangerouslySetInnerHTML={{
                __html: emailDraft.variables
                  ? processTemplateVariables(emailDraft.body, emailDraft.variables)
                  : emailDraft.body
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog
        open={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule Date & Time"
            value={emailDraft.scheduledAt ? format(emailDraft.scheduledAt, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setEmailDraft(prev => ({
              ...prev,
              scheduledAt: new Date(e.target.value),
            }))}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSendEmail();
              setShowScheduleDialog(false);
            }}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              navigator.clipboard.writeText(selectedTemplate.body);
              setSuccess('Template copied to clipboard');
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          <ListItemText primary="Copy" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              handleDeleteTemplate(selectedTemplate.id);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
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

export default EmailIntegration;
