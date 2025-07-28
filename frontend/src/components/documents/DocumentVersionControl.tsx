import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  AvatarGroup,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  RestoreFromTrash as RestoreIcon,
  Compare as CompareIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { documentService } from '../../services/documentService';

interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
  comment?: string;
  changes?: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  locked: boolean;
  lockedBy?: {
    id: string;
    name: string;
  };
  tags?: string[];
  checksum?: string;
}

interface DocumentVersionControlProps {
  documentId: string;
  currentVersion?: DocumentVersion;
  onVersionSelect?: (version: DocumentVersion) => void;
  readOnly?: boolean;
}

const DocumentVersionControl: React.FC<DocumentVersionControlProps> = ({
  documentId,
  currentVersion,
  onVersionSelect,
  readOnly = false,
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadComment, setUploadComment] = useState('');
  const [compareVersions, setCompareVersions] = useState<[DocumentVersion?, DocumentVersion?]>([]);
  const [autoVersion, setAutoVersion] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await documentService.getVersions(documentId);
      setVersions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('comment', uploadComment);
    formData.append('autoVersion', autoVersion.toString());

    try {
      await documentService.uploadNewVersion(documentId, formData);
      setSuccess('New version uploaded successfully');
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadComment('');
      loadVersions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload new version');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVersion = async (version: DocumentVersion) => {
    try {
      const response = await documentService.downloadVersion(version.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', version.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download version');
    }
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
    if (!window.confirm(`Are you sure you want to restore version ${version.version}?`)) {
      return;
    }

    setLoading(true);
    try {
      await documentService.restoreVersion(version.id);
      setSuccess('Version restored successfully');
      loadVersions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async (version: DocumentVersion) => {
    setLoading(true);
    try {
      if (version.locked) {
        await documentService.unlockVersion(version.id);
        setSuccess('Version unlocked successfully');
      } else {
        await documentService.lockVersion(version.id);
        setSuccess('Version locked successfully');
      }
      loadVersions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lock status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (version: DocumentVersion, newStatus: string) => {
    setLoading(true);
    try {
      await documentService.updateVersionStatus(version.id, newStatus);
      setSuccess('Status updated successfully');
      loadVersions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'review':
        return 'warning';
      case 'draft':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getVersionChangeType = (index: number) => {
    if (index === 0) return 'Initial version';
    const prevVersion = versions[index - 1];
    const currVersion = versions[index];
    
    if (currVersion.fileSize > prevVersion.fileSize * 1.5) {
      return 'Major update';
    } else if (currVersion.fileSize > prevVersion.fileSize * 1.1) {
      return 'Content update';
    } else {
      return 'Minor revision';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            Version History
          </Typography>
          
          {!readOnly && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload New Version
            </Button>
          )}
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Current Version Summary */}
            {currentVersion && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Version
                      </Typography>
                      <Typography variant="h5" gutterBottom>
                        v{currentVersion.version}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={currentVersion.status}
                          color={getStatusColor(currentVersion.status) as any}
                          size="small"
                        />
                        {currentVersion.locked && (
                          <Chip
                            icon={<LockIcon />}
                            label="Locked"
                            size="small"
                            color="error"
                          />
                        )}
                        <Chip
                          label={formatFileSize(currentVersion.fileSize)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded by {currentVersion.uploadedBy.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(currentVersion.uploadedAt), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Version Timeline */}
            <Timeline position="alternate">
              {versions.map((version, index) => (
                <TimelineItem key={version.id}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    {format(new Date(version.uploadedAt), 'PPp')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector sx={{ bgcolor: index === 0 ? 'primary.main' : 'grey.300' }} />
                    <TimelineDot color={index === 0 ? 'primary' : 'grey'}>
                      {version.locked ? <LockIcon /> : <HistoryIcon />}
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 },
                        bgcolor: index === 0 ? 'primary.light' : 'background.paper',
                      }}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Box>
                            <Typography variant="h6" component="span">
                              v{version.version}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {getVersionChangeType(index)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorEl(e.currentTarget);
                              setSelectedVersion(version);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={version.status}
                            color={getStatusColor(version.status) as any}
                            size="small"
                          />
                          {version.locked && (
                            <Chip
                              icon={<LockIcon />}
                              label={`Locked by ${version.lockedBy?.name}`}
                              size="small"
                              color="error"
                            />
                          )}
                        </Box>
                        
                        {version.comment && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {version.comment}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                          <Avatar
                            src={version.uploadedBy.avatar}
                            sx={{ width: 24, height: 24 }}
                          >
                            {version.uploadedBy.name[0]}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {version.uploadedBy.name} • {formatFileSize(version.fileSize)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>

            {/* Version Comparison */}
            {versions.length > 1 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => setCompareDialogOpen(true)}
                >
                  Compare Versions
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setDetailsDialogOpen(true);
            setAnchorEl(null);
          }}
        >
          <InfoIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedVersion) {
              handleDownloadVersion(selectedVersion);
            }
            setAnchorEl(null);
          }}
        >
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        {!readOnly && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                if (selectedVersion) {
                  handleRestoreVersion(selectedVersion);
                }
                setAnchorEl(null);
              }}
            >
              <RestoreIcon sx={{ mr: 1 }} fontSize="small" />
              Restore This Version
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedVersion) {
                  handleLockToggle(selectedVersion);
                }
                setAnchorEl(null);
              }}
            >
              {selectedVersion?.locked ? (
                <>
                  <UnlockIcon sx={{ mr: 1 }} fontSize="small" />
                  Unlock Version
                </>
              ) : (
                <>
                  <LockIcon sx={{ mr: 1 }} fontSize="small" />
                  Lock Version
                </>
              )}
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Upload New Version Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload New Version</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              id="version-file-upload"
              style={{ display: 'none' }}
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="version-file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ mb: 2 }}
                startIcon={<UploadIcon />}
              >
                {uploadFile ? uploadFile.name : 'Select File'}
              </Button>
            </label>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Version Comment"
              value={uploadComment}
              onChange={(e) => setUploadComment(e.target.value)}
              placeholder="Describe the changes in this version..."
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoVersion}
                  onChange={(e) => setAutoVersion(e.target.checked)}
                />
              }
              label="Auto-increment version number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadNewVersion}
            disabled={!uploadFile || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Version Details</DialogTitle>
        <DialogContent>
          {selectedVersion && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Version
                </Typography>
                <Typography>v{selectedVersion.version}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedVersion.status}
                  color={getStatusColor(selectedVersion.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  File Name
                </Typography>
                <Typography>{selectedVersion.fileName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  File Size
                </Typography>
                <Typography>{formatFileSize(selectedVersion.fileSize)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Uploaded By
                </Typography>
                <Typography>{selectedVersion.uploadedBy.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Upload Date
                </Typography>
                <Typography>
                  {format(new Date(selectedVersion.uploadedAt), 'PPpp')}
                </Typography>
              </Grid>
              {selectedVersion.checksum && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Checksum
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedVersion.checksum}
                  </Typography>
                </Grid>
              )}
              {selectedVersion.comment && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comment
                  </Typography>
                  <Typography>{selectedVersion.comment}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Compare Versions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Version 1</InputLabel>
                <Select
                  value={compareVersions[0]?.id || ''}
                  label="Version 1"
                  onChange={(e) => {
                    const version = versions.find(v => v.id === e.target.value);
                    setCompareVersions([version, compareVersions[1]]);
                  }}
                >
                  {versions.map((version) => (
                    <MenuItem key={version.id} value={version.id}>
                      v{version.version} - {format(new Date(version.uploadedAt), 'PP')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Version 2</InputLabel>
                <Select
                  value={compareVersions[1]?.id || ''}
                  label="Version 2"
                  onChange={(e) => {
                    const version = versions.find(v => v.id === e.target.value);
                    setCompareVersions([compareVersions[0], version]);
                  }}
                >
                  {versions.map((version) => (
                    <MenuItem key={version.id} value={version.id}>
                      v{version.version} - {format(new Date(version.uploadedAt), 'PP')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {compareVersions[0] && compareVersions[1] && (
              <Grid item xs={12}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Property</TableCell>
                        <TableCell>v{compareVersions[0].version}</TableCell>
                        <TableCell>v{compareVersions[1].version}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>File Size</TableCell>
                        <TableCell>{formatFileSize(compareVersions[0].fileSize)}</TableCell>
                        <TableCell>{formatFileSize(compareVersions[1].fileSize)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>
                          <Chip
                            label={compareVersions[0].status}
                            color={getStatusColor(compareVersions[0].status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={compareVersions[1].status}
                            color={getStatusColor(compareVersions[1].status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell>{compareVersions[0].uploadedBy.name}</TableCell>
                        <TableCell>{compareVersions[1].uploadedBy.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>{format(new Date(compareVersions[0].uploadedAt), 'PP')}</TableCell>
                        <TableCell>{format(new Date(compareVersions[1].uploadedAt), 'PP')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
          {compareVersions[0] && compareVersions[1] && (
            <Button
              variant="contained"
              onClick={() => {
                // Implement detailed comparison logic
                console.log('Compare versions:', compareVersions);
              }}
            >
              View Detailed Comparison
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentVersionControl;
