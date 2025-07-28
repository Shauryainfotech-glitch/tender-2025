import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

const RoleManagement: React.FC = () => {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Mock data
  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      userCount: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01'),
      isSystem: true,
    },
    {
      id: '2',
      name: 'Vendor',
      description: 'Can participate in tenders and submit bids',
      permissions: ['3', '4', '7'],
      userCount: 150,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-15'),
      isSystem: true,
    },
    {
      id: '3',
      name: 'Evaluator',
      description: 'Can evaluate bids and provide recommendations',
      permissions: ['3', '5', '6'],
      userCount: 20,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-10-20'),
      isSystem: false,
    },
    {
      id: '4',
      name: 'Approver',
      description: 'Can approve tenders and contracts',
      permissions: ['3', '6', '8', '9'],
      userCount: 10,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-12-10'),
      isSystem: false,
    },
  ]);

  const permissions: Permission[] = [
    {
      id: '1',
      name: 'User Management',
      description: 'Manage system users',
      module: 'Administration',
      actions: ['Create', 'Read', 'Update', 'Delete'],
    },
    {
      id: '2',
      name: 'Role Management',
      description: 'Manage user roles and permissions',
      module: 'Administration',
      actions: ['Create', 'Read', 'Update', 'Delete'],
    },
    {
      id: '3',
      name: 'View Tenders',
      description: 'View tender listings',
      module: 'Tenders',
      actions: ['Read'],
    },
    {
      id: '4',
      name: 'Create Tenders',
      description: 'Create new tenders',
      module: 'Tenders',
      actions: ['Create', 'Update'],
    },
    {
      id: '5',
      name: 'Manage Bids',
      description: 'Submit and manage bids',
      module: 'Bids',
      actions: ['Create', 'Read', 'Update'],
    },
    {
      id: '6',
      name: 'Evaluate Bids',
      description: 'Evaluate submitted bids',
      module: 'Bids',
      actions: ['Read', 'Update'],
    },
    {
      id: '7',
      name: 'View Organizations',
      description: 'View organization profiles',
      module: 'Organizations',
      actions: ['Read'],
    },
    {
      id: '8',
      name: 'Manage Contracts',
      description: 'Create and manage contracts',
      module: 'Contracts',
      actions: ['Create', 'Read', 'Update', 'Delete'],
    },
    {
      id: '9',
      name: 'Approve Contracts',
      description: 'Approve contract documents',
      module: 'Contracts',
      actions: ['Update'],
    },
    {
      id: '10',
      name: 'System Configuration',
      description: 'Configure system settings',
      module: 'Administration',
      actions: ['Read', 'Update'],
    },
  ];

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions);
    setRoleDialogOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setRoleDialogOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSaveRole = () => {
    // Handle save
    setRoleDialogOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrator':
        return <SecurityIcon />;
      case 'vendor':
        return <GroupIcon />;
      case 'evaluator':
        return <AssignmentIcon />;
      default:
        return <GroupIcon />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Role Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Define roles and their permissions for system access control
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRole}
          >
            Create Role
          </Button>
        </Box>
      </Box>

      {/* Roles Grid */}
      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} sm={6} md={4} key={role.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getRoleIcon(role.name)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {role.name}
                    </Typography>
                  </Box>
                  {role.isSystem && (
                    <Chip label="System" size="small" color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {role.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Permissions: {role.permissions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users: {role.userCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Updated {format(role.updatedAt, 'dd MMM yyyy')}
                  </Typography>
                  <Box>
                    <Tooltip title={role.isSystem ? "System roles cannot be deleted" : "Delete role"}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={role.isSystem}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => handleEditRole(role)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Role Dialog */}
      <Dialog 
        open={roleDialogOpen} 
        onClose={() => setRoleDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  defaultValue={editingRole?.name}
                  placeholder="e.g., Finance Manager"
                  InputProps={{
                    startAdornment: <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  defaultValue={editingRole?.description}
                  placeholder="Describe the role's responsibilities..."
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select the permissions this role should have access to
                </Alert>
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <Accordion key={module} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">{module}</Typography>
                      <Chip 
                        label={`${modulePermissions.filter(p => selectedPermissions.includes(p.id)).length}/${modulePermissions.length}`}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {modulePermissions.map((permission) => (
                          <ListItem key={permission.id}>
                            <ListItemText
                              primary={permission.name}
                              secondary={
                                <Box>
                                  <Typography variant="caption">
                                    {permission.description}
                                  </Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {permission.actions.map((action) => (
                                      <Chip
                                        key={action}
                                        label={action}
                                        size="small"
                                        sx={{ mr: 0.5, mb: 0.5 }}
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Checkbox
                                edge="end"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id)}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
