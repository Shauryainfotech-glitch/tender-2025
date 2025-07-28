import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  Stack,
  Tooltip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  FormHelperText,
  Checkbox,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  AttachFile as FileIcon,
  Palette as ColorIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Field type configurations
const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text', icon: <TextIcon /> },
  { value: 'NUMBER', label: 'Number', icon: <NumberIcon /> },
  { value: 'DATE', label: 'Date', icon: <DateIcon /> },
  { value: 'DATETIME', label: 'Date & Time', icon: <DateIcon /> },
  { value: 'BOOLEAN', label: 'Yes/No', icon: <CheckboxIcon /> },
  { value: 'SELECT', label: 'Dropdown', icon: <RadioIcon /> },
  { value: 'MULTISELECT', label: 'Multi-Select', icon: <CheckboxIcon /> },
  { value: 'RADIO', label: 'Radio Buttons', icon: <RadioIcon /> },
  { value: 'CHECKBOX', label: 'Checkboxes', icon: <CheckboxIcon /> },
  { value: 'TEXTAREA', label: 'Text Area', icon: <TextIcon /> },
  { value: 'EMAIL', label: 'Email', icon: <EmailIcon /> },
  { value: 'PHONE', label: 'Phone', icon: <PhoneIcon /> },
  { value: 'URL', label: 'URL', icon: <LinkIcon /> },
  { value: 'FILE', label: 'File Upload', icon: <FileIcon /> },
  { value: 'IMAGE', label: 'Image Upload', icon: <FileIcon /> },
  { value: 'CURRENCY', label: 'Currency', icon: <NumberIcon /> },
  { value: 'PERCENTAGE', label: 'Percentage', icon: <NumberIcon /> },
  { value: 'JSON', label: 'JSON', icon: <CodeIcon /> },
  { value: 'RICH_TEXT', label: 'Rich Text', icon: <TextIcon /> },
  { value: 'COLOR', label: 'Color Picker', icon: <ColorIcon /> },
  { value: 'RATING', label: 'Rating', icon: <NumberIcon /> },
  { value: 'SLIDER', label: 'Slider', icon: <NumberIcon /> },
  { value: 'ADDRESS', label: 'Address', icon: <LocationIcon /> },
  { value: 'LOCATION', label: 'Location', icon: <LocationIcon /> },
  { value: 'SIGNATURE', label: 'Signature', icon: <TextIcon /> },
];

const ENTITY_TYPES = [
  'TENDER',
  'BID',
  'ORGANIZATION',
  'USER',
  'EMD',
  'DOCUMENT',
  'CONTRACT',
  'VENDOR',
];

interface CustomField {
  id?: number;
  fieldName: string;
  displayName: string;
  description?: string;
  fieldType: string;
  entityType: string;
  section?: string;
  options?: any;
  validation?: any;
  conditionalLogic?: any;
  isRequired?: boolean;
  isUnique?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  isEditable?: boolean;
  isVisible?: boolean;
  displayOrder?: number;
  helpText?: string;
  tooltip?: string;
  displaySettings?: any;
}

