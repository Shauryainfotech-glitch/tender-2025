import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { saveAs } from 'file-saver';

interface QRCodeGeneratorProps {
  initialValue?: string;
  onScan?: (data: string) => void;
  onGenerate?: (data: string, qrCodeUrl: string) => void;
  mode?: 'generator' | 'scanner' | 'both';
  autoStart?: boolean;
  showHistory?: boolean;
}

interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  scale: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
  type: 'image/png' | 'image/jpeg' | 'image/webp';
}

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
      id={`qr-tabpanel-${index}`}
      aria-labelledby={`qr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  initialValue = '',
  onScan,
  onGenerate,
  mode = 'both',
  autoStart = false,
  showHistory = true,
}) => {
  const [tabValue, setTabValue] = useState(mode === 'scanner' ? 1 : 0);
  const [inputValue, setInputValue] = useState(initialValue);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [options, setOptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: 'M',
    margin: 4,
    scale: 4,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    type: 'image/png',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoStart && mode !== 'generator') {
      setTabValue(1);
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (inputValue) {
      generateQRCode();
    }
  }, [inputValue, options]);

  const generateQRCode = async () => {
    if (!inputValue.trim()) {
      setQrCodeUrl('');
      return;
    }

    setLoading(true);
    try {
      const url = await QRCode.toDataURL(inputValue, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        scale: options.scale,
        width: options.width,
        color: options.color,
        type: options.type,
      });
      
      setQrCodeUrl(url);
      onGenerate?.(inputValue, url);
      
      // Add to history
      if (showHistory && !history.includes(inputValue)) {
        setHistory(prev => [inputValue, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;

    try {
      setIsScanning(true);
      setError('');

      const html5QrCode = new Html5Qrcode('qr-scanner');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore errors, they're too frequent
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    setSuccess('QR Code scanned successfully!');
    onScan?.(decodedText);
    
    // Add to history
    if (showHistory && !history.includes(decodedText)) {
      setHistory(prev => [decodedText, ...prev.slice(0, 9)]);
    }
    
    // Stop scanning after successful scan
    stopScanner();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-scanner');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setError('No QR code found in the image');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const extension = options.type.split('/')[1];
    saveAs(qrCodeUrl, `qrcode.${extension}`);
    setSuccess('QR Code downloaded successfully!');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
            }
            img {
              max-width: 400px;
              margin: 20px 0;
            }
            .value {
              margin-top: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>QR Code</h2>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <div class="value">${inputValue}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl || !navigator.share) {
      setError('Sharing is not supported on this device');
      return;
    }

    try {
      const blob = await (await fetch(qrCodeUrl)).blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'QR Code',
        text: inputValue,
        files: [file],
      });
      setSuccess('QR Code shared successfully!');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to share QR Code');
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      stopScanner();
    }
  };

  return (
    <Box>
      {mode === 'both' && (
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="QR code tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Generate" 
            icon={<QrCodeIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Scan" 
            icon={<CameraIcon />} 
            iconPosition="start"
          />
        </Tabs>
      )}

      {/* Generator Tab */}
      {(mode === 'generator' || mode === 'both') && (
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Generate QR Code
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Enter text or URL"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={generateQRCode}
                    disabled={!inputValue.trim() || loading}
                  >
                    Generate
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      setInputValue('');
                      setQrCodeUrl('');
                    }}
                  >
                    Clear
                  </Button>
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Box>

                {showHistory && history.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Recent:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {history.map((item, index) => (
                        <Chip
                          key={index}
                          label={item.length > 20 ? `${item.substring(0, 20)}...` : item}
                          size="small"
                          onClick={() => setInputValue(item)}
                          onDelete={() => setHistory(prev => prev.filter((_, i) => i !== index))}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  QR Code Preview
                </Typography>
                
                {loading ? (
                  <CircularProgress />
                ) : qrCodeUrl ? (
                  <>
                    <Box
                      component="img"
                      src={qrCodeUrl}
                      alt="QR Code"
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 2,
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton onClick={downloadQRCode} color="primary">
                        <Tooltip title="Download">
                          <DownloadIcon />
                        </Tooltip>
                      </IconButton>
                      <IconButton onClick={() => copyToClipboard(inputValue)} color="primary">
                        <Tooltip title="Copy Value">
                          <CopyIcon />
                        </Tooltip>
                      </IconButton>
                      <IconButton onClick={printQRCode} color="primary">
                        <Tooltip title="Print">
                          <PrintIcon />
                        </Tooltip>
                      </IconButton>
                      {navigator.share && (
                        <IconButton onClick={shareQRCode} color="primary">
                          <Tooltip title="Share">
                            <ShareIcon />
                          </Tooltip>
                        </IconButton>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      width: 300,
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #e0e0e0',
                      borderRadius: 1,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="body2">
                      Enter text to generate QR code
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* Scanner Tab */}
      {(mode === 'scanner' || mode === 'both') && (
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Scan QR Code
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {isScanning ? (
                    <>
                      <div id="qr-scanner" style={{ width: '100%' }} ref={scannerRef} />
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={stopScanner}
                      >
                        Stop Scanning
                      </Button>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed #e0e0e0',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <CameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to start camera or upload image
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<CameraIcon />}
                          onClick={startScanner}
                          fullWidth
                        >
                          Start Camera
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<PhotoLibraryIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          fullWidth
                        >
                          Upload Image
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
                <div id="qr-file-scanner" style={{ display: 'none' }} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Scan Result
                </Typography>
                
                {scanResult ? (
                  <>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: 'success.light',
                        wordBreak: 'break-all',
                      }}
                    >
                      <Typography variant="body1">{scanResult}</Typography>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(scanResult)}
                        fullWidth
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                          setScanResult('');
                          if (!isScanning) {
                            startScanner();
                          }
                        }}
                        fullWidth
                      >
                        Scan Again
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #e0e0e0',
                      borderRadius: 1,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="body2">
                      No QR code scanned yet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          QR Code Settings
          <IconButton
            aria-label="close"
            onClick={() => setSettingsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Error Correction Level</InputLabel>
                <Select
                  value={options.errorCorrectionLevel}
                  label="Error Correction Level"
                  onChange={(e) => setOptions({ ...options, errorCorrectionLevel: e.target.value as any })}
                >
                  <MenuItem value="L">Low (7%)</MenuItem>
                  <MenuItem value="M">Medium (15%)</MenuItem>
                  <MenuItem value="Q">Quartile (25%)</MenuItem>
                  <MenuItem value="H">High (30%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>Size: {options.width}px</Typography>
              <Slider
                value={options.width}
                onChange={(e, value) => setOptions({ ...options, width: value as number })}
                min={100}
                max={800}
                step={50}
                marks
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>Margin: {options.margin}</Typography>
              <Slider
                value={options.margin}
                onChange={(e, value) => setOptions({ ...options, margin: value as number })}
                min={0}
                max={10}
                marks
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Dark Color"
                type="color"
                value={options.color.dark}
                onChange={(e) => setOptions({
                  ...options,
                  color: { ...options.color, dark: e.target.value }
                })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Light Color"
                type="color"
                value={options.color.light}
                onChange={(e) => setOptions({
                  ...options,
                  color: { ...options.color, light: e.target.value }
                })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Image Format</InputLabel>
                <Select
                  value={options.type}
                  label="Image Format"
                  onChange={(e) => setOptions({ ...options, type: e.target.value as any })}
                >
                  <MenuItem value="image/png">PNG</MenuItem>
                  <MenuItem value="image/jpeg">JPEG</MenuItem>
                  <MenuItem value="image/webp">WebP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setSettingsOpen(false);
              generateQRCode();
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeGenerator;
