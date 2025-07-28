import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Toolbar,
  Tooltip,
  ButtonGroup,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Search as SearchIcon,
  RotateRight as RotateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { documentService } from '../../services/documentService';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPreviewProps {
  documentId?: string;
  url?: string;
  file?: File;
  fileType?: string;
  fileName?: string;
  onClose?: () => void;
  showToolbar?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
}

interface DocumentInfo {
  name: string;
  type: string;
  size: number;
  pages?: number;
  dimensions?: { width: number; height: number };
  createdDate?: Date;
  modifiedDate?: Date;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentId,
  url: propUrl,
  file,
  fileType: propFileType,
  fileName: propFileName,
  onClose,
  showToolbar = true,
  allowDownload = true,
  allowPrint = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  
  // PDF specific state
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [searchText, setSearchText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Image specific state
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initializeDocument();
  }, [documentId, propUrl, file]);

  const initializeDocument = async () => {
    setLoading(true);
    setError('');

    try {
      if (file) {
        // Handle file object
        const url = URL.createObjectURL(file);
        setDocumentUrl(url);
        setFileType(file.type);
        setFileName(file.name);
        setDocumentInfo({
          name: file.name,
          type: file.type,
          size: file.size,
          modifiedDate: new Date(file.lastModified),
        });
      } else if (propUrl) {
        // Handle provided URL
        setDocumentUrl(propUrl);
        setFileType(propFileType || getMimeTypeFromUrl(propUrl));
        setFileName(propFileName || getFileNameFromUrl(propUrl));
      } else if (documentId) {
        // Fetch document from server
        const response = await documentService.getDocumentPreview(documentId);
        setDocumentUrl(response.data.url);
        setFileType(response.data.type);
        setFileName(response.data.name);
        setDocumentInfo(response.data.info);
      } else {
        throw new Error('No document source provided');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const getMimeTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };

  const getFileNameFromUrl = (url: string): string => {
    return url.split('/').pop()?.split('?')[0] || 'document';
  };

  const handleDownload = async () => {
    try {
      if (documentId) {
        const response = await documentService.downloadDocument(documentId);
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (documentUrl) {
        const a = document.createElement('a');
        a.href = documentUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError('Failed to download document');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const onPDFLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const renderPDFViewer = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showToolbar && (
        <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <ButtonGroup size="small">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                <PrevIcon />
              </Button>
              <Button disabled>
                {currentPage} / {numPages}
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                disabled={currentPage >= numPages}
              >
                <NextIcon />
              </Button>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <ButtonGroup size="small">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOutIcon />
              </IconButton>
              <Button disabled>{Math.round(scale * 100)}%</Button>
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomInIcon />
              </IconButton>
            </ButtonGroup>

            <IconButton onClick={handleRotate} size="small">
              <RotateIcon />
            </IconButton>

            <TextField
              size="small"
              placeholder="Search in document"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ ml: 'auto', maxWidth: 200 }}
            />

            <IconButton onClick={handleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>

            {allowDownload && (
              <IconButton onClick={handleDownload} size="small">
                <DownloadIcon />
              </IconButton>
            )}

            {allowPrint && (
              <IconButton onClick={handlePrint} size="small">
                <PrintIcon />
              </IconButton>
            )}

            {onClose && (
              <IconButton onClick={onClose} size="small" edge="end">
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.100',
          p: 2,
        }}
      >
        <Document
          file={documentUrl}
          onLoadSuccess={onPDFLoadSuccess}
          loading={<CircularProgress />}
          error={
            <Alert severity="error">
              Failed to load PDF. Please try again.
            </Alert>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </Box>
    </Box>
  );

  const renderImageViewer = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showToolbar && (
        <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="body2">{fileName}</Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <ButtonGroup size="small">
                <IconButton onClick={handleZoomOut} size="small">
                  <ZoomOutIcon />
                </IconButton>
                <Button disabled>{Math.round(scale * 100)}%</Button>
                <IconButton onClick={handleZoomIn} size="small">
                  <ZoomInIcon />
                </IconButton>
              </ButtonGroup>

              <IconButton onClick={handleFullscreen} size="small">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>

              {allowDownload && (
                <IconButton onClick={handleDownload} size="small">
                  <DownloadIcon />
                </IconButton>
              )}

              {onClose && (
                <IconButton onClick={onClose} size="small" edge="end">
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Toolbar>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.900',
          p: 2,
        }}
      >
        <img
          src={documentUrl}
          alt={fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
          }}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setLoading(false);
          }}
          onError={() => {
            setError('Failed to load image');
            setLoading(false);
          }}
        />
      </Box>
    </Box>
  );

  const renderOfficeViewer = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showToolbar && (
        <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="body2">{fileName}</Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {allowDownload && (
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              )}

              {onClose && (
                <IconButton onClick={onClose} size="small" edge="end">
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Toolbar>
      )}

      <Box sx={{ flex: 1, position: 'relative' }}>
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
          width="100%"
          height="100%"
          frameBorder="0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load Office document');
            setLoading(false);
          }}
        />
      </Box>
    </Box>
  );

  const renderTextViewer = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
      fetch(documentUrl)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load text file');
          setLoading(false);
        });
    }, [documentUrl]);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {showToolbar && (
          <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography variant="body2">{fileName}</Typography>
              
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {allowDownload && (
                  <IconButton onClick={handleDownload} size="small">
                    <DownloadIcon />
                  </IconButton>
                )}

                {onClose && (
                  <IconButton onClick={onClose} size="small" edge="end">
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Toolbar>
        )}

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            bgcolor: 'background.paper',
          }}
        >
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>
            {content}
          </pre>
        </Box>
      </Box>
    );
  };

  const renderUnsupportedViewer = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
      }}
    >
      <Alert severity="warning" sx={{ mb: 3 }}>
        Preview not available for this file type: {fileType}
      </Alert>
      
      {documentInfo && (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 400, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Document Information
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Name:</Typography>
              <Typography variant="body2">{documentInfo.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Chip label={documentInfo.type} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Size:</Typography>
              <Typography variant="body2">{formatFileSize(documentInfo.size)}</Typography>
            </Box>
            {documentInfo.modifiedDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Modified:</Typography>
                <Typography variant="body2">
                  {new Date(documentInfo.modifiedDate).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      {allowDownload && (
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ mt: 3 }}
        >
          Download File
        </Button>
      )}
    </Box>
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderViewer = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
            {allowDownload && (
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={handleDownload}
              >
                Download Instead
              </Button>
            )}
          </Alert>
        </Box>
      );
    }

    // Determine viewer based on file type
    if (fileType.includes('pdf')) {
      return renderPDFViewer();
    } else if (fileType.includes('image')) {
      return renderImageViewer();
    } else if (
      fileType.includes('word') ||
      fileType.includes('excel') ||
      fileType.includes('powerpoint') ||
      fileType.includes('officedocument')
    ) {
      return renderOfficeViewer();
    } else if (
      fileType.includes('text') ||
      fileType.includes('json') ||
      fileType.includes('xml') ||
      fileType.includes('javascript') ||
      fileType.includes('css')
    ) {
      return renderTextViewer();
    } else {
      return renderUnsupportedViewer();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {renderViewer()}
    </Paper>
  );
};

export default DocumentPreview;
