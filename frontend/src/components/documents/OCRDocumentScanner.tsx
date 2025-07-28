import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Fab,
  Zoom,
  Collapse,
  Menu,
  Slider,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Scanner as ScannerIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Translate as TranslateIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Crop as CropIcon,
  Tune as TuneIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  FindInPage as FindInPageIcon,
  HighlightOff as RemoveIcon,
  SaveAlt as ExportIcon,
  Spellcheck as SpellcheckIcon,
  FormatAlignLeft as AlignIcon,
} from '@mui/icons-material';
import { documentService } from '../../services/documentService';
import { useDropzone } from 'react-dropzone';

interface OCRDocument {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl?: string;
  extractedText: string;
  confidence: number;
  language: string;
  pages: OCRPage[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata: {
    fileSize: number;
    pageCount: number;
    processingTime: number;
    ocrEngine: string;
  };
}

interface OCRPage {
  pageNumber: number;
  text: string;
  confidence: number;
  words: OCRWord[];
  lines: OCRLine[];
  paragraphs: OCRParagraph[];
  imageUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
}

interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

interface OCRLine {
  text: string;
  confidence: number;
  words: OCRWord[];
  boundingBox: BoundingBox;
}

interface OCRParagraph {
  text: string;
  confidence: number;
  lines: OCRLine[];
  boundingBox: BoundingBox;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRSettings {
  language: string;
  enhanceImage: boolean;
  autoRotate: boolean;
  removeBackground: boolean;
  deskew: boolean;
  despeckle: boolean;
  outputFormat: 'text' | 'json' | 'pdf' | 'docx';
  preserveLayout: boolean;
  tableDetection: boolean;
}

const OCRDocumentScanner: React.FC = () => {
  const [documents, setDocuments] = useState<OCRDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<OCRDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  
  const [ocrSettings, setOcrSettings] = useState<OCRSettings>({
    language: 'eng',
    enhanceImage: true,
    autoRotate: true,
    removeBackground: false,
    deskew: true,
    despeckle: true,
    outputFormat: 'text',
    preserveLayout: false,
    tableDetection: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    onDrop: handleFileDrop,
  });

  async function handleFileDrop(acceptedFiles: File[]) {
    const newDocuments: OCRDocument[] = acceptedFiles.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      extractedText: '',
      confidence: 0,
      language: ocrSettings.language,
      pages: [],
      status: 'pending',
      metadata: {
        fileSize: file.size,
        pageCount: 0,
        processingTime: 0,
        ocrEngine: 'Tesseract.js',
      },
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    
    // Process each document
    for (const doc of newDocuments) {
      await processDocument(doc);
    }
  }

  const processDocument = async (document: OCRDocument) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === document.id
          ? { ...doc, status: 'processing' }
          : doc
      )
    );

    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', document.originalFile);
      formData.append('settings', JSON.stringify(ocrSettings));

      const response = await documentService.performOCR(formData);
      const result = response.data;

