import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  IconButton,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  CircularProgress,
  Zoom,
  Fade,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  FullscreenExit as ActualSizeIcon,
  Portrait as PortraitIcon,
  Landscape as LandscapeIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  showPageNumbers?: boolean;
  showDateTime?: boolean;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  customStyles?: React.CSSProperties;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  open,
  onClose,
  title = 'Print Preview',
  children,
  orientation: initialOrientation = 'portrait',
  pageSize: initialPageSize = 'A4',
  showPageNumbers = true,
  showDateTime = true,
  headerContent,
  footerContent,
  onPrint,
  onDownloadPDF,
  customStyles,
  margins = { top: 20, right: 20, bottom: 20, left: 20 },
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [orientation, setOrientation] = useState(initialOrientation);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Page dimensions in mm
  const pageDimensions: Record<string, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  };

  const getPageDimensions = () => {
    const dims = pageDimensions[pageSize];
    return orientation === 'portrait' 
      ? dims 
      : { width: dims.height, height: dims.width };
  };

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: title,
    onAfterPrint: () => {
      onPrint?.();
    },
    pageStyle: `
      @page {
        size: ${pageSize} ${orientation};
        margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize.toLowerCase() as any,
      });

      const dims = getPageDimensions();
      const imgWidth = dims.width - margins.left - margins.right;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        margins.left,
        margins.top,
        imgWidth,
        imgHeight
      );

      pdf.save(`${title || 'document'}.pdf`);
      onDownloadPDF?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleFitToPage = () => {
    setZoom(100);
  };

  const handleActualSize = () => {
    setZoom(100);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  const pageStyles: React.CSSProperties = {
    width: `${getPageDimensions().width}mm`,
    minHeight: `${getPageDimensions().height}mm`,
    padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    margin: '20px auto',
    position: 'relative',
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.3s ease',
    ...customStyles,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Fade}
    >
      <DialogTitle className="no-print">
        <Toolbar sx={{ px: 0 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${zoom}%`} size="small" />
            
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
            <IconButton onClick={handleFitToPage} size="small">
              <FitScreenIcon />
            </IconButton>
            <IconButton onClick={handleActualSize} size="small">
              <ActualSizeIcon />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <ToggleButtonGroup
              value={orientation}
              exclusive
              onChange={(e, newOrientation) => newOrientation && setOrientation(newOrientation)}
              size="small"
            >
              <ToggleButton value="portrait">
                <PortraitIcon />
              </ToggleButton>
              <ToggleButton value="landscape">
                <LandscapeIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
              >
                <MenuItem value="A4">A4</MenuItem>
                <MenuItem value="A3">A3</MenuItem>
                <MenuItem value="Letter">Letter</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton 
              onClick={() => setSettingsOpen(!settingsOpen)} 
              size="small"
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </DialogTitle>
      
      <DialogContent sx={{ backgroundColor: '#f5f5f5', overflow: 'auto' }}>
        <Box
          ref={contentRef}
          sx={pageStyles}
        >
          {/* Header */}
          {headerContent && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: `${margins.top / 2}mm ${margins.right}mm`,
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              {headerContent}
            </Box>
          )}
          
          {/* Main Content */}
          <Box sx={{ minHeight: '100%', pt: headerContent ? 4 : 0, pb: footerContent ? 4 : 0 }}>
            {children}
          </Box>
          
          {/* Footer */}
          {(footerContent || showPageNumbers || showDateTime) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: `${margins.bottom / 2}mm ${margins.right}mm`,
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>{footerContent}</Box>
              <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                {showDateTime && <span>{getCurrentDateTime()}</span>}
                {showPageNumbers && <span>Page 1 of 1</span>}
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Settings Panel */}
        <Zoom in={settingsOpen}>
          <Paper
            sx={{
              position: 'fixed',
              top: 100,
              right: 20,
              p: 2,
              width: 250,
              zIndex: 1,
            }}
            elevation={8}
          >
            <Typography variant="subtitle2" gutterBottom>
              Print Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Margins (mm)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                <FormControl size="small">
                  <InputLabel>Top</InputLabel>
                  <Select value={margins.top} label="Top">
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel>Bottom</InputLabel>
                  <Select value={margins.bottom} label="Bottom">
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel>Left</InputLabel>
                  <Select value={margins.left} label="Left">
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel>Right</InputLabel>
                  <Select value={margins.right} label="Right">
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </DialogContent>
      
      <DialogActions className="no-print">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={loading}
        >
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintPreview;