export const CustomFieldsConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState('TENDER');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [conditionalLogicDialogOpen, setConditionalLogicDialogOpen] = useState(false);

  // Field form state
  const [fieldForm, setFieldForm] = useState<CustomField>({
    fieldName: '',
    displayName: '',
    fieldType: 'TEXT',
    entityType: 'TENDER',
    isRequired: false,
    isVisible: true,
    isEditable: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFieldTypeSelect = (fieldType: string) => {
    setFieldForm({ ...fieldForm, fieldType });
    setFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (editingField) {
      // Update existing field
      setFields(fields.map(f => 
        f.id === editingField.id ? { ...fieldForm, id: editingField.id } : f
      ));
    } else {
      // Add new field
      setFields([...fields, { ...fieldForm, id: Date.now(), displayOrder: fields.length }]);
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setFieldDialogOpen(false);
    setEditingField(null);
    setFieldForm({
      fieldName: '',
      displayName: '',
      fieldType: 'TEXT',
      entityType: selectedEntity,
      isRequired: false,
      isVisible: true,
      isEditable: true,
    });
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setFieldForm(field);
    setFieldDialogOpen(true);
  };

  const handleDeleteField = (fieldId: number) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index,
    }));

    setFields(updatedItems);
  };

  const renderFieldIcon = (fieldType: string) => {
    const fieldConfig = FIELD_TYPES.find(f => f.value === fieldType);
    return fieldConfig?.icon || <TextIcon />;
  };

  const renderFieldOptions = () => {
    switch (fieldForm.fieldType) {
      case 'SELECT':
      case 'MULTISELECT':
      case 'RADIO':
      case 'CHECKBOX':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Options
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                const options = fieldForm.options?.choices || [];
                setFieldForm({
                  ...fieldForm,
                  options: {
                    ...fieldForm.options,
                    choices: [...options, { value: '', label: '' }],
                  },
                });
              }}
            >
              Add Option
            </Button>
            {fieldForm.options?.choices?.map((option: any, index: number) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  label="Value"
                  value={option.value}
                  onChange={(e) => {
                    const choices = [...fieldForm.options.choices];
                    choices[index].value = e.target.value;
                    setFieldForm({
                      ...fieldForm,
                      options: { ...fieldForm.options, choices },
                    });
                  }}
                />
                <TextField
                  size="small"
                  label="Label"
                  value={option.label}
                  onChange={(e) => {
                    const choices = [...fieldForm.options.choices];
                    choices[index].label = e.target.value;
                    setFieldForm({
                      ...fieldForm,
                      options: { ...fieldForm.options, choices },
                    });
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const choices = fieldForm.options.choices.filter(
                      (_: any, i: number) => i !== index
                    );
                    setFieldForm({
                      ...fieldForm,
                      options: { ...fieldForm.options, choices },
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        );

      case 'NUMBER':
      case 'CURRENCY':
      case 'PERCENTAGE':
      case 'SLIDER':
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Minimum"
                  type="number"
                  value={fieldForm.options?.min || ''}
                  onChange={(e) => setFieldForm({
                    ...fieldForm,
                    options: { ...fieldForm.options, min: Number(e.target.value) },
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Maximum"
                  type="number"
                  value={fieldForm.options?.max || ''}
                  onChange={(e) => setFieldForm({
                    ...fieldForm,
                    options: { ...fieldForm.options, max: Number(e.target.value) },
                  })}
                />
              </Grid>
              {fieldForm.fieldType === 'SLIDER' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Step"
                    type="number"
                    value={fieldForm.options?.step || 1}
                    onChange={(e) => setFieldForm({
                      ...fieldForm,
                      options: { ...fieldForm.options, step: Number(e.target.value) },
                    })}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 'FILE':
      case 'IMAGE':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Allowed File Types"
              placeholder="e.g., .pdf,.doc,.docx"
              value={fieldForm.options?.allowedFileTypes?.join(',') || ''}
              onChange={(e) => setFieldForm({
                ...fieldForm,
                options: {
                  ...fieldForm.options,
                  allowedFileTypes: e.target.value.split(',').map(s => s.trim()),
                },
              })}
              helperText="Comma-separated file extensions"
            />
            <TextField
              fullWidth
              size="small"
              label="Max File Size (MB)"
              type="number"
              sx={{ mt: 2 }}
              value={fieldForm.options?.maxFileSize || ''}
              onChange={(e) => setFieldForm({
                ...fieldForm,
                options: { ...fieldForm.options, maxFileSize: Number(e.target.value) },
              })}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Custom Fields Console
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Field Management" />
          <Tab label="Templates" />
          <Tab label="Import/Export" />
          <Tab label="Settings" />
        </Tabs>

        {/* Field Management Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Entity Type
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={selectedEntity}
                      onChange={(e) => setSelectedEntity(e.target.value)}
                    >
                      {ENTITY_TYPES.map(entity => (
                        <MenuItem key={entity} value={entity}>
                          {entity}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Add Field
                  </Typography>
                  <List dense>
                    {FIELD_TYPES.map(fieldType => (
                      <ListItem
                        key={fieldType.value}
                        button
                        onClick={() => handleFieldTypeSelect(fieldType.value)}
                      >
                        <ListItemIcon>{fieldType.icon}</ListItemIcon>
                        <ListItemText primary={fieldType.label} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {selectedEntity} Fields
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="fields">
                      {(provided) => (
                        <Box {...provided.droppableProps} ref={provided.innerRef}>
                          {fields
                            .filter(f => f.entityType === selectedEntity)
                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                            .map((field, index) => (
                              <Draggable
                                key={field.id}
                                draggableId={String(field.id)}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      p: 2,
                                      mb: 1,
                                      backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                                        <DragIcon />
                                      </Box>
                                      <Box sx={{ mr: 2 }}>
                                        {renderFieldIcon(field.fieldType)}
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1">
                                          {field.displayName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {field.fieldName} • {field.fieldType}
                                        </Typography>
                                      </Box>
                                      <Stack direction="row" spacing={1}>
                                        {field.isRequired && (
                                          <Chip label="Required" size="small" color="error" />
                                        )}
                                        {field.isUnique && (
                                          <Chip label="Unique" size="small" color="primary" />
                                        )}
                                        {field.isSearchable && (
                                          <Chip label="Searchable" size="small" />
                                        )}
                                      </Stack>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditField(field)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteField(field.id!)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Field Dialog */}
        <Dialog
          open={fieldDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingField ? 'Edit Field' : 'Add Field'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Field Name"
                  value={fieldForm.fieldName}
                  onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
                  helperText="Internal name (no spaces)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={fieldForm.displayName}
                  onChange={(e) => setFieldForm({ ...fieldForm, displayName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={fieldForm.description || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={fieldForm.fieldType}
                    onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
                    label="Field Type"
                  >
                    {FIELD_TYPES.map(type => (
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
                <TextField
                  fullWidth
                  label="Section"
                  value={fieldForm.section || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })}
                  helperText="Group fields into sections"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Help Text"
                  multiline
                  rows={2}
                  value={fieldForm.helpText || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, helpText: e.target.value })}
                />
              </Grid>
            </Grid>

            {renderFieldOptions()}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Field Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.isRequired || false}
                        onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
                      />
                    }
                    label="Required"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.isUnique || false}
                        onChange={(e) => setFieldForm({ ...fieldForm, isUnique: e.target.checked })}
                      />
                    }
                    label="Unique"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.isSearchable || false}
                        onChange={(e) => setFieldForm({ ...fieldForm, isSearchable: e.target.checked })}
                      />
                    }
                    label="Searchable"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.isFilterable || false}
                        onChange={(e) => setFieldForm({ ...fieldForm, isFilterable: e.target.checked })}
                      />
                    }
                    label="Filterable"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={() => setValidationDialogOpen(true)}
              >
                Validation Rules
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setConditionalLogicDialogOpen(true)}
              >
                Conditional Logic
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveField} variant="contained">
              {editingField ? 'Update' : 'Add'} Field
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};
