import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Grid,
  Divider,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  RestoreOutlined as RestoreIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'range' | 'boolean' | 'checkbox';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onApply?: (values: FilterValue) => void;
  onClear?: () => void;
  onSavePreset?: (name: string, values: FilterValue) => void;
  savedPresets?: { name: string; values: FilterValue }[];
  showPresets?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onClear,
  onSavePreset,
  savedPresets = [],
  showPresets = true,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const handleChange = (filterId: string, value: any) => {
    onChange({ ...values, [filterId]: value });
  };

  const handleClear = () => {
    const clearedValues: FilterValue = {};
    filters.forEach(filter => {
      clearedValues[filter.id] = filter.type === 'checkbox' ? [] : '';
    });
    onChange(clearedValues);
    onClear?.();
  };

  const handleApply = () => {
    onApply?.(values);
  };

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, values);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleLoadPreset = (preset: { name: string; values: FilterValue }) => {
    onChange(preset.values);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(values).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={filter.label}
            value={values[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
            size="small"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={values[filter.id] || ''}
              label={filter.label}
              onChange={(e) => handleChange(filter.id, e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              multiple
              value={values[filter.id] || []}
              label={filter.label}
              onChange={(e) => handleChange(filter.id, e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={filter.options?.find(opt => opt.value === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(values[filter.id] || []).indexOf(option.value) > -1} />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={filter.label}
              value={values[filter.id] || null}
              onChange={(date) => handleChange(filter.id, date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </LocalizationProvider>
        );

      case 'dateRange':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DatePicker
                label={`${filter.label} From`}
                value={values[filter.id]?.from || null}
                onChange={(date) => handleChange(filter.id, { ...values[filter.id], from: date })}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label={`${filter.label} To`}
                value={values[filter.id]?.to || null}
                onChange={(date) => handleChange(filter.id, { ...values[filter.id], to: date })}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </Box>
          </LocalizationProvider>
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={filter.label}
            value={values[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
            size="small"
            InputProps={{
              inputProps: { min: filter.min, max: filter.max, step: filter.step }
            }}
          />
        );

      case 'range':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {filter.label}: {values[filter.id] || [filter.min, filter.max]}
            </Typography>
            <Slider
              value={values[filter.id] || [filter.min, filter.max]}
              onChange={(_, value) => handleChange(filter.id, value)}
              valueLabelDisplay="auto"
              min={filter.min}
              max={filter.max}
              step={filter.step}
            />
          </Box>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={values[filter.id] || false}
                onChange={(e) => handleChange(filter.id, e.target.checked)}
              />
            }
            label={filter.label}
          />
        );

      case 'checkbox':
        return (
          <FormControl component="fieldset">
            <Typography variant="body2" gutterBottom>
              {filter.label}
            </Typography>
            <FormGroup>
              {filter.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={(values[filter.id] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = values[filter.id] || [];
                        if (e.target.checked) {
                          handleChange(filter.id, [...currentValues, option.value]);
                        } else {
                          handleChange(filter.id, currentValues.filter((v: string) => v !== option.value));
                        }
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper elevation={1}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Badge badgeContent={activeFiltersCount} color="primary">
              <FilterIcon />
            </Badge>
            <Typography sx={{ ml: 2 }}>Advanced Filters</Typography>
            {activeFiltersCount > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Saved Presets */}
            {showPresets && savedPresets.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Saved Presets
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {savedPresets.map((preset, index) => (
                      <Chip
                        key={index}
                        label={preset.name}
                        onClick={() => handleLoadPreset(preset)}
                        icon={<RestoreIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>
            )}

            {/* Filter Fields */}
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md={4} key={filter.id}>
                {renderFilter(filter)}
              </Grid>
            ))}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<FilterIcon />}
                    onClick={handleApply}
                    sx={{ mr: 1 }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                  >
                    Clear All
                  </Button>
                </Box>
                {onSavePreset && (
                  <Box>
                    {showSavePreset ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          placeholder="Preset name"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                        />
                        <Button
                          size="small"
                          onClick={handleSavePreset}
                          disabled={!presetName}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setShowSavePreset(false);
                            setPresetName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="text"
                        startIcon={<SaveIcon />}
                        onClick={() => setShowSavePreset(true)}
                      >
                        Save as Preset
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AdvancedFilters;
