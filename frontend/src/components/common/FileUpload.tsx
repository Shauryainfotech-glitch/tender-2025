import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<{ id: string; url: string }[]>;
  onDelete?: (fileId: string) => Promise<void>;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  multiple = true,
  onUpload,
  onDelete,
  value = [],
  onChange,
  disabled = false,
  showPreview = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const updateFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejection) => {
          const error = rejection.errors[0];
          return `${rejection.file.name}: ${error.message}`;
        }).join(', ');
        alert(errors);
        return;
      }

      // Check max files limit
      if (files.length + acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Create file objects with initial state
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading' as const,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      updateFiles([...files, ...newFiles]);

      // Upload files
      try {
        const uploadResults = await onUpload(acceptedFiles);
        
        // Update files with upload results
        const updatedFiles = [...files];
        newFiles.forEach((newFile, index) => {
          const fileIndex = updatedFiles.findIndex((f) => f.id === newFile.id);
          if (fileIndex !== -1 && uploadResults[index]) {
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              id: uploadResults[index].id,
              url: uploadResults[index].url,
              progress: 100,
              status: 'completed',
            };
          }
        });
        
        updateFiles(updatedFiles);
      } catch (error) {
        // Handle upload errors
        const updatedFiles = [...files];
        newFiles.forEach((newFile) => {
          const fileIndex = updatedFiles.findIndex((f) => f.id === newFile.id);
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              status: 'error',
              error: 'Upload failed',
            };
          }
        });
        updateFiles(updatedFiles);
      }
    },
    [files, maxFiles, onUpload, updateFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
    disabled,
  });

  const handleDelete = async (fileId: string) => {
    if (onDelete) {
      try {
        await onDelete(fileId);
        const updatedFiles = files.filter((f) => f.id !== fileId);
        updateFiles(updatedFiles);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    } else {
      const updatedFiles = files.filter((f) => f.id !== fileId);
      updateFiles(updatedFiles);
    }
  };

  const handlePreview = (file: UploadedFile) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type === 'application/pdf') return <PdfIcon />;
    if (type.includes('word') || type.includes('document')) return <DocIcon />;
    if (type.includes('sheet') || type.includes('excel')) return <ExcelIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (file: UploadedFile) => {
    return file.type.startsWith('image/') || file.type === 'application/pdf';
  };

  return (
    <Box>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ textAlign: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Accepted formats: {accept}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Max size: {formatFileSize(maxSize)} | Max files: {maxFiles}
          </Typography>
        </Box>
      </Paper>

      {/* File List */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file) => (
            <ListItem key={file.id} sx={{ px: 0 }}>
              <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {file.name}
                    </Typography>
                    {file.status === 'completed' && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                    {file.status === 'error' && (
                      <Tooltip title={file.error || 'Upload failed'}>
                        <ErrorIcon color="error" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    {file.status === 'uploading' && (
                      <LinearProgress
                        variant="determinate"
                        value={file.progress}
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {showPreview && canPreview(file) && file.status === 'completed' && (
                  <Tooltip title="Preview">
                    <IconButton size="small" onClick={() => handlePreview(file)}>
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {file.url && (
                  <Tooltip title="Download">
                    <IconButton size="small" component="a" href={file.url} download>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(file.id)}
                    disabled={file.status === 'uploading'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewFile?.name}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setPreviewOpen(false)}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewFile?.type.startsWith('image/') && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={previewFile.preview || previewFile.url}
                alt={previewFile.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )}
          {previewFile?.type === 'application/pdf' && previewFile.url && (
            <iframe
              src={previewFile.url}
              width="100%"
              height="600px"
              title={previewFile.name}
            />
          )}
        </DialogContent>
        <DialogActions>
          {previewFile?.url && (
            <Button
              startIcon={<DownloadIcon />}
              component="a"
              href={previewFile.url}
              download
            >
              Download
            </Button>
          )}
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
