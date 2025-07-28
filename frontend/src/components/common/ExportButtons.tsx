import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Print as PrintIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export interface ExportColumn {
  field: string;
  headerName: string;
  width?: number;
  format?: (value: any) => string;
}

export interface ExportData {
  columns: ExportColumn[];
  rows: any[];
  title?: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  includeHeaders?: boolean;
  includeFooter?: boolean;
  customStyles?: any;
}

interface ExportButtonsProps {
  data: ExportData;
  formats?: ('pdf' | 'excel' | 'csv' | 'print' | 'image')[];
  variant?: 'button' | 'menu' | 'split';
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  onExport?: (format: string) => void;
  showColumnSelector?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  formats = ['pdf', 'excel', 'csv', 'print'],
  variant = 'menu',
  size = 'medium',
  color = 'primary',
  disabled = false,
  onExport,
  showColumnSelector = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    data.columns.map(col => col.field)
  );
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getFilteredData = () => {
    const filteredColumns = data.columns.filter(col => 
      selectedColumns.includes(col.field)
    );
    const filteredRows = data.rows.map(row => {
      const filteredRow: any = {};
      selectedColumns.forEach(field => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });
    return { columns: filteredColumns, rows: filteredRows };
  };

  const exportToPDF = async () => {
    setLoading(true);
    setLoadingFormat('pdf');
    
    try {
      const { columns, rows } = getFilteredData();
      const doc = new jsPDF({
        orientation: data.orientation || 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      if (data.title) {
        doc.setFontSize(16);
        doc.text(data.title, 14, 15);
      }

      // Add subtitle
      if (data.subtitle) {
        doc.setFontSize(12);
        doc.text(data.subtitle, 14, data.title ? 25 : 15);
      }

      // Prepare table data
      const headers = columns.map(col => col.headerName);
      const tableData = rows.map(row => 
        columns.map(col => {
          const value = row[col.field];
          return col.format ? col.format(value) : value?.toString() || '';
        })
      );

      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: data.title ? (data.subtitle ? 35 : 25) : 20,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          ...data.customStyles?.pdf,
        },
        headStyles: {
          fillColor: [66, 165, 245],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Add footer
      if (data.includeFooter !== false) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
          doc.text(
            `Generated on ${new Date().toLocaleDateString()}`,
            14,
            doc.internal.pageSize.height - 10
          );
        }
      }

      // Save the PDF
      doc.save(`${data.filename || 'export'}.pdf`);
      onExport?.('pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setLoading(false);
      setLoadingFormat('');
      handleClose();
    }
  };

  const exportToExcel = async () => {
    setLoading(true);
    setLoadingFormat('excel');
    
    try {
      const { columns, rows } = getFilteredData();
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data with headers
      const wsData = [
        columns.map(col => col.headerName),
        ...rows.map(row => 
          columns.map(col => {
            const value = row[col.field];
            return col.format ? col.format(value) : value;
          })
        ),
      ];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      const colWidths = columns.map(col => ({ wch: col.width || 15 }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      saveAs(blob, `${data.filename || 'export'}.xlsx`);
      onExport?.('excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setLoading(false);
      setLoadingFormat('');
      handleClose();
    }
  };

  const exportToCSV = async () => {
    setLoading(true);
    setLoadingFormat('csv');
    
    try {
      const { columns, rows } = getFilteredData();
      
      // Create CSV content
      const headers = columns.map(col => col.headerName).join(',');
      const csvRows = rows.map(row => 
        columns.map(col => {
          const value = row[col.field];
          const formatted = col.format ? col.format(value) : value?.toString() || '';
          // Escape commas and quotes
          return `"${formatted.replace(/"/g, '""')}"`;
        }).join(',')
      );

      const csvContent = [headers, ...csvRows].join('\n');
      
      // Create blob and save
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${data.filename || 'export'}.csv`);
      onExport?.('csv');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setLoading(false);
      setLoadingFormat('');
      handleClose();
    }
  };

  const handlePrint = () => {
    setLoading(true);
    setLoadingFormat('print');
    
    try {
      const { columns, rows } = getFilteredData();
      
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      // Build HTML content
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${data.title || 'Print Export'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; margin-bottom: 20px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${data.title ? `<h1>${data.title}</h1>` : ''}
            ${data.subtitle ? `<h2>${data.subtitle}</h2>` : ''}
            <table>
              <thead>
                <tr>
                  ${columns.map(col => `<th>${col.headerName}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    ${columns.map(col => {
                      const value = row[col.field];
                      const formatted = col.format ? col.format(value) : value?.toString() || '';
                      return `<td>${formatted}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>Total records: ${rows.length}</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      onExport?.('print');
    } catch (error) {
      console.error('Error printing:', error);
    } finally {
      setLoading(false);
      setLoadingFormat('');
      handleClose();
    }
  };

  const exportToImage = async () => {
    setLoading(true);
    setLoadingFormat('image');
    
    try {
      // Find the table element to capture
      const element = document.querySelector('.export-target') || document.body;
      
      // Capture as canvas
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      // Convert to blob and save
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${data.filename || 'export'}.png`);
          onExport?.('image');
        }
      });
    } catch (error) {
      console.error('Error exporting to image:', error);
    } finally {
      setLoading(false);
      setLoadingFormat('');
      handleClose();
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'print':
        handlePrint();
        break;
      case 'image':
        exportToImage();
        break;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <PdfIcon />;
      case 'excel':
        return <ExcelIcon />;
      case 'csv':
        return <CsvIcon />;
      case 'print':
        return <PrintIcon />;
      case 'image':
        return <ImageIcon />;
      default:
        return <DownloadIcon />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'Export as PDF';
      case 'excel':
        return 'Export as Excel';
      case 'csv':
        return 'Export as CSV';
      case 'print':
        return 'Print';
      case 'image':
        return 'Export as Image';
      default:
        return 'Export';
    }
  };

  if (variant === 'button' && formats.length === 1) {
    const format = formats[0];
    return (
      <Button
        variant="contained"
        color={color}
        size={size}
        startIcon={loading ? <CircularProgress size={20} /> : getFormatIcon(format)}
        onClick={() => handleExport(format)}
        disabled={disabled || loading}
      >
        {getFormatLabel(format)}
      </Button>
    );
  }

  if (variant === 'split') {
    const primaryFormat = formats[0];
    return (
      <ButtonGroup variant="contained" color={color} size={size}>
        <Button
          startIcon={loading && loadingFormat === primaryFormat ? <CircularProgress size={20} /> : getFormatIcon(primaryFormat)}
          onClick={() => handleExport(primaryFormat)}
          disabled={disabled || loading}
        >
          {getFormatLabel(primaryFormat)}
        </Button>
        <Button
          size="small"
          onClick={handleClick}
          disabled={disabled || loading}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color={color}
        size={size}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {showColumnSelector && (
          <>
            <MenuItem onClick={() => setColumnSelectorOpen(!columnSelectorOpen)}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Select Columns</ListItemText>
            </MenuItem>
            {columnSelectorOpen && (
              <Box sx={{ px: 2, py: 1, maxHeight: 200, overflow: 'auto' }}>
                <FormGroup>
                  {data.columns.map((col) => (
                    <FormControlLabel
                      key={col.field}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedColumns.includes(col.field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns([...selectedColumns, col.field]);
                            } else {
                              setSelectedColumns(selectedColumns.filter(f => f !== col.field));
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">{col.headerName}</Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
            <Divider />
          </>
        )}
        
        {formats.map((format) => (
          <MenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={loading}
          >
            <ListItemIcon>
              {loading && loadingFormat === format ? (
                <CircularProgress size={20} />
              ) : (
                getFormatIcon(format)
              )}
            </ListItemIcon>
            <ListItemText>{getFormatLabel(format)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportButtons;
