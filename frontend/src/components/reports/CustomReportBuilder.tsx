import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Tooltip,
  Menu,
  Checkbox,
  FormGroup,
  RadioGroup,
  Radio,
  InputAdornment,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Schedule as ScheduleIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Dashboard as DashboardIcon,
  Functions as FunctionIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Sort as SortIcon,
  FormatListBulleted as ListIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { reportService } from '../../services/reportService';

interface ReportField {
  id: string;
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  category: string;
  aggregatable: boolean;
  sortable: boolean;
  filterable: boolean;
}

interface ReportColumn {
  id: string;
  fieldId: string;
  displayName: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  visible: boolean;
  order: number;
}

interface ReportFilter {
  id: string;
  fieldId: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface ReportSort {
  fieldId: string;
  direction: 'asc' | 'desc';
}

interface ReportGroup {
  fieldId: string;
  showSubtotals: boolean;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  stacked?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

interface Report {
  id?: string;
  name: string;
  description?: string;
  type: 'table' | 'chart' | 'summary' | 'matrix';
  dataSource: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  sorting: ReportSort[];
  grouping: ReportGroup[];
  chartConfig?: ChartConfig;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  tags?: string[];
  isPublic?: boolean;
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: ReportField[];
  icon: React.ReactNode;
}

const CustomReportBuilder: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [report, setReport] = useState<Report>({
    name: '',
    type: 'table',
    dataSource: '',
    columns: [],
    filters: [],
    sorting: [],
    grouping: [],
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [availableFields, setAvailableFields] = useState<ReportField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const steps = [
    'Select Data Source',
    'Choose Fields',
    'Configure Display',
    'Add Filters',
    'Preview & Save',
  ];

  const operatorOptions = {
    string: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' },
      { value: 'is_empty', label: 'Is Empty' },
      { value: 'is_not_empty', label: 'Is Not Empty' },
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'between', label: 'Between' },
    ],
    date: [
      { value: 'equals', label: 'On' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' },
      { value: 'last_n_days', label: 'Last N Days' },
      { value: 'next_n_days', label: 'Next N Days' },
    ],
    boolean: [
      { value: 'is_true', label: 'Is True' },
      { value: 'is_false', label: 'Is False' },
    ],
  };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
    { value: 'line', label: 'Line Chart', icon: <LineChartIcon /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
    { value: 'donut', label: 'Donut Chart', icon: <PieChartIcon /> },
    { value: 'area', label: 'Area Chart', icon: <ShowChart /> },
    { value: 'scatter', label: 'Scatter Plot', icon: <ShowChart /> },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dataSourcesRes, reportsRes] = await Promise.all([
        reportService.getDataSources(),
        reportService.getSavedReports(),
      ]);

      const sources: DataSource[] = [
        {
          id: 'tenders',
          name: 'Tenders',
          description: 'All tender data including status, dates, and values',
          icon: <DashboardIcon />,
          fields: [
            { id: 'tender_id', name: 'tender_id', displayName: 'Tender ID', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'title', name: 'title', displayName: 'Title', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'status', name: 'status', displayName: 'Status', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'category', name: 'category', displayName: 'Category', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'value', name: 'value', displayName: 'Estimated Value', type: 'number', category: 'Financial', aggregatable: true, sortable: true, filterable: true },
            { id: 'start_date', name: 'start_date', displayName: 'Start Date', type: 'date', category: 'Dates', aggregatable: false, sortable: true, filterable: true },
            { id: 'end_date', name: 'end_date', displayName: 'End Date', type: 'date', category: 'Dates', aggregatable: false, sortable: true, filterable: true },
            { id: 'location', name: 'location', displayName: 'Location', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'department', name: 'department', displayName: 'Department', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'bid_count', name: 'bid_count', displayName: 'Number of Bids', type: 'number', category: 'Metrics', aggregatable: true, sortable: true, filterable: true },
          ],
        },
        {
          id: 'vendors',
          name: 'Vendors',
          description: 'Vendor information and performance metrics',
          icon: <GroupIcon />,
          fields: [
            { id: 'vendor_id', name: 'vendor_id', displayName: 'Vendor ID', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'name', name: 'name', displayName: 'Vendor Name', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'registration_date', name: 'registration_date', displayName: 'Registration Date', type: 'date', category: 'Dates', aggregatable: false, sortable: true, filterable: true },
            { id: 'status', name: 'status', displayName: 'Status', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'rating', name: 'rating', displayName: 'Rating', type: 'number', category: 'Performance', aggregatable: true, sortable: true, filterable: true },
            { id: 'total_bids', name: 'total_bids', displayName: 'Total Bids', type: 'number', category: 'Metrics', aggregatable: true, sortable: true, filterable: true },
            { id: 'won_bids', name: 'won_bids', displayName: 'Won Bids', type: 'number', category: 'Metrics', aggregatable: true, sortable: true, filterable: true },
            { id: 'total_value', name: 'total_value', displayName: 'Total Contract Value', type: 'number', category: 'Financial', aggregatable: true, sortable: true, filterable: true },
          ],
        },
        {
          id: 'bids',
          name: 'Bids',
          description: 'Bid submissions and evaluations',
          icon: <ListIcon />,
          fields: [
            { id: 'bid_id', name: 'bid_id', displayName: 'Bid ID', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'tender_id', name: 'tender_id', displayName: 'Tender ID', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'vendor_id', name: 'vendor_id', displayName: 'Vendor ID', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'vendor_name', name: 'vendor_name', displayName: 'Vendor Name', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'bid_amount', name: 'bid_amount', displayName: 'Bid Amount', type: 'number', category: 'Financial', aggregatable: true, sortable: true, filterable: true },
            { id: 'submission_date', name: 'submission_date', displayName: 'Submission Date', type: 'date', category: 'Dates', aggregatable: false, sortable: true, filterable: true },
            { id: 'status', name: 'status', displayName: 'Status', type: 'string', category: 'Basic', aggregatable: false, sortable: true, filterable: true },
            { id: 'score', name: 'score', displayName: 'Evaluation Score', type: 'number', category: 'Performance', aggregatable: true, sortable: true, filterable: true },
          ],
        },
      ];

      setDataSources(sources);
      setSavedReports(reportsRes.data || []);
    } catch (err: any) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleDataSourceSelect = (sourceId: string) => {
    const source = dataSources.find(ds => ds.id === sourceId);
    if (source) {
      setReport(prev => ({ ...prev, dataSource: sourceId }));
      setAvailableFields(source.fields);
      setActiveStep(1);
    }
  };

