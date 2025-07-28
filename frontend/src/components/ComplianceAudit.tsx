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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip,
  Switch,
  FormGroup,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Policy as PolicyIcon,
  Gavel as GavelIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Assessment as AssessmentIcon,
  Archive as ArchiveIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import complianceService from '../services/complianceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ComplianceChecklist {
  id: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  dueDate: Date;
  completionRate: number;
  lastUpdated: Date;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  evidence?: string[];
  comments?: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high';
}

interface ComplianceRegulation {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  requirements: string[];
  applicableTo: string[];
  effectiveDate: Date;
  status: 'active' | 'draft' | 'expired';
  documents: string[];
  lastReviewed: Date;
}

interface RetentionPolicy {
  id: string;
  documentType: string;
  category: string;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  description: string;
  legalBasis: string;
  autoDelete: boolean;
  archiveAfter?: number;
  notifications: {
    beforeExpiry: number;
    notifyRoles: string[];
  };
  status: 'active' | 'inactive';
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ComplianceAudit: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  // Compliance Checklist State
  const [checklists, setChecklists] = useState<ComplianceChecklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ComplianceChecklist | null>(null);
  const [checklistDialog, setChecklistDialog] = useState(false);
  const [checklistFilter, setChecklistFilter] = useState({ category: '', status: '' });

