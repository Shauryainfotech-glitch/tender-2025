import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TextFields as TextIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  CalendarToday as DateIcon,
  AttachFile as FileIcon,
  FormatListNumbered as NumberIcon,
  ArrowDropDown as DropdownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
      id={`custom-fields-tabpanel-${index}`}
      aria-labelledby={`custom-fields-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const fieldTypes = [
  { value: 'text', label: 'Text', icon: <TextIcon /> },
  { value: 'number', label: 'Number', icon: <NumberIcon /> },
  { value: 'date', label: 'Date', icon: <DateIcon /> },
  { value: 'select', label: 'Dropdown', icon: <DropdownIcon /> },
  { value: 'radio', label: 'Radio', icon: <RadioIcon /> },
  { value: 'checkbox', label: 'Checkbox', icon: <CheckboxIcon /> },
  { value: 'file', label: 'File Upload', icon: <FileIcon /> },
];

const modules = [
  { value: 'tender', label: 'Tender' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'contract', label: 'Contract' },
  { value: 'payment', label: 'Payment' },
  { value: 'emd', label: 'EMD' },
];

const CustomFieldsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Form states
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldModule, setFieldModule] = useState('tender');
  const [fieldDescription, setFieldDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);
  const [options, setOptions] = useState<string[]>(['']);
  const [validation, setValidation] = useState({
    minLength: '',
    maxLength: '',
    pattern: '',
    min: '',
    max: '',
  });

  // Mock data
  const [customFields, setCustomFields] = useState([
    {
      id: '1',
      name: 'project_code',
      label: 'Project Code',
      type: 'text',
      module: 'tender',
      description: 'Unique project identifier',
      required: true,
      searchable: true,
      order: 1,
      createdAt: new Date('2024-01-15'),
      usageCount: 45,
    },
    {
      id: '2',
      name: 'budget_category',
      label: 'Budget Category',
      type: 'select',
      module: 'tender',
      description: 'Budget classification',
      required: false,
      searchable: true,
      options: ['Capital', 'Operational', 'Maintenance'],
      order: 2,
      createdAt: new Date('2024-01-20'),
      usageCount: 38,
    },
    {
      id: '3',
      name: 'vendor_rating',
      label: 'Vendor Rating',
      type: 'number',
      module: 'vendor',
      description: 'Performance rating (1-5)',
      required: false,
      searchable: false,
      validation: { min: 1, max: 5 },
      order: 1,
      createdAt: new Date('2024-01-25'),
      usageCount: 22,
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddField = () => {
    setEditingField(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldModule(field.module);
    setFieldDescription(field.description || '');
    setIsRequired(field.required);
    setIsSearchable(field.searchable);
    setOptions(field.options || ['']);
    setValidation(field.validation || {
      minLength: '',
      maxLength: '',
      pattern: '',
      min: '',
      max: '',
    });
    setOpenDialog(true);
    handleCloseMenu();
  };

  const handleDeleteField = (field: any) => {
    // Handle delete
    console.log('Delete field:', field);
    handleCloseMenu();
  };

  const handleSaveField = () => {
    const newField = {
      id: editingField?.id || Date.now().toString(),
      name: fieldName,
      label: fieldLabel,
      type: fieldType,
      module: fieldModule,
      description: fieldDescription,
      required: isRequired,
      searchable: isSearchable,
      options: fieldType === 'select' || fieldType === 'radio' ? options.filter(o => o) : undefined,
      validation: validation,
      order: editingField?.order || customFields.length + 1,
      createdAt: editingField?.createdAt || new Date(),
      usageCount: editingField?.usageCount || 0,
    };

    if (editingField) {
      setCustomFields(customFields.map(f => f.id === editingField.id ? newField : f));
    } else {
      setCustomFields([...customFields, newField]);
    }

    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFieldName('');
    setFieldLabel('');
    setFieldType('text');
    setFieldModule('tender');
    setFieldDescription('');
    setIsRequired(false);
    setIsSearchable(false);
    setOptions(['']);
    setValidation({
      minLength: '',
      maxLength: '',
      pattern: '',
      min: '',
      max: '',
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, field: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedField(field);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedField(null);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const getFieldsByModule = (module: string) => {
    return customFields.filter(f => f.module === module);
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || <TextIcon />;
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(customFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setCustomFields(updatedItems);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Custom Fields Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddField}
          >
            Add Custom Field
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Fields
                </Typography>
                <Typography variant="h4">
                  {customFields.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Modules
                </Typography>
                <Typography variant="h4">
                  {new Set(customFields.map(f => f.module)).size}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Required Fields
                </Typography>
                <Typography variant="h4">
                  {customFields.filter(f => f.required).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Searchable Fields
                </Typography>
                <Typography variant="h4">
                  {customFields.filter(f => f.searchable).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Fields" />
            <Tab label="By Module" />
            <Tab label="Field Templates" />
          </Tabs>
        </Box>

        {/* All Fields Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search fields..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {customFields
                    .filter(field => 
                      field.name.toLowerCase().includes(searchText.toLowerCase()) ||
                      field.label.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 1,
                              bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box sx={{ mr: 2 }}>
                                {getFieldIcon(field.type)}
                              </Box>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1">{field.label}</Typography>
                                    <Chip label={field.module} size="small" />
                                    {field.required && <Chip label="Required" size="small" color="error" />}
                                    {field.searchable && <Chip label="Searchable" size="small" color="primary" />}
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Name: {field.name} • Type: {field.type} • Used {field.usageCount} times
                                    </Typography>
                                    {field.description && (
                                      <Typography variant="caption" color="text.secondary">
                                        {field.description}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </Box>
                            <ListItemSecondaryAction>
                              <IconButton onClick={(e) => handleMenuClick(e, field)}>
                                <MoreVertIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </TabPanel>

        {/* By Module Tab */}
        <TabPanel value={tabValue} index={1}>
          {modules.map((module) => (
            <Box key={module.value} sx={{ mb: 2 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedModule(expandedModule === module.value ? null : module.value)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">{module.label}</Typography>
                      <Chip label={getFieldsByModule(module.value).length} size="small" />
                    </Box>
                    {expandedModule === module.value ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  <Collapse in={expandedModule === module.value}>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      {getFieldsByModule(module.value).map((field) => (
                        <ListItem key={field.id} sx={{ pl: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ mr: 2 }}>
                              {getFieldIcon(field.type)}
                            </Box>
                            <ListItemText
                              primary={field.label}
                              secondary={`${field.name} • ${field.type}`}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {field.required && <Chip label="Required" size="small" color="error" />}
                              {field.searchable && <Chip label="Searchable" size="small" color="primary" />}
                            </Box>
                          </Box>
                          <ListItemSecondaryAction>
                            <IconButton size="small" onClick={() => handleEditField(field)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteField(field)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          ))}
        </TabPanel>

        {/* Field Templates Tab */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Field templates help you quickly create commonly used custom fields
          </Alert>
          <Grid container spacing={2}>
            {[
              { name: 'GST Number', type: 'text', pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$' },
              { name: 'PAN Number', type: 'text', pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}' },
              { name: 'Phone Number', type: 'text', pattern: '^[+]?[0-9]{10,13}$' },
              { name: 'Email', type: 'text', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
              { name: 'Website URL', type: 'text', pattern: '^https?://.+' },
              { name: 'Pincode', type: 'text', pattern: '^[0-9]{6}$' },
            ].map((template) => (
              <Grid item xs={12} md={6} key={template.name}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Type: {template.type}
                    </Typography>
                    {template.pattern && (
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        Pattern: {template.pattern}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>
                      Use Template
                    </Button>
                    <Button size="small" startIcon={<CopyIcon />}>
                      Copy Pattern
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                helperText="Unique identifier (no spaces, lowercase)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Label"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                helperText="Display name for users"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  label="Field Type"
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={fieldModule}
                  onChange={(e) => setFieldModule(e.target.value)}
                  label="Module"
                >
                  {modules.map((module) => (
                    <MenuItem key={module.value} value={module.value}>
                      {module.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={fieldDescription}
                onChange={(e) => setFieldDescription(e.target.value)}
              />
            </Grid>

            {/* Options for select/radio */}
            {(fieldType === 'select' || fieldType === 'radio') && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Options
                </Typography>
                {options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <IconButton onClick={() => removeOption(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button size="small" startIcon={<AddIcon />} onClick={addOption}>
                  Add Option
                </Button>
              </Grid>
            )}

            {/* Validation Rules */}
            {fieldType === 'text' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Min Length"
                    type="number"
                    value={validation.minLength}
                    onChange={(e) => setValidation({ ...validation, minLength: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Length"
                    type="number"
                    value={validation.maxLength}
                    onChange={(e) => setValidation({ ...validation, maxLength: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pattern (RegEx)"
                    value={validation.pattern}
                    onChange={(e) => setValidation({ ...validation, pattern: e.target.value })}
                    helperText="Regular expression for validation"
                  />
                </Grid>
              </>
            )}

            {fieldType === 'number' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Min Value"
                    type="number"
                    value={validation.min}
                    onChange={(e) => setValidation({ ...validation, min: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Value"
                    type="number"
                    value={validation.max}
                    onChange={(e) => setValidation({ ...validation, max: e.target.value })}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                  />
                }
                label="Required Field"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isSearchable}
                    onChange={(e) => setIsSearchable(e.target.checked)}
                  />
                }
                label="Searchable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveField}
            disabled={!fieldName || !fieldLabel}
          >
            {editingField ? 'Update' : 'Create'} Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditField(selectedField)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteField(selectedField)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem onClick={() => console.log('Duplicate:', selectedField)}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomFieldsManagement;
