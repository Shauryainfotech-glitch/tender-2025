import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Collapse,
  CircularProgress,
  FormGroup,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  FolderZip as ZipIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { documentService } from '../../services/documentService';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface DownloadItem {
  id: string;
  name: string;
  size?: number;
  type?: string;
  status: 'pending' | 'downloading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface BulkDocumentManagerProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  onDownloadComplete?: (items: DownloadItem[]) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  categories?: string[];
  defaultCategory?: string;
}

const BulkDocumentManager: React.FC<BulkDocumentManagerProps> = ({
  onUploadComplete,
  onDownloadComplete,
  allowedFileTypes = [],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 100,
  categories = [],
  defaultCategory = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'download'>('upload');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upload settings
  const [compressImages, setCompressImages] = useState(true);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [autoRename, setAutoRename] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const uploadQueueRef = useRef<any[]>([]);
  const downloadQueueRef = useRef<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: allowedFileTypes.length > 0 ? 
      allowedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : undefined,
    maxSize: maxFileSize,
    multiple: true,
    disabled: uploading,
  });

  function handleFileDrop(acceptedFiles: File[], rejectedFiles: any[]) {
    setError('');

    if (uploadFiles.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      category: selectedCategory,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(r => 
        `${r.file.name}: ${r.errors.map((e: any) => e.message).join(', ')}`
      ).join('\n');
      setError(`Some files were rejected:\n${errors}`);
    }
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setPaused(false);
    setError('');
    abortControllerRef.current = new AbortController();

    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    uploadQueueRef.current = [...pendingFiles];

    for (const uploadFile of pendingFiles) {
      if (paused || !abortControllerRef.current) break;

      await uploadSingleFile(uploadFile);
    }

    setUploading(false);
    const successFiles = uploadFiles.filter(f => f.status === 'success');
    if (successFiles.length > 0) {
      setSuccess(`Successfully uploaded ${successFiles.length} files`);
      onUploadComplete?.(successFiles);
    }
  };

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    try {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
      );

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('category', uploadFile.category || '');
      formData.append('tags', JSON.stringify(uploadFile.tags || []));
      
      if (uploadFile.metadata) {
        formData.append('metadata', JSON.stringify(uploadFile.metadata));
      }

      const response = await documentService.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          
          setUploadFiles(prev => 
            prev.map(f => f.id === uploadFile.id ? { ...f, progress } : f)
          );
        },
        signal: abortControllerRef.current?.signal,
      });

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100 } 
          : f
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') return;

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message || 'Upload failed' } 
          : f
        )
      );
    }
  };

  const pauseUpload = () => {
    setPaused(true);
    abortControllerRef.current?.abort();
  };

  const resumeUpload = () => {
    setPaused(false);
    startUpload();
  };

  const cancelUpload = () => {
    setUploading(false);
    setPaused(false);
    abortControllerRef.current?.abort();
    setUploadFiles(prev => 
      prev.map(f => f.status === 'uploading' ? { ...f, status: 'pending', progress: 0 } : f)
    );
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const retryFailed = () => {
    setUploadFiles(prev => 
      prev.map(f => f.status === 'error' ? { ...f, status: 'pending', progress: 0, error: undefined } : f)
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'uploading':
      case 'downloading':
        return <CircularProgress size={20} />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'uploading':
      case 'downloading':
        return 'info';
      default:
        return 'default';
    }
  };

  const calculateTotalProgress = () => {
    const files = mode === 'upload' ? uploadFiles : downloadItems;
    if (files.length === 0) return 0;
    
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0);
    return Math.round(totalProgress / files.length);
  };

  const startBulkDownload = async () => {
    if (selectedItems.length === 0) {
      setError('Please select items to download');
      return;
    }

    setDownloading(true);
    setPaused(false);
    setError('');
    abortControllerRef.current = new AbortController();

    try {
      const response = await documentService.bulkDownload(selectedItems, {
        signal: abortControllerRef.current?.signal,
        onDownloadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          
          // Update progress for all items
          setDownloadItems(prev => 
            prev.map(item => ({ ...item, progress, status: 'downloading' }))
          );
        },
      });

      // Handle the downloaded zip file
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-download-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadItems(prev => 
        prev.map(item => ({ ...item, status: 'success', progress: 100 }))
      );
      setSuccess('Download completed successfully');
      onDownloadComplete?.(downloadItems);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setError(error.message || 'Download failed');
      setDownloadItems(prev => 
        prev.map(item => ({ ...item, status: 'error', error: error.message }))
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Bulk Document Manager
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={mode === 'upload' ? 'contained' : 'outlined'}
              startIcon={<UploadIcon />}
              onClick={() => setMode('upload')}
            >
              Upload
            </Button>
            <Button
              variant={mode === 'download' ? 'contained' : 'outlined'}
              startIcon={<DownloadIcon />}
              onClick={() => setMode('download')}
            >
              Download
            </Button>
          </Box>
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

        {mode === 'upload' ? (
          <>
            {/* Upload Section */}
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                mb: 3,
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select files
              </Typography>
              {allowedFileTypes.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Allowed types: {allowedFileTypes.join(', ')}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Max file size: {formatFileSize(maxFileSize)}
              </Typography>
            </Box>

            {/* Upload Options */}
            {uploadFiles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={uploading}
                      >
                        <MenuItem value="">None</MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      disabled={uploading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!uploading ? (
                        <Button
                          variant="contained"
                          startIcon={<StartIcon />}
                          onClick={startUpload}
                          disabled={uploadFiles.filter(f => f.status === 'pending').length === 0}
                          fullWidth
                        >
                          Start Upload
                        </Button>
                      ) : (
                        <>
                          {!paused ? (
                            <Button
                              variant="outlined"
                              startIcon={<PauseIcon />}
                              onClick={pauseUpload}
                              fullWidth
                            >
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              startIcon={<StartIcon />}
                              onClick={resumeUpload}
                              fullWidth
                            >
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<StopIcon />}
                            onClick={cancelUpload}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        Overall Progress
                      </Typography>
                      <Typography variant="body2">
                        {calculateTotalProgress()}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateTotalProgress()} 
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* File List */}
            {uploadFiles.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Files ({uploadFiles.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={clearCompleted}
                      disabled={uploading || uploadFiles.filter(f => f.status === 'success').length === 0}
                    >
                      Clear Completed
                    </Button>
                    <Button
                      size="small"
                      onClick={retryFailed}
                      disabled={uploading || uploadFiles.filter(f => f.status === 'error').length === 0}
                    >
                      Retry Failed
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>File Name</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uploadFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {file.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <Chip label={file.type.split('/')[1] || 'unknown'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(file.status)}
                              <Chip 
                                label={file.status} 
                                size="small" 
                                color={getStatusColor(file.status) as any}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {file.status === 'uploading' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={file.progress} 
                                  sx={{ flexGrow: 1, minWidth: 100 }}
                                />
                                <Typography variant="caption">
                                  {file.progress}%
                                </Typography>
                              </Box>
                            )}
                            {file.error && (
                              <Tooltip title={file.error}>
                                <Typography variant="caption" color="error">
                                  {file.error}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => removeFile(file.id)}
                              disabled={file.status === 'uploading'}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        ) : (
          <>
            {/* Download Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select documents to download as a ZIP file
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search documents..."
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
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  Filters
                </Button>
              </Box>

              <Collapse in={filterOpen}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value=""
                          label="Category"
                        >
                          <MenuItem value="">All</MenuItem>
                          {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>File Type</InputLabel>
                        <Select
                          value=""
                          label="File Type"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                          <MenuItem value="doc">Documents</MenuItem>
                          <MenuItem value="image">Images</MenuItem>
                          <MenuItem value="spreadsheet">Spreadsheets</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Date Range</InputLabel>
                        <Select
                          value=""
                          label="Date Range"
                        >
                          <MenuItem value="">All Time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>
            </Box>

            {/* Download Action Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2">
                {selectedItems.length} items selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setSelectedItems([])}
                  disabled={selectedItems.length === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ZipIcon />}
                  onClick={startBulkDownload}
                  disabled={selectedItems.length === 0 || downloading}
                >
                  Download as ZIP
                </Button>
              </Box>
            </Box>

            {/* Progress */}
            {downloading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Preparing download...
                </Typography>
              </Box>
            )}

            {/* Document List Placeholder */}
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Document list would be loaded here from your backend
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Implement document fetching based on your API
              </Typography>
            </Paper>
          </>
        )}
      </Paper>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Settings</DialogTitle>
        <DialogContent>
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={compressImages}
                  onChange={(e) => setCompressImages(e.target.checked)}
                />
              }
              label="Compress images before upload"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={preserveStructure}
                  onChange={(e) => setPreserveStructure(e.target.checked)}
                />
              }
              label="Preserve folder structure"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoRename}
                  onChange={(e) => setAutoRename(e.target.checked)}
                />
              }
              label="Auto-rename duplicate files"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                />
              }
              label="Skip duplicate files"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkDocumentManager;