  // Audit Trail State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState({
    user: '',
    action: '',
    entity: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    severity: ''
  });
  const [auditDetailsDialog, setAuditDetailsDialog] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Regulatory Compliance State
  const [regulations, setRegulations] = useState<ComplianceRegulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<ComplianceRegulation | null>(null);
  const [regulationDialog, setRegulationDialog] = useState(false);
  const [regulationFilter, setRegulationFilter] = useState({ category: '', status: '' });

  // Document Retention State
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  const [policyDialog, setPolicyDialog] = useState(false);
  const [policyFilter, setPolicyFilter] = useState({ category: '', documentType: '' });

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const [checklistsData, auditData, regulationsData, policiesData] = await Promise.all([
        complianceService.getChecklists(),
        complianceService.getAuditLogs(),
        complianceService.getRegulations(),
        complianceService.getRetentionPolicies()
      ]);
      setChecklists(checklistsData);
      setAuditLogs(auditData);
      setRegulations(regulationsData);
      setRetentionPolicies(policiesData);
    } catch (error) {
      showSnackbar('Failed to fetch compliance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Compliance Checklist Functions
  const handleChecklistItemToggle = async (checklistId: string, itemId: string) => {
    try {
      await complianceService.toggleChecklistItem(checklistId, itemId);
      fetchComplianceData();
      showSnackbar('Checklist item updated', 'success');
    } catch (error) {
      showSnackbar('Failed to update checklist item', 'error');
    }
  };

  const handleCreateChecklist = async (data: Partial<ComplianceChecklist>) => {
    try {
      await complianceService.createChecklist(data);
      fetchComplianceData();
      setChecklistDialog(false);
      showSnackbar('Checklist created successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to create checklist', 'error');
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await complianceService.deleteChecklist(id);
        fetchComplianceData();
        showSnackbar('Checklist deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete checklist', 'error');
      }
    }
  };

  // Audit Trail Functions
  const handleExportAuditLogs = async () => {
    try {
      const data = await complianceService.exportAuditLogs(auditFilter);
      // Handle file download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      a.click();
      showSnackbar('Audit logs exported successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to export audit logs', 'error');
    }
  };

  // Regulatory Compliance Functions
  const handleCreateRegulation = async (data: Partial<ComplianceRegulation>) => {
    try {
      await complianceService.createRegulation(data);
      fetchComplianceData();
      setRegulationDialog(false);
      showSnackbar('Regulation created successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to create regulation', 'error');
    }
  };

  const handleUpdateRegulation = async (id: string, data: Partial<ComplianceRegulation>) => {
    try {
      await complianceService.updateRegulation(id, data);
      fetchComplianceData();
      setRegulationDialog(false);
      showSnackbar('Regulation updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update regulation', 'error');
    }
  };

  // Document Retention Functions
  const handleCreatePolicy = async (data: Partial<RetentionPolicy>) => {
    try {
      await complianceService.createRetentionPolicy(data);
      fetchComplianceData();
      setPolicyDialog(false);
      showSnackbar('Retention policy created successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to create retention policy', 'error');
    }
  };

  const handleUpdatePolicy = async (id: string, data: Partial<RetentionPolicy>) => {
    try {
      await complianceService.updateRetentionPolicy(id, data);
      fetchComplianceData();
      setPolicyDialog(false);
      showSnackbar('Retention policy updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update retention policy', 'error');
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this retention policy?')) {
      try {
        await complianceService.deleteRetentionPolicy(id);
        fetchComplianceData();
        showSnackbar('Retention policy deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete retention policy', 'error');
      }
    }
  };

  const renderComplianceChecklist = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Compliance Checklists
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={checklistFilter.category}
            onChange={(e) => setChecklistFilter({ ...checklistFilter, category: e.target.value })}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="tender">Tender</MenuItem>
            <MenuItem value="procurement">Procurement</MenuItem>
            <MenuItem value="financial">Financial</MenuItem>
            <MenuItem value="legal">Legal</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={checklistFilter.status}
            onChange={(e) => setChecklistFilter({ ...checklistFilter, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedChecklist(null);
            setChecklistDialog(true);
          }}
        >
          New Checklist
        </Button>
      </Box>

      <Grid container spacing={3}>
        {checklists
          .filter(checklist => 
            (!checklistFilter.category || checklist.category === checklistFilter.category) &&
            (!checklistFilter.status || checklist.status === checklistFilter.status)
          )
          .map((checklist) => (
          <Grid item xs={12} md={6} key={checklist.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{checklist.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {checklist.category} • Assigned to: {checklist.assignee}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedChecklist(checklist);
                        setChecklistDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteChecklist(checklist.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Completion Progress</Typography>
                    <Typography variant="body2">{checklist.completionRate}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={checklist.completionRate} />
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Checklist Items ({checklist.items.length})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {checklist.items.map((item) => (
                        <ListItem key={item.id}>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={item.completed}
                              onChange={() => handleChecklistItemToggle(checklist.id, item.id)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  {item.description}
                                </Typography>
                                {item.completed && (
                                  <Typography variant="caption" color="success.main">
                                    Completed by {item.completedBy} on {new Date(item.completedAt!).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          {item.required && (
                            <Chip label="Required" size="small" color="error" />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={checklist.status.replace('_', ' ').toUpperCase()}
                    color={
                      checklist.status === 'completed' ? 'success' :
                      checklist.status === 'in_progress' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Due: {new Date(checklist.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAuditTrail = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Audit Trail
        </Typography>
        <TextField
          size="small"
          placeholder="Search user..."
          value={auditFilter.user}
          onChange={(e) => setAuditFilter({ ...auditFilter, user: e.target.value })}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={auditFilter.action}
            onChange={(e) => setAuditFilter({ ...auditFilter, action: e.target.value })}
            label="Action"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="create">Create</MenuItem>
            <MenuItem value="update">Update</MenuItem>
            <MenuItem value="delete">Delete</MenuItem>
            <MenuItem value="view">View</MenuItem>
            <MenuItem value="export">Export</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={auditFilter.severity}
            onChange={(e) => setAuditFilter({ ...auditFilter, severity: e.target.value })}
            label="Severity"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportAuditLogs}
        >
          Export
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs
              .filter(log =>
                (!auditFilter.user || log.user.toLowerCase().includes(auditFilter.user.toLowerCase())) &&
                (!auditFilter.action || log.action === auditFilter.action) &&
                (!auditFilter.severity || log.severity === auditFilter.severity)
              )
              .map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  <Chip
                    label={log.action.toUpperCase()}
                    size="small"
                    color={
                      log.action === 'delete' ? 'error' :
                      log.action === 'create' ? 'success' :
                      log.action === 'update' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>
                  <Chip
                    label={log.severity.toUpperCase()}
                    size="small"
                    color={
                      log.severity === 'high' ? 'error' :
                      log.severity === 'medium' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedAuditLog(log);
                      setAuditDetailsDialog(true);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderRegulatoryCompliance = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Regulatory Compliance
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={regulationFilter.category}
            onChange={(e) => setRegulationFilter({ ...regulationFilter, category: e.target.value })}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="procurement">Procurement</MenuItem>
            <MenuItem value="financial">Financial</MenuItem>
            <MenuItem value="data_protection">Data Protection</MenuItem>
            <MenuItem value="environmental">Environmental</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={regulationFilter.status}
            onChange={(e) => setRegulationFilter({ ...regulationFilter, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedRegulation(null);
            setRegulationDialog(true);
          }}
        >
          Add Regulation
        </Button>
      </Box>

      <Grid container spacing={3}>
        {regulations
          .filter(reg =>
            (!regulationFilter.category || reg.category === regulationFilter.category) &&
            (!regulationFilter.status || reg.status === regulationFilter.status)
          )
          .map((regulation) => (
          <Grid item xs={12} md={6} key={regulation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{regulation.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Code: {regulation.code} • Category: {regulation.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRegulation(regulation);
                        setRegulationDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {regulation.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Key Requirements:
                  </Typography>
                  <List dense>
                    {regulation.requirements.slice(0, 3).map((req, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                    {regulation.requirements.length > 3 && (
                      <ListItem>
                        <ListItemText
                          primary={`+${regulation.requirements.length - 3} more requirements`}
                          primaryTypographyProps={{ color: 'primary', variant: 'body2' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Applicable To:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {regulation.applicableTo.map((item, index) => (
                      <Chip key={index} label={item} size="small" />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Chip
                      label={regulation.status.toUpperCase()}
                      color={
                        regulation.status === 'active' ? 'success' :
                        regulation.status === 'draft' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Effective: {new Date(regulation.effectiveDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last Reviewed: {new Date(regulation.lastReviewed).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDocumentRetention = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Document Retention Policies
        </Typography>
        <TextField
          size="small"
          placeholder="Search document type..."
          value={policyFilter.documentType}
          onChange={(e) => setPolicyFilter({ ...policyFilter, documentType: e.target.value })}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={policyFilter.category}
            onChange={(e) => setPolicyFilter({ ...policyFilter, category: e.target.value })}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="tender">Tender Documents</MenuItem>
            <MenuItem value="contract">Contracts</MenuItem>
            <MenuItem value="financial">Financial Records</MenuItem>
            <MenuItem value="correspondence">Correspondence</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedPolicy(null);
            setPolicyDialog(true);
          }}
        >
          New Policy
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Retention Period</TableCell>
              <TableCell>Archive After</TableCell>
              <TableCell>Auto Delete</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retentionPolicies
              .filter(policy =>
                (!policyFilter.documentType || policy.documentType.toLowerCase().includes(policyFilter.documentType.toLowerCase())) &&
                (!policyFilter.category || policy.category === policyFilter.category)
              )
              .map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {policy.documentType}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {policy.description}
                  </Typography>
                </TableCell>
                <TableCell>{policy.category}</TableCell>
                <TableCell>
                  {policy.retentionPeriod} {policy.retentionUnit}
                </TableCell>
                <TableCell>
                  {policy.archiveAfter ? `${policy.archiveAfter} ${policy.retentionUnit}` : '-'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={policy.autoDelete}
                    disabled
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={policy.status.toUpperCase()}
                    color={policy.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setPolicyDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePolicy(policy.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        {loading && <LinearProgress />}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab
              icon={<CheckBoxIcon />}
              label="Compliance Checklist"
              iconPosition="start"
            />
            <Tab
              icon={<TimelineIcon />}
              label="Audit Trail"
              iconPosition="start"
            />
            <Tab
              icon={<GavelIcon />}
              label="Regulatory Compliance"
              iconPosition="start"
            />
            <Tab
              icon={<ArchiveIcon />}
              label="Document Retention"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderComplianceChecklist()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderAuditTrail()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderRegulatoryCompliance()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderDocumentRetention()}
        </TabPanel>

        {/* Checklist Dialog */}
        <Dialog
          open={checklistDialog}
          onClose={() => setChecklistDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {selectedChecklist ? 'Edit Checklist' : 'Create New Checklist'}
          </DialogTitle>
          <DialogContent>
            {/* Checklist form fields would go here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChecklistDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleCreateChecklist({})}
            >
              {selectedChecklist ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Audit Details Dialog */}
        <Dialog
          open={auditDetailsDialog}
          onClose={() => setAuditDetailsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogContent>
            {selectedAuditLog && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>User:</strong> {selectedAuditLog.user}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Action:</strong> {selectedAuditLog.action}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Entity:</strong> {selectedAuditLog.entity} (ID: {selectedAuditLog.entityId})
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Timestamp:</strong> {new Date(selectedAuditLog.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>IP Address:</strong> {selectedAuditLog.ipAddress}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>User Agent:</strong> {selectedAuditLog.userAgent}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Changes:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedAuditLog.changes, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuditDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Regulation Dialog */}
        <Dialog
          open={regulationDialog}
          onClose={() => setRegulationDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {selectedRegulation ? 'Edit Regulation' : 'Add New Regulation'}
          </DialogTitle>
          <DialogContent>
            {/* Regulation form fields would go here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegulationDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => selectedRegulation ? 
                handleUpdateRegulation(selectedRegulation.id, {}) : 
                handleCreateRegulation({})
              }
            >
              {selectedRegulation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Retention Policy Dialog */}
        <Dialog
          open={policyDialog}
          onClose={() => setPolicyDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {selectedPolicy ? 'Edit Retention Policy' : 'Create New Retention Policy'}
          </DialogTitle>
          <DialogContent>
            {/* Retention policy form fields would go here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPolicyDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => selectedPolicy ?
                handleUpdatePolicy(selectedPolicy.id, {}) :
                handleCreatePolicy({})
              }
            >
              {selectedPolicy ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ComplianceAudit;