      const processingTime = Date.now() - startTime;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                extractedText: result.text,
                confidence: result.confidence,
                pages: result.pages,
                processedUrl: result.processedUrl,
                status: 'completed',
                metadata: {
                  ...doc.metadata,
                  pageCount: result.pages.length,
                  processingTime,
                },
              }
            : doc
        )
      );

      setSuccess(`OCR completed for ${document.originalFile.name}`);
    } catch (err: any) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                status: 'error',
                error: err.response?.data?.message || 'OCR processing failed',
              }
            : doc
        )
      );
      setError(`Failed to process ${document.originalFile.name}`);
    }
  };

  const handleCopyText = () => {
    if (selectedDocument) {
      navigator.clipboard.writeText(selectedDocument.extractedText);
      setSuccess('Text copied to clipboard');
    }
  };

  const handleDownloadText = () => {
    if (!selectedDocument) return;

    const blob = new Blob([selectedDocument.extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDocument.originalFile.name.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'json') => {
    if (!selectedDocument) return;

    setLoading(true);
    try {
      const response = await documentService.exportOCRDocument(
        selectedDocument.id,
        format,
        editingText ? editedText : selectedDocument.extractedText
      );

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDocument.originalFile.name.replace(/\.[^/.]+$/, '')}_extracted.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Document exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!selectedDocument || !term) {
      setHighlightedWords([]);
      return;
    }

    const words: string[] = [];
    selectedDocument.pages.forEach(page => {
      page.words.forEach(word => {
        if (word.text.toLowerCase().includes(term.toLowerCase())) {
          words.push(word.text);
        }
      });
    });

    setHighlightedWords(words);
  };

  const renderImageWithHighlights = () => {
    if (!selectedDocument || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const page = selectedDocument.pages[selectedPage];
    
    canvas.width = page.dimensions.width;
    canvas.height = page.dimensions.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Draw highlights
    if (highlightedWords.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.lineWidth = 2;

      page.words.forEach(word => {
        if (highlightedWords.includes(word.text)) {
          const { x, y, width, height } = word.boundingBox;
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
        }
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'error';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircleIcon />;
    if (confidence >= 70) return <WarningIcon />;
    return <ErrorIcon />;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h5">OCR Document Scanner</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
            >
              Settings
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Documents List */}
        <Paper sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Card
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderStyle: 'dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                }}
              >
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Supports: Images (PNG, JPG, TIFF) and PDF
                </Typography>
              </Card>
            </div>
          </Box>

          <Divider />

          <List>
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                button
                selected={selectedDocument?.id === doc.id}
                onClick={() => {
                  setSelectedDocument(doc);
                  setEditedText(doc.extractedText);
                  setSelectedPage(0);
                }}
              >
                <ListItemIcon>
                  {doc.originalFile.type.includes('pdf') ? <PdfIcon /> : <ImageIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={doc.originalFile.name}
                  secondary={
                    <Box>
                      <Chip
                        size="small"
                        label={doc.status}
                        color={
                          doc.status === 'completed' ? 'success' :
                          doc.status === 'processing' ? 'primary' :
                          doc.status === 'error' ? 'error' : 'default'
                        }
                        sx={{ mr: 1 }}
                      />
                      {doc.status === 'completed' && (
                        <Chip
                          size="small"
                          label={`${doc.confidence.toFixed(0)}%`}
                          color={getConfidenceColor(doc.confidence)}
                          icon={getConfidenceIcon(doc.confidence)}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Main Content */}
        {selectedDocument ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label="Original" icon={<ImageIcon />} />
                <Tab label="Extracted Text" icon={<TextIcon />} />
                <Tab label="Analysis" icon={<FindInPageIcon />} />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {/* Original Image Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 2 }}>
                  {/* Image Controls */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>
                      <ZoomOutIcon />
                    </IconButton>
                    <Slider
                      value={zoomLevel}
                      onChange={(_, value) => setZoomLevel(value as number)}
                      min={25}
                      max={200}
                      step={25}
                      sx={{ width: 150 }}
                    />
                    <IconButton size="small" onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}>
                      <ZoomInIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                      {zoomLevel}%
                    </Typography>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    {selectedDocument.pages.length > 1 && (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Page</InputLabel>
                        <Select
                          value={selectedPage}
                          label="Page"
                          onChange={(e) => setSelectedPage(e.target.value as number)}
                        >
                          {selectedDocument.pages.map((_, index) => (
                            <MenuItem key={index} value={index}>
                              Page {index + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <TextField
                      size="small"
                      placeholder="Search in document..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  {/* Image Display */}
                  <Box
                    sx={{
                      position: 'relative',
                      overflow: 'auto',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'grey.100',
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top left',
                        display: 'inline-block',
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: highlightedWords.length > 0 ? 'block' : 'none',
                        }}
                      />
                      <img
                        ref={imageRef}
                        src={selectedDocument.pages[selectedPage]?.imageUrl || selectedDocument.originalUrl}
                        alt="Document"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: highlightedWords.length > 0 ? 'none' : 'block',
                        }}
                        onLoad={renderImageWithHighlights}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Extracted Text Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 2 }}>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={editingText ? <CheckCircleIcon /> : <EditIcon />}
                      onClick={() => {
                        if (editingText) {
                          setSelectedDocument({
                            ...selectedDocument,
                            extractedText: editedText,
                          });
                        }
                        setEditingText(!editingText);
                      }}
                    >
                      {editingText ? 'Save' : 'Edit'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyText}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadText}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={(e) => setSettingsAnchor(e.currentTarget)}
                    >
                      Export As
                    </Button>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    {editingText ? (
                      <TextField
                        fullWidth
                        multiline
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedDocument.extractedText}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Analysis Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Document Statistics
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Total Pages"
                                secondary={selectedDocument.pages.length}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Total Words"
                                secondary={selectedDocument.extractedText.split(/\s+/).length}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Total Characters"
                                secondary={selectedDocument.extractedText.length}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Processing Time"
                                secondary={`${(selectedDocument.metadata.processingTime / 1000).toFixed(2)}s`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="OCR Engine"
                                secondary={selectedDocument.metadata.ocrEngine}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Confidence Analysis
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Overall Confidence
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={selectedDocument.confidence}
                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                color={getConfidenceColor(selectedDocument.confidence)}
                              />
                              <Typography variant="body2" sx={{ minWidth: 50 }}>
                                {selectedDocument.confidence.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Box>

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Page Confidence
                          </Typography>
                          {selectedDocument.pages.map((page, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ minWidth: 60 }}>
                                  Page {index + 1}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={page.confidence}
                                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                                  color={getConfidenceColor(page.confidence)}
                                />
                                <Typography variant="caption" sx={{ minWidth: 45 }}>
                                  {page.confidence.toFixed(1)}%
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Low Confidence Words
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedDocument.pages
                              .flatMap(page => page.words)
                              .filter(word => word.confidence < 70)
                              .slice(0, 20)
                              .map((word, index) => (
                                <Chip
                                  key={index}
                                  label={`${word.text} (${word.confidence.toFixed(0)}%)`}
                                  size="small"
                                  color={getConfidenceColor(word.confidence)}
                                  variant="outlined"
                                />
                              ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <ScannerIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No document selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a document to begin OCR processing
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            OCR Settings
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={ocrSettings.language}
              label="Language"
              onChange={(e) => setOcrSettings({ ...ocrSettings, language: e.target.value })}
            >
              <MenuItem value="eng">English</MenuItem>
              <MenuItem value="spa">Spanish</MenuItem>
              <MenuItem value="fra">French</MenuItem>
              <MenuItem value="deu">German</MenuItem>
              <MenuItem value="chi_sim">Chinese (Simplified)</MenuItem>
              <MenuItem value="jpn">Japanese</MenuItem>
              <MenuItem value="ara">Arabic</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Image Enhancement
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.enhanceImage}
                onChange={(e) => setOcrSettings({ ...ocrSettings, enhanceImage: e.target.checked })}
              />
            }
            label="Auto-enhance image"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.autoRotate}
                onChange={(e) => setOcrSettings({ ...ocrSettings, autoRotate: e.target.checked })}
              />
            }
            label="Auto-rotate"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.deskew}
                onChange={(e) => setOcrSettings({ ...ocrSettings, deskew: e.target.checked })}
              />
            }
            label="Deskew image"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.despeckle}
                onChange={(e) => setOcrSettings({ ...ocrSettings, despeckle: e.target.checked })}
              />
            }
            label="Remove noise"
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Output Options
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.preserveLayout}
                onChange={(e) => setOcrSettings({ ...ocrSettings, preserveLayout: e.target.checked })}
              />
            }
            label="Preserve layout"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={ocrSettings.tableDetection}
                onChange={(e) => setOcrSettings({ ...ocrSettings, tableDetection: e.target.checked })}
              />
            }
            label="Detect tables"
          />
        </Box>

        {selectedDocument && activeTab === 1 && (
          <>
            <Divider />
            <MenuItem onClick={() => { handleExport('pdf'); setSettingsAnchor(null); }}>
              <ListItemIcon>
                <PdfIcon />
              </ListItemIcon>
              <ListItemText primary="Export as PDF" />
            </MenuItem>
            <MenuItem onClick={() => { handleExport('docx'); setSettingsAnchor(null); }}>
              <ListItemIcon>
                <TextIcon />
              </ListItemIcon>
              <ListItemText primary="Export as Word" />
            </MenuItem>
            <MenuItem onClick={() => { handleExport('json'); setSettingsAnchor(null); }}>
              <ListItemIcon>
                <TextIcon />
              </ListItemIcon>
              <ListItemText primary="Export as JSON" />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default OCRDocumentScanner;
