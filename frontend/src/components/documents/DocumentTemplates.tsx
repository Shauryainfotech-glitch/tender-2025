import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Preview as PreviewIcon,
  ContentCopy as DuplicateIcon,
  Star as FavoriteIcon,
  StarBorder as FavoriteOutlineIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Visibility as ViewIcon,
  Code as VariableIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { documentService } from '../../services/documentService';
import DocumentPreview from './DocumentPreview';

interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  variables?: TemplateVariable[];
  tags: string[];
  isFavorite: boolean;
  isLocked: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  lastModified: Date;
  usage: number;
}

interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count: number;
}

const DocumentTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [useTemplateOpen, setUseTemplateOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [templateValues, setTemplateValues] = useState<Record<string, any>>({});

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    file: null as File | null,
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await documentService.getTemplates();
      setTemplates(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await documentService.getTemplateCategories();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', templateForm.file);
    formData.append('name', templateForm.name);
    formData.append('description', templateForm.description);
    formData.append('category', templateForm.category);
    formData.append('tags', templateForm.tags);

    setLoading(true);
    try {
      await documentService.createTemplate(formData);
      setSuccess('Template created successfully');
      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    const formData = new FormData();
    if (templateForm.file) {
      formData.append('file', templateForm.file);
    }
    formData.append('name', templateForm.name);
    formData.append('description', templateForm.description);
    formData.append('category', templateForm.category);
    formData.append('tags', templateForm.tags);

    setLoading(true);
    try {
      await documentService.updateTemplate(selectedTemplate.id, formData);
      setSuccess('Template updated successfully');
      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await documentService.deleteTemplate(templateId);
      setSuccess('Template deleted successfully');
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleToggleFavorite = async (template: DocumentTemplate) => {
    try {
      await documentService.toggleTemplateFavorite(template.id);
      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
        )
      );
    } catch (err: any) {
      setError('Failed to update favorite status');
    }
  };

  const handleToggleLock = async (template: DocumentTemplate) => {
    try {
      await documentService.toggleTemplateLock(template.id);
      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id ? { ...t, isLocked: !t.isLocked } : t
        )
      );
      setSuccess(`Template ${template.isLocked ? 'unlocked' : 'locked'} successfully`);
    } catch (err: any) {
      setError('Failed to update lock status');
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await documentService.duplicateTemplate(templateId);
      setSuccess('Template duplicated successfully');
      loadTemplates();
    } catch (err: any) {
      setError('Failed to duplicate template');
    }
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const response = await documentService.generateFromTemplate(
        selectedTemplate.id,
        templateValues
      );
      
      // Download the generated document
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name}-${Date.now()}.${selectedTemplate.type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Document generated successfully');
      setUseTemplateOpen(false);
      setTemplateValues({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: '',
      tags: '',
      file: null,
    });
    setSelectedTemplate(null);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesFavorite = !filterFavorites || template.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const getTemplateIcon = (type: string) => {
    const iconProps = { sx: { fontSize: 48, color: 'text.secondary' } };
    
    switch (type) {
      case 'docx':
      case 'doc':
        return <DocumentIcon {...iconProps} sx={{ ...iconProps.sx, color: '#2b579a' }} />;
      case 'xlsx':
      case 'xls':
        return <DocumentIcon {...iconProps} sx={{ ...iconProps.sx, color: '#217346' }} />;
      case 'pptx':
      case 'ppt':
        return <DocumentIcon {...iconProps} sx={{ ...iconProps.sx, color: '#d24726' }} />;
      case 'pdf':
        return <DocumentIcon {...iconProps} sx={{ ...iconProps.sx, color: '#d32f2f' }} />;
      default:
        return <DocumentIcon {...iconProps} />;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Document Templates</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Create Template
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

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
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
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon fontSize="small" />
                      All Categories
                    </Box>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.icon}
                        {category.name} ({category.count})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterFavorites}
                    onChange={(e) => setFilterFavorites(e.target.checked)}
                  />
                }
                label="Favorites only"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Templates Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No templates found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      position: 'relative',
                    }}
                  >
                    {template.thumbnailUrl ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={template.thumbnailUrl}
                        alt={template.name}
                      />
                    ) : (
                      getTemplateIcon(template.type)
                    )}
                    
                    {/* Badges */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      {template.isLocked && (
                        <Chip
                          icon={<LockIcon />}
                          label="Locked"
                          size="small"
                          color="error"
                        />
                      )}
                      {template.variables && template.variables.length > 0 && (
                        <Chip
                          icon={<VariableIcon />}
                          label={template.variables.length}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>

                    {/* Favorite Icon */}
                    <IconButton
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                      onClick={() => handleToggleFavorite(template)}
                    >
                      {template.isFavorite ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteOutlineIcon />
                      )}
                    </IconButton>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {template.name}
                    </Typography>
                    
                    {template.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {template.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={template.category}
                        size="small"
                        variant="outlined"
                        icon={<CategoryIcon />}
                      />
                      {template.tags.slice(0, 2).map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {template.tags.length > 2 && (
                        <Chip
                          label={`+${template.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        Used {template.usage} times
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(template.lastModified).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setUseTemplateOpen(true);
                      }}
                      disabled={template.isLocked}
                    >
                      Use Template
                    </Button>
                    
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setPreviewOpen(true);
                        }}
                      >
                        <PreviewIcon />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedTemplate(template);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Template Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              setTemplateForm({
                name: selectedTemplate.name,
                description: selectedTemplate.description || '',
                category: selectedTemplate.category,
                tags: selectedTemplate.tags.join(', '),
                file: null,
              });
              setDialogOpen(true);
            }
            setAnchorEl(null);
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              handleDuplicateTemplate(selectedTemplate.id);
            }
            setAnchorEl(null);
          }}
        >
          <DuplicateIcon sx={{ mr: 1 }} fontSize="small" />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              handleToggleLock(selectedTemplate);
            }
            setAnchorEl(null);
          }}
        >
          {selectedTemplate?.isLocked ? (
            <>
              <UnlockIcon sx={{ mr: 1 }} fontSize="small" />
              Unlock
            </>
          ) : (
            <>
              <LockIcon sx={{ mr: 1 }} fontSize="small" />
              Lock
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              handleDeleteTemplate(selectedTemplate.id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={templateForm.category}
                label="Category"
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Tags"
              value={templateForm.tags}
              onChange={(e) => setTemplateForm({ ...templateForm, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              helperText="Comma-separated tags"
              sx={{ mb: 2 }}
            />
            
            <input
              type="file"
              id="template-file-upload"
              style={{ display: 'none' }}
              onChange={(e) => setTemplateForm({ ...templateForm, file: e.target.files?.[0] || null })}
            />
            <label htmlFor="template-file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
              >
                {templateForm.file ? templateForm.file.name : 'Upload Template File'}
              </Button>
            </label>
            {selectedTemplate && !templateForm.file && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Leave empty to keep the current file
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
            disabled={loading || !templateForm.name || !templateForm.category || (!selectedTemplate && !templateForm.file)}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use Template Dialog */}
      <Dialog
        open={useTemplateOpen}
        onClose={() => setUseTemplateOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fill in the template variables to generate your document
              </Typography>
              
              <Grid container spacing={2}>
                {selectedTemplate.variables.map((variable) => (
                  <Grid item xs={12} sm={6} key={variable.key}>
                    {variable.type === 'text' && (
                      <TextField
                        fullWidth
                        label={variable.label}
                        value={templateValues[variable.key] || variable.defaultValue || ''}
                        onChange={(e) => setTemplateValues({
                          ...templateValues,
                          [variable.key]: e.target.value
                        })}
                        required={variable.required}
                        helperText={variable.description}
                      />
                    )}
                    
                    {variable.type === 'number' && (
                      <TextField
                        fullWidth
                        type="number"
                        label={variable.label}
                        value={templateValues[variable.key] || variable.defaultValue || ''}
                        onChange={(e) => setTemplateValues({
                          ...templateValues,
                          [variable.key]: e.target.value
                        })}
                        required={variable.required}
                        helperText={variable.description}
                      />
                    )}
                    
                    {variable.type === 'date' && (
                      <TextField
                        fullWidth
                        type="date"
                        label={variable.label}
                        value={templateValues[variable.key] || variable.defaultValue || ''}
                        onChange={(e) => setTemplateValues({
                          ...templateValues,
                          [variable.key]: e.target.value
                        })}
                        required={variable.required}
                        helperText={variable.description}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                    
                    {variable.type === 'select' && (
                      <FormControl fullWidth>
                        <InputLabel required={variable.required}>
                          {variable.label}
                        </InputLabel>
                        <Select
                          value={templateValues[variable.key] || variable.defaultValue || ''}
                          label={variable.label}
                          onChange={(e) => setTemplateValues({
                            ...templateValues,
                            [variable.key]: e.target.value
                          })}
                        >
                          {variable.options?.map(option => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {variable.type === 'boolean' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={templateValues[variable.key] || variable.defaultValue || false}
                            onChange={(e) => setTemplateValues({
                              ...templateValues,
                              [variable.key]: e.target.checked
                            })}
                          />
                        }
                        label={variable.label}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                This template has no variables. Click Generate to create a copy.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUseTemplateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUseTemplate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            Generate Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Preview: {selectedTemplate?.name}</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ height: '70vh', p: 0 }}>
          {selectedTemplate && (
            <DocumentPreview
              url={selectedTemplate.fileUrl}
              fileName={selectedTemplate.name}
              fileType={`application/${selectedTemplate.type}`}
              showToolbar={true}
              allowDownload={true}
              allowPrint={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentTemplates;
