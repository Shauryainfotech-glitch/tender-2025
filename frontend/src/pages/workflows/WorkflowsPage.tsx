import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
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
  TablePagination,
  Avatar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AccountTree,
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Schedule,
  Error,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  dueDate?: string;
  completedDate?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  type: 'tender_approval' | 'contract_review' | 'payment_approval' | 'vendor_onboarding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdDate: string;
  dueDate: string;
  progress: number;
  steps: WorkflowStep[];
  relatedEntity?: {
    type: 'tender' | 'contract' | 'payment' | 'vendor';
    id: string;
    name: string;
  };
}

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'IT Infrastructure Tender Approval',
          description: 'Approval workflow for IT infrastructure procurement tender',
          status: 'active',
          type: 'tender_approval',
          priority: 'high',
          createdBy: 'John Doe',
          createdDate: '2024-01-15',
          dueDate: '2024-01-25',
          progress: 60,
          steps: [
            {
              id: '1',
              name: 'Initial Review',
              status: 'completed',
              assignee: 'Jane Smith',
              completedDate: '2024-01-16',
            },
            {
              id: '2',
              name: 'Technical Evaluation',
              status: 'in_progress',
              assignee: 'Mike Johnson',
              dueDate: '2024-01-20',
            },
            {
              id: '3',
              name: 'Final Approval',
              status: 'pending',
              assignee: 'Sarah Wilson',
              dueDate: '2024-01-25',
            },
          ],
          relatedEntity: {
            type: 'tender',
            id: 'TND-001',
            name: 'IT Infrastructure Upgrade',
          },
        },
        {
          id: '2',
          name: 'Vendor Onboarding Process',
          description: 'Complete onboarding process for new vendor registration',
          status: 'completed',
          type: 'vendor_onboarding',
          priority: 'medium',
          createdBy: 'Alice Brown',
          createdDate: '2024-01-10',
          dueDate: '2024-01-20',
          progress: 100,
          steps: [
            {
              id: '1',
              name: 'Document Verification',
              status: 'completed',
              assignee: 'Bob Davis',
              completedDate: '2024-01-12',
            },
            {
              id: '2',
              name: 'Background Check',
              status: 'completed',
              assignee: 'Carol White',
              completedDate: '2024-01-15',
            },
            {
              id: '3',
              name: 'Final Approval',
              status: 'completed',
              assignee: 'David Lee',
              completedDate: '2024-01-18',
            },
          ],
          relatedEntity: {
            type: 'vendor',
            id: 'VND-001',
            name: 'Tech Solutions Inc.',
          },
        },
        {
          id: '3',
          name: 'Payment Authorization',
          description: 'Multi-level approval for large payment processing',
          status: 'paused',
          type: 'payment_approval',
          priority: 'urgent',
          createdBy: 'Emma Taylor',
          createdDate: '2024-01-18',
          dueDate: '2024-01-22',
          progress: 33,
          steps: [
            {
              id: '1',
              name: 'Finance Review',
              status: 'completed',
              assignee: 'Frank Miller',
              completedDate: '2024-01-19',
            },
            {
              id: '2',
              name: 'Manager Approval',
              status: 'failed',
              assignee: 'Grace Chen',
              dueDate: '2024-01-21',
            },
            {
              id: '3',
              name: 'CFO Approval',
              status: 'pending',
              assignee: 'Henry Wilson',
              dueDate: '2024-01-22',
            },
          ],
          relatedEntity: {
            type: 'payment',
            id: 'PAY-001',
            name: 'Construction Payment #1',
          },
        },
      ];
      setWorkflows(mockWorkflows);
      setLoading(false);
    }, 1000);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, workflow: Workflow) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkflow(workflow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkflow(null);
  };

  const handleView = () => {
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedWorkflow) {
      navigate(`/workflows/${selectedWorkflow.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedWorkflow) {
      setWorkflows(workflows.filter(w => w.id !== selectedWorkflow.id));
      setDeleteDialogOpen(false);
      setSelectedWorkflow(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <Schedule color="primary" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesType = filterType === 'all' || workflow.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedWorkflows = filteredWorkflows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Workflows
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/workflows/create')}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountTree />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Workflows
                  </Typography>
                  <Typography variant="h5">
                    {workflows.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PlayArrow />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active
                  </Typography>
                  <Typography variant="h5">
                    {workflows.filter(w => w.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h5">
                    {workflows.filter(w => w.status === 'completed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Pause />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Paused
                  </Typography>
                  <Typography variant="h5">
                    {workflows.filter(w => w.status === 'paused').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="tender_approval">Tender Approval</MenuItem>
                <MenuItem value="contract_review">Contract Review</MenuItem>
                <MenuItem value="payment_approval">Payment Approval</MenuItem>
                <MenuItem value="vendor_onboarding">Vendor Onboarding</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Workflow</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWorkflows.map((workflow) => (
                <TableRow key={workflow.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {workflow.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workflow.description}
                      </Typography>
                      {workflow.relatedEntity && (
                        <Typography variant="caption" color="text.secondary">
                          Related: {workflow.relatedEntity.name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={workflow.type.replace('_', ' ')} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={workflow.status}
                      color={getStatusColor(workflow.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={workflow.priority}
                      color={getPriorityColor(workflow.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={workflow.progress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {workflow.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{workflow.createdBy}</TableCell>
                  <TableCell>
                    {new Date(workflow.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, workflow)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredWorkflows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit Workflow
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose()}>
          <PlayArrow sx={{ mr: 1 }} />
          Start/Resume
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose()}>
          <Pause sx={{ mr: 1 }} />
          Pause
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Workflow Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Workflow Details: {selectedWorkflow?.name}
        </DialogTitle>
        <DialogContent>
          {selectedWorkflow && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedWorkflow.status}
                    color={getStatusColor(selectedWorkflow.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip
                    label={selectedWorkflow.priority}
                    color={getPriorityColor(selectedWorkflow.priority) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{selectedWorkflow.createdBy}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedWorkflow.dueDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Workflow Steps
              </Typography>
              <Stepper orientation="vertical">
                {selectedWorkflow.steps.map((step, index) => (
                  <Step key={step.id} active={step.status === 'in_progress'} completed={step.status === 'completed'}>
                    <StepLabel
                      error={step.status === 'failed'}
                      icon={getStepStatusIcon(step.status)}
                    >
                      {step.name}
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ pl: 2 }}>
                        {step.assignee && (
                          <Typography variant="body2" color="text.secondary">
                            Assignee: {step.assignee}
                          </Typography>
                        )}
                        {step.dueDate && (
                          <Typography variant="body2" color="text.secondary">
                            Due: {new Date(step.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {step.completedDate && (
                          <Typography variant="body2" color="text.secondary">
                            Completed: {new Date(step.completedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete workflow "{selectedWorkflow?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
