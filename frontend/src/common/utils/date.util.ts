import { format, parseISO, isValid, differenceInDays, addDays, subDays } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formatDateForDisplay = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy');
};

export const formatDateTimeForDisplay = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const isDateExpired = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return false;
    }
    return differenceInDays(dateObj, new Date()) < 0;
  } catch (error) {
    return false;
  }
};

export const getDaysUntilExpiry = (date: string | Date): number => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 0;
    }
    return differenceInDays(dateObj, new Date());
  } catch (error) {
    return 0;
  }
};

export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

export const subtractDaysFromDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
};

export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const startDateObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endDateObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(dateObj) || !isValid(startDateObj) || !isValid(endDateObj)) {
      return false;
    }
    
    return dateObj >= startDateObj && dateObj <= endDateObj;
  } catch (error) {
    return false;
  }
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const getCurrentDateTime = (): string => {
  return formatDateTime(new Date());
};

// Export as DateUtil object for compatibility
export const DateUtil = {
  formatDate,
  formatDateTime,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  isDateExpired,
  getDaysUntilExpiry,
  addDaysToDate,
  subtractDaysFromDate,
  isDateInRange,
  getCurrentDate,
  getCurrentDateTime,
};
