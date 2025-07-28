import { format, parseISO, addDays, subDays, isAfter, isBefore, differenceInDays, startOfDay, endOfDay } from 'date-fns';

export class DateUtil {
  /**
   * Format date to string
   */
  static formatDate(date: Date | string, formatString: string = 'yyyy-MM-dd'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  }

  /**
   * Format date time to string
   */
  static formatDateTime(date: Date | string, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  }

  /**
   * Add days to date
   */
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  }

  /**
   * Subtract days from date
   */
  static subtractDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return subDays(dateObj, days);
  }

  /**
   * Check if date is after another date
   */
  static isAfter(date: Date | string, dateToCompare: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const compareObj = typeof dateToCompare === 'string' ? parseISO(dateToCompare) : dateToCompare;
    return isAfter(dateObj, compareObj);
  }

  /**
   * Check if date is before another date
   */
  static isBefore(date: Date | string, dateToCompare: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const compareObj = typeof dateToCompare === 'string' ? parseISO(dateToCompare) : dateToCompare;
    return isBefore(dateObj, compareObj);
  }

  /**
   * Get difference in days between two dates
   */
  static getDifferenceInDays(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return differenceInDays(end, start);
  }

  /**
   * Check if date is expired
   */
  static isExpired(expiryDate: Date | string): boolean {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    return isAfter(new Date(), expiry);
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfDay(dateObj);
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfDay(dateObj);
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Convert timestamp to date
   */
  static timestampToDate(timestamp: number): Date {
    return new Date(timestamp);
  }

  /**
   * Check if date is within range
   */
  static isWithinRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return isAfter(dateObj, start) && isBefore(dateObj, end);
  }

  /**
   * Format relative time (e.g., "2 days ago")
   */
  static getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInDays = differenceInDays(now, dateObj);

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
}
