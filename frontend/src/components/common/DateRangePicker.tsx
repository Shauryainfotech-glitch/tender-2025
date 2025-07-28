import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Popover,
  Typography,
  Grid,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  addDays,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  format?: string;
  showPresets?: boolean;
  customPresets?: { label: string; getValue: () => DateRange }[];
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  format: dateFormat = 'dd/MM/yyyy',
  showPresets = true,
  customPresets = [],
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [activePreset, setActivePreset] = useState<string>('');

  const open = Boolean(anchorEl);

  const defaultPresets = [
    { label: 'Today', getValue: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Yesterday', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 1)), endDate: endOfDay(subDays(new Date(), 1)) }) },
    { label: 'Last 7 days', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 6)), endDate: endOfDay(new Date()) }) },
    { label: 'Last 30 days', getValue: () => ({ startDate: startOfDay(subDays(new Date(), 29)), endDate: endOfDay(new Date()) }) },
    { label: 'This week', getValue: () => ({ startDate: startOfWeek(new Date()), endDate: endOfWeek(new Date()) }) },
    { label: 'Last week', getValue: () => ({ startDate: startOfWeek(subWeeks(new Date(), 1)), endDate: endOfWeek(subWeeks(new Date(), 1)) }) },
    { label: 'This month', getValue: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
    { label: 'Last month', getValue: () => ({ startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'This quarter', getValue: () => ({ startDate: startOfQuarter(new Date()), endDate: endOfQuarter(new Date()) }) },
    { label: 'Last quarter', getValue: () => ({ startDate: startOfQuarter(subMonths(new Date(), 3)), endDate: endOfQuarter(subMonths(new Date(), 3)) }) },
    { label: 'This year', getValue: () => ({ startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) }) },
    { label: 'Last year', getValue: () => ({ startDate: startOfYear(subYears(new Date(), 1)), endDate: endOfYear(subYears(new Date(), 1)) }) },
  ];

  const presets = [...defaultPresets, ...customPresets];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setTempRange(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActivePreset('');
  };

  const handleApply = () => {
    onChange(tempRange);
    handleClose();
  };

  const handleCancel = () => {
    setTempRange(value);
    handleClose();
  };

  const handlePresetClick = (preset: { label: string; getValue: () => DateRange }) => {
    const range = preset.getValue();
    setTempRange(range);
    setActivePreset(preset.label);
  };

  const handleStartDateChange = (date: Date | null) => {
    setTempRange({ ...tempRange, startDate: date });
    setActivePreset('');
  };

  const handleEndDateChange = (date: Date | null) => {
    setTempRange({ ...tempRange, endDate: date });
    setActivePreset('');
  };

  const getDisplayText = () => {
    if (!value.startDate && !value.endDate) {
      return 'Select date range';
    }
    if (value.startDate && !value.endDate) {
      return `From ${format(value.startDate, dateFormat)}`;
    }
    if (!value.startDate && value.endDate) {
      return `Until ${format(value.endDate, dateFormat)}`;
    }
    if (value.startDate && value.endDate) {
      if (isEqual(value.startDate, value.endDate)) {
        return format(value.startDate, dateFormat);
      }
      return `${format(value.startDate, dateFormat)} - ${format(value.endDate, dateFormat)}`;
    }
    return '';
  };

  const validateDateRange = () => {
    if (tempRange.startDate && tempRange.endDate) {
      return !isAfter(tempRange.startDate, tempRange.endDate);
    }
    return true;
  };

  const getMinEndDate = () => {
    if (tempRange.startDate) {
      return minDate && isAfter(minDate, tempRange.startDate) ? minDate : tempRange.startDate;
    }
    return minDate;
  };

  const getMaxStartDate = () => {
    if (tempRange.endDate) {
      return maxDate && isBefore(maxDate, tempRange.endDate) ? maxDate : tempRange.endDate;
    }
    return maxDate;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Button
          variant="outlined"
          onClick={handleClick}
          disabled={disabled}
          startIcon={<DateRangeIcon />}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            minWidth: 250,
            color: value.startDate || value.endDate ? 'text.primary' : 'text.secondary',
          }}
        >
          {getDisplayText()}
        </Button>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Paper sx={{ p: 3, minWidth: 600 }}>
            <Grid container spacing={3}>
              {/* Presets */}
              {showPresets && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Selection
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={activePreset === preset.label ? 'contained' : 'text'}
                        size="small"
                        onClick={() => handlePresetClick(preset)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Date Pickers */}
              <Grid item xs={12} md={showPresets ? 8 : 12}>
                <Typography variant="subtitle2" gutterBottom>
                  Custom Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={tempRange.startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={minDate}
                      maxDate={getMaxStartDate()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={tempRange.endDate}
                      onChange={handleEndDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={getMinEndDate()}
                      maxDate={maxDate}
                    />
                  </Grid>
                </Grid>

                {/* Quick Actions */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setTempRange({ startDate: null, endDate: null })}
                    >
                      Clear
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const today = new Date();
                        setTempRange({ startDate: startOfDay(today), endDate: endOfDay(today) });
                      }}
                      startIcon={<TodayIcon />}
                    >
                      Today
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (tempRange.startDate) {
                          setTempRange({
                            startDate: tempRange.startDate,
                            endDate: addDays(tempRange.startDate, 7),
                          });
                        }
                      }}
                      disabled={!tempRange.startDate}
                    >
                      +7 Days
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (tempRange.startDate) {
                          setTempRange({
                            startDate: tempRange.startDate,
                            endDate: addDays(tempRange.startDate, 30),
                          });
                        }
                      }}
                      disabled={!tempRange.startDate}
                    >
                      +30 Days
                    </Button>
                  </Box>
                </Box>

                {/* Selected Range Display */}
                {(tempRange.startDate || tempRange.endDate) && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Selected Range:
                    </Typography>
                    <Typography variant="body1">
                      {tempRange.startDate && format(tempRange.startDate, 'PPP')}
                      {tempRange.startDate && tempRange.endDate && ' - '}
                      {tempRange.endDate && format(tempRange.endDate, 'PPP')}
                    </Typography>
                    {tempRange.startDate && tempRange.endDate && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {Math.ceil((tempRange.endDate.getTime() - tempRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleApply}
                disabled={!validateDateRange()}
              >
                Apply
              </Button>
            </Box>
          </Paper>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