  const handleFieldToggle = (field: ReportField) => {
    const existingColumn = report.columns.find(col => col.fieldId === field.id);
    
    if (existingColumn) {
      setReport(prev => ({
        ...prev,
        columns: prev.columns.filter(col => col.fieldId !== field.id),
      }));
    } else {
      const newColumn: ReportColumn = {
        id: `col-${Date.now()}`,
        fieldId: field.id,
        displayName: field.displayName,
        visible: true,
        order: report.columns.length,
        align: field.type === 'number' ? 'right' : 'left',
      };
      setReport(prev => ({
        ...prev,
        columns: [...prev.columns, newColumn],
      }));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveColumnId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReport(prev => {
        const oldIndex = prev.columns.findIndex(col => col.id === active.id);
        const newIndex = prev.columns.findIndex(col => col.id === over?.id);
        
        const newColumns = arrayMove(prev.columns, oldIndex, newIndex);
        return {
          ...prev,
          columns: newColumns.map((col, index) => ({ ...col, order: index })),
        };
      });
    }

    setActiveColumnId(null);
  };

  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      id: `filter-${Date.now()}`,
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      logicalOperator: report.filters.length > 0 ? 'AND' : undefined,
    };
    setReport(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === filterId ? { ...f, ...updates } : f),
    }));
  };

  const handleRemoveFilter = (filterId: string) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
    }));
  };

  const handleAddSort = () => {
    const sortableFields = availableFields.filter(f => f.sortable);
    if (sortableFields.length > 0) {
      const newSort: ReportSort = {
        fieldId: sortableFields[0].id,
        direction: 'asc',
      };
      setReport(prev => ({
        ...prev,
        sorting: [...prev.sorting, newSort],
      }));
    }
  };

  const handleUpdateSort = (index: number, updates: Partial<ReportSort>) => {
    setReport(prev => ({
      ...prev,
      sorting: prev.sorting.map((s, i) => i === index ? { ...s, ...updates } : s),
    }));
  };

  const handleRemoveSort = (index: number) => {
    setReport(prev => ({
      ...prev,
      sorting: prev.sorting.filter((_, i) => i !== index),
    }));
  };

  const handlePreviewReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportService.previewReport(report);
      setPreviewData(response.data.data);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview report');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!report.name.trim()) {
      setError('Please enter a report name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (report.id) {
        await reportService.updateReport(report.id, report);
        setSuccess('Report updated successfully');
      } else {
        await reportService.createReport(report);
        setSuccess('Report saved successfully');
      }
      
      // Reload saved reports
      const reportsRes = await reportService.getSavedReports();
      setSavedReports(reportsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadReport = (savedReport: Report) => {
    setReport(savedReport);
    if (savedReport.dataSource) {
      const source = dataSources.find(ds => ds.id === savedReport.dataSource);
      if (source) {
        setAvailableFields(source.fields);
      }
    }
    setShowLoadDialog(false);
    setActiveStep(2);
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(true);
    try {
      const response = await reportService.exportReport(report, format);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
              'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Report exported successfully');
    } catch (err: any) {
      setError('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const getFieldByIdFromAvailable = (fieldId: string) => {
    return availableFields.find(f => f.id === fieldId);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Data Source
            </Typography>
            <Grid container spacing={2}>
              {dataSources.map(source => (
                <Grid item xs={12} md={4} key={source.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: report.dataSource === source.id ? 2 : 1,
                      borderColor: report.dataSource === source.id ? 'primary.main' : 'divider',
                    }}
                    onClick={() => handleDataSourceSelect(source.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {source.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {source.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {source.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {source.fields.length} fields available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Fields for Your Report
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Fields
                  </Typography>
                  <List>
                    {availableFields.map(field => {
                      const isSelected = report.columns.some(col => col.fieldId === field.id);
                      return (
                        <ListItem
                          key={field.id}
                          button
                          onClick={() => handleFieldToggle(field)}
                          selected={isSelected}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={field.displayName}
                            secondary={
                              <Box>
                                <Chip label={field.type} size="small" sx={{ mr: 0.5 }} />
                                <Chip label={field.category} size="small" variant="outlined" />
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Fields ({report.columns.length})
                  </Typography>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={report.columns.map(col => col.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <List>
                        {report.columns.map(column => (
                          <SortableColumnItem
                            key={column.id}
                            column={column}
                            field={getFieldByIdFromAvailable(column.fieldId)}
                            onUpdate={(updates) => {
                              setReport(prev => ({
                                ...prev,
                                columns: prev.columns.map(col =>
                                  col.id === column.id ? { ...col, ...updates } : col
                                ),
                              }));
                            }}
                            onRemove={() => {
                              setReport(prev => ({
                                ...prev,
                                columns: prev.columns.filter(col => col.id !== column.id),
                              }));
                            }}
                          />
                        ))}
                      </List>
                    </SortableContext>
                  </DndContext>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Display Options
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Report Type
              </Typography>
              <ToggleButtonGroup
                value={report.type}
                exclusive
                onChange={(_, value) => value && setReport(prev => ({ ...prev, type: value }))}
              >
                <ToggleButton value="table">
                  <TableIcon sx={{ mr: 1 }} />
                  Table
                </ToggleButton>
                <ToggleButton value="chart">
                  <BarChartIcon sx={{ mr: 1 }} />
                  Chart
                </ToggleButton>
                <ToggleButton value="summary">
                  <DashboardIcon sx={{ mr: 1 }} />
                  Summary
                </ToggleButton>
                <ToggleButton value="matrix">
                  <TableIcon sx={{ mr: 1 }} />
                  Matrix
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>

            {report.type === 'chart' && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Chart Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Chart Type</InputLabel>
                      <Select
                        value={report.chartConfig?.type || 'bar'}
                        label="Chart Type"
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          chartConfig: {
                            ...prev.chartConfig,
                            type: e.target.value as any,
                          },
                        }))}
                      >
                        {chartTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {type.icon}
                              <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>X-Axis</InputLabel>
                      <Select
                        value={report.chartConfig?.xAxis || ''}
                        label="X-Axis"
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          chartConfig: {
                            ...prev.chartConfig,
                            xAxis: e.target.value,
                          },
                        }))}
                      >
                        {report.columns.map(col => {
                          const field = getFieldByIdFromAvailable(col.fieldId);
                          return (
                            <MenuItem key={col.id} value={col.fieldId}>
                              {col.displayName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Y-Axis</InputLabel>
                      <Select
                        value={report.chartConfig?.yAxis || ''}
                        label="Y-Axis"
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          chartConfig: {
                            ...prev.chartConfig,
                            yAxis: e.target.value,
                          },
                        }))}
                      >
                        {report.columns
                          .filter(col => {
                            const field = getFieldByIdFromAvailable(col.fieldId);
                            return field?.type === 'number';
                          })
                          .map(col => (
                            <MenuItem key={col.id} value={col.fieldId}>
                              {col.displayName}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {(report.type === 'table' || report.type === 'matrix') && (
              <>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sorting
                  </Typography>
                  {report.sorting.map((sort, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Field</InputLabel>
                        <Select
                          value={sort.fieldId}
                          label="Field"
                          onChange={(e) => handleUpdateSort(index, { fieldId: e.target.value })}
                        >
                          {availableFields
                            .filter(f => f.sortable)
                            .map(field => (
                              <MenuItem key={field.id} value={field.id}>
                                {field.displayName}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <ToggleButtonGroup
                        value={sort.direction}
                        exclusive
                        onChange={(_, value) => value && handleUpdateSort(index, { direction: value })}
                        size="small"
                      >
                        <ToggleButton value="asc">Ascending</ToggleButton>
                        <ToggleButton value="desc">Descending</ToggleButton>
                      </ToggleButtonGroup>
                      <IconButton onClick={() => handleRemoveSort(index)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddSort}
                    size="small"
                    disabled={availableFields.filter(f => f.sortable).length === 0}
                  >
                    Add Sort
                  </Button>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Grouping
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Group By</InputLabel>
                    <Select
                      value={report.grouping[0]?.fieldId || ''}
                      label="Group By"
                      onChange={(e) => {
                        if (e.target.value) {
                          setReport(prev => ({
                            ...prev,
                            grouping: [{
                              fieldId: e.target.value,
                              showSubtotals: true,
                            }],
                          }));
                        } else {
                          setReport(prev => ({ ...prev, grouping: [] }));
                        }
                      }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {availableFields.map(field => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Filters (Optional)
            </Typography>
            
            <Paper sx={{ p: 2 }}>
              {report.filters.map((filter, index) => (
                <Box key={filter.id} sx={{ mb: 2 }}>
                  {index > 0 && (
                    <FormControl size="small" sx={{ mb: 1 }}>
                      <Select
                        value={filter.logicalOperator || 'AND'}
                        onChange={(e) => handleUpdateFilter(filter.id, { 
                          logicalOperator: e.target.value as 'AND' | 'OR' 
                        })}
                      >
                        <MenuItem value="AND">AND</MenuItem>
                        <MenuItem value="OR">OR</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={filter.fieldId}
                        label="Field"
                        onChange={(e) => handleUpdateFilter(filter.id, { fieldId: e.target.value })}
                      >
                        {availableFields
                          .filter(f => f.filterable)
                          .map(field => (
                            <MenuItem key={field.id} value={field.id}>
                              {field.displayName}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        label="Operator"
                        onChange={(e) => handleUpdateFilter(filter.id, { operator: e.target.value })}
                      >
                        {(() => {
                          const field = getFieldByIdFromAvailable(filter.fieldId);
                          const operators = operatorOptions[field?.type as keyof typeof operatorOptions] || [];
                          return operators.map(op => (
                            <MenuItem key={op.value} value={op.value}>
                              {op.label}
                            </MenuItem>
                          ));
                        })()}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      size="small"
                      label="Value"
                      value={filter.value}
                      onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                      sx={{ flex: 1 }}
                      disabled={['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(filter.operator)}
                    />
                    
                    <IconButton onClick={() => handleRemoveFilter(filter.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddFilter}
                size="small"
                disabled={availableFields.filter(f => f.filterable).length === 0}
              >
                Add Filter
              </Button>
            </Paper>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview & Save Report
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Report Name"
                    value={report.name}
                    onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={report.tags || []}
                    onChange={(_, value) => setReport(prev => ({ ...prev, tags: value }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Add tags"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={report.description || ''}
                    onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={report.isPublic || false}
                        onChange={(e) => setReport(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                    }
                    label="Make this report public"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<PreviewIcon />}
                onClick={handlePreviewReport}
                disabled={loading}
              >
                Preview Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveReport}
                disabled={loading || !report.name.trim()}
              >
                Save Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => setShowScheduleDialog(true)}
              >
                Schedule
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => setShowShareDialog(true)}
              >
                Share
              </Button>
            </Box>

            {showPreview && previewData.length > 0 && (
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview ({previewData.length} rows)
                </Typography>
                {/* Preview would render here based on report type */}
                <Alert severity="info">
                  Report preview shows first 50 rows
                </Alert>
              </Paper>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Custom Report Builder</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ListIcon />}
              onClick={() => setShowLoadDialog(true)}
              sx={{ mr: 1 }}
            >
              Load Report
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveStep(prev => prev + 1)}
            disabled={
              activeStep === steps.length - 1 ||
              (activeStep === 0 && !report.dataSource) ||
              (activeStep === 1 && report.columns.length === 0)
            }
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Load Report Dialog */}
      <Dialog
        open={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load Saved Report</DialogTitle>
        <DialogContent>
          <List>
            {savedReports.map(savedReport => (
              <ListItem
                key={savedReport.id}
                button
                onClick={() => handleLoadReport(savedReport)}
              >
                <ListItemText
                  primary={savedReport.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" component="div">
                        {savedReport.description}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={savedReport.type} size="small" sx={{ mr: 0.5 }} />
                        <Chip label={savedReport.dataSource} size="small" variant="outlined" />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          handleExportReport('pdf');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Export as PDF" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportReport('excel');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Export as Excel" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportReport('csv');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Export as CSV" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          // Handle SQL view
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText primary="View SQL" />
        </MenuItem>
      </Menu>

      {/* Success/Error Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

// Sortable Column Item Component
interface SortableColumnItemProps {
  column: ReportColumn;
  field?: ReportField;
  onUpdate: (updates: Partial<ReportColumn>) => void;
  onRemove: () => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  field,
  onUpdate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        bgcolor: 'background.paper',
        mb: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <ListItemIcon {...attributes} {...listeners}>
        <DragIcon />
      </ListItemIcon>
      <ListItemText
        primary={column.displayName}
        secondary={
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {field?.aggregatable && (
              <FormControl size="small">
                <Select
                  value={column.aggregate || ''}
                  onChange={(e) => onUpdate({ aggregate: e.target.value as any })}
                  displayEmpty
                >
                  <MenuItem value="">No Aggregate</MenuItem>
                  <MenuItem value="sum">Sum</MenuItem>
                  <MenuItem value="avg">Average</MenuItem>
                  <MenuItem value="count">Count</MenuItem>
                  <MenuItem value="min">Min</MenuItem>
                  <MenuItem value="max">Max</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={onRemove} size="small">
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default CustomReportBuilder;
